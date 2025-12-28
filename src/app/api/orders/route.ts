// Orders API - Handle Vapi tool calls and save to Supabase
// Accepts Vapi Server Message format with toolCallList

import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrdersForCall } from "@/lib/database";

// Vapi Tool Call structure - handles both formats
interface VapiToolCall {
    id: string;
    type?: "function";
    // Direct properties (actual Vapi format)
    name?: string;
    arguments?: Record<string, unknown> | string;
    // Nested under function (alternative format)
    function?: {
        name: string;
        arguments: Record<string, unknown> | string;
    };
}

// Vapi Server Message structure for tool calls
interface VapiToolCallMessage {
    message?: {
        type: string;
        toolCallList?: VapiToolCall[];
        call?: {
            id: string;
        };
    };
    // Alternative flat structure
    toolCallList?: VapiToolCall[];
    call?: {
        id: string;
    };
}

// POST /api/orders - Handle Vapi create_order tool call
export async function POST(request: NextRequest) {
    try {
        const body: VapiToolCallMessage = await request.json();

        console.log("[Orders API] Received:", JSON.stringify(body, null, 2));

        // Extract tool calls from Vapi's nested structure
        const toolCallList = body.message?.toolCallList || body.toolCallList || [];
        const callId = body.message?.call?.id || body.call?.id;

        if (toolCallList.length === 0) {
            return NextResponse.json(
                { error: "No tool calls found in request" },
                { status: 400 }
            );
        }

        // Process each tool call and collect results
        const results: { toolCallId: string; result: string }[] = [];

        for (const toolCall of toolCallList) {
            const toolCallId = toolCall.id;

            // Handle both Vapi formats: direct properties OR nested under function
            const toolName = toolCall.name || toolCall.function?.name;
            const rawArgs = toolCall.arguments || toolCall.function?.arguments;

            // Handle arguments - may be string or object
            const args = typeof rawArgs === 'string'
                ? JSON.parse(rawArgs)
                : rawArgs || {};

            console.log(`[Orders API] Processing: ${toolName}`, args);

            // Only handle create_order tool
            if (toolName === "create_order") {
                const { call_id, order_details } = args as {
                    call_id?: string;
                    order_details?: {
                        items?: string;
                        total?: string;
                        delivery_address?: string;
                    };
                };

                // Use call_id from args, or fall back to the call object
                const finalCallId = call_id || callId;

                if (!finalCallId) {
                    results.push({
                        toolCallId,
                        result: "Error: No call ID provided. Please try again."
                    });
                    continue;
                }

                if (!order_details) {
                    results.push({
                        toolCallId,
                        result: "Error: No order details provided. Please collect items, total, and delivery address."
                    });
                    continue;
                }

                const { items, total, delivery_address } = order_details;

                // Validate required fields
                if (!items || !total || !delivery_address) {
                    const missing = [];
                    if (!items) missing.push("items");
                    if (!total) missing.push("total");
                    if (!delivery_address) missing.push("delivery address");

                    results.push({
                        toolCallId,
                        result: `I need the following information to complete the order: ${missing.join(", ")}. Could you please provide that?`
                    });
                    continue;
                }

                try {
                    // Save to Supabase
                    const order = await createOrder({
                        call_id: finalCallId,
                        order_details: {
                            items,
                            total,
                            delivery_address,
                            created_at: new Date().toISOString(),
                        },
                    });

                    console.log("[Orders API] Order created:", order);

                    results.push({
                        toolCallId,
                        result: `Perfect! Your order has been confirmed. You ordered: ${items}. The total is ${total} and it will be delivered to ${delivery_address}. Thank you for your order!`
                    });
                } catch (dbError) {
                    console.error("[Orders API] Database error:", dbError);
                    results.push({
                        toolCallId,
                        result: "I'm sorry, there was an issue saving your order. Please try again in a moment."
                    });
                }
            } else {
                // Unknown tool - return generic response
                results.push({
                    toolCallId,
                    result: `Tool ${toolName} is not supported by this endpoint.`
                });
            }
        }

        // Return Vapi-compatible response with toolCallId
        return NextResponse.json({ results });

    } catch (error) {
        console.error("[Orders API Error]", error);
        return NextResponse.json(
            { error: "Failed to process order request" },
            { status: 500 }
        );
    }
}

// GET /api/orders?call_id=xxx - Get orders for a call
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const callId = searchParams.get("call_id");

        if (!callId) {
            return NextResponse.json(
                { error: "call_id query param required" },
                { status: 400 }
            );
        }

        const orders = await getOrdersForCall(callId);
        return NextResponse.json({ orders });
    } catch (error) {
        console.error("[Orders API Error]", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}

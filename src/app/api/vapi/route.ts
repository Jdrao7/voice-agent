// VAPI Webhook Handler
// Receives call events from VAPI and processes them

import { NextRequest, NextResponse } from "next/server";
import { checkUserMessage, getEscalationResponse } from "@/lib/guardrails";

// Check if Supabase is configured
function isSupabaseConfigured(): boolean {
    return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}

// VAPI Webhook Event Structure (based on VAPI docs)
interface VapiMessage {
    type: string;
    call?: {
        id: string;
        orgId?: string;
        createdAt?: string;
        status?: string;
        phoneNumber?: {
            number: string;
        };
        customer?: {
            number: string;
        };
        assistant?: {
            id: string;
            name: string;
        };
    };
    artifact?: {
        transcript?: string;
        messages?: Array<{
            role: "user" | "assistant" | "system";
            content: string;
            time?: number;
        }>;
        recordingUrl?: string;
    };
    // For transcript events
    role?: "user" | "assistant";
    transcript?: string;
    // For function calls
    functionCall?: {
        name: string;
        parameters: Record<string, unknown>;
    };
}

// Vapi Tool Call structure (for tool-calls event)
interface VapiToolCall {
    id: string;
    type: "function";
    function: {
        name: string;
        arguments: Record<string, unknown> | string;
    };
}

export async function POST(request: NextRequest) {
    try {
        const message: VapiMessage = await request.json();

        console.log("[VAPI Webhook]", message.type, JSON.stringify(message, null, 2));

        // Handle different message types
        switch (message.type) {
            // Call lifecycle events
            case "call.started":
            case "call-start": {
                if (message.call?.id && isSupabaseConfigured()) {
                    const { createCall } = await import("@/lib/database");
                    const phoneNumber = message.call.customer?.number ||
                        message.call.phoneNumber?.number;
                    await createCall({
                        id: message.call.id,
                        phone_number: phoneNumber,
                    });
                    console.log("[VAPI] Call started:", message.call.id);
                }
                return NextResponse.json({ success: true });
            }

            case "call.ended":
            case "call-end": {
                if (message.call?.id && isSupabaseConfigured()) {
                    const { updateCallStatus } = await import("@/lib/database");

                    // Save final transcript if available
                    const summary = message.artifact?.transcript;
                    await updateCallStatus(message.call.id, "handled", summary);
                    console.log("[VAPI] Call ended:", message.call.id);
                }
                return NextResponse.json({ success: true });
            }

            // Real-time transcript events
            case "transcript": {
                if (message.call?.id && message.transcript && message.role) {
                    // Run guardrails on user messages
                    if (message.role === "user") {
                        const guardrailsResult = checkUserMessage(message.transcript);

                        if (guardrailsResult.shouldEscalate) {
                            console.log("[VAPI] Escalation triggered:", guardrailsResult.reason);

                            // Save handoff if Supabase is configured
                            if (isSupabaseConfigured()) {
                                const { createHandoff } = await import("@/lib/database");
                                await createHandoff({
                                    call_id: message.call.id,
                                    reason: guardrailsResult.reason || "User requested escalation",
                                    customer_sentiment: "requires_attention",
                                });
                            }

                            // Return escalation response for VAPI
                            return NextResponse.json({
                                results: [{
                                    result: getEscalationResponse(),
                                }]
                            });
                        }
                    }

                    // Save transcript message if Supabase is configured
                    if (isSupabaseConfigured()) {
                        const { addTranscriptMessage } = await import("@/lib/database");
                        await addTranscriptMessage(message.call.id, {
                            role: message.role,
                            content: message.transcript,
                            timestamp: Date.now(),
                        });
                    }
                }
                return NextResponse.json({ success: true });
            }

            // Assistant request (VAPI asks for response)
            case "assistant-request": {
                // This is where VAPI asks what the assistant should say
                // The assistant config is already set in VAPI dashboard
                return NextResponse.json({});
            }

            // Function/Tool calls from assistant
            case "function-call":
            case "tool-calls": {
                // Extract tool calls from the Vapi Server Message structure
                // Vapi sends toolCallList array in body.message
                const toolCallList = (message as unknown as { message?: { toolCallList?: VapiToolCall[] } }).message?.toolCallList
                    || (message as unknown as { toolCallList?: VapiToolCall[] }).toolCallList
                    || [];

                console.log("[VAPI] Tool calls received:", JSON.stringify(toolCallList, null, 2));

                // Process each tool call and collect results
                const results: { toolCallId: string; result: string }[] = [];

                for (const toolCall of toolCallList) {
                    const { id: toolCallId, function: func } = toolCall;

                    // Handle arguments - may be string or object
                    const args = typeof func.arguments === 'string'
                        ? JSON.parse(func.arguments)
                        : func.arguments;

                    console.log(`[VAPI] Processing tool: ${func.name}`, args);

                    try {
                        switch (func.name) {
                            case "create_order": {
                                const { call_id, order_details } = args;
                                const { items, total, delivery_address } = order_details || {};

                                console.log(`[VAPI] Creating order for call ${call_id}:`, { items, total, delivery_address });

                                // Save to database if Supabase is configured
                                if (isSupabaseConfigured() && call_id) {
                                    const { createOrder } = await import("@/lib/database");
                                    await createOrder({
                                        call_id,
                                        order_details: order_details || { items, total, delivery_address },
                                    });
                                }

                                results.push({
                                    toolCallId,
                                    result: `Order confirmed! ${items || 'Your items'} totaling ${total || 'the amount'} will be delivered to ${delivery_address || 'your address'}.`
                                });
                                break;
                            }

                            case "escalate_to_human": {
                                const { reason, urgency } = args;

                                if (isSupabaseConfigured() && message.call?.id) {
                                    const { createHandoff, updateCallStatus } = await import("@/lib/database");
                                    await createHandoff({
                                        call_id: message.call.id,
                                        reason: reason || "Customer requested human agent",
                                        customer_sentiment: urgency || "normal",
                                    });
                                    await updateCallStatus(message.call.id, "escalated");
                                }

                                results.push({
                                    toolCallId,
                                    result: "I'm connecting you with a human representative now. Please hold."
                                });
                                break;
                            }

                            case "check_order_status": {
                                const { order_id } = args;
                                // TODO: Implement order status lookup
                                results.push({
                                    toolCallId,
                                    result: `Order ${order_id} is being processed and will be ready soon.`
                                });
                                break;
                            }

                            default:
                                console.log(`[VAPI] Unknown tool: ${func.name}`);
                                results.push({
                                    toolCallId,
                                    result: `Tool ${func.name} executed successfully.`
                                });
                        }
                    } catch (toolError) {
                        console.error(`[VAPI] Tool error for ${func.name}:`, toolError);
                        results.push({
                            toolCallId,
                            result: "I encountered an issue processing that request. Let me try another way."
                        });
                    }
                }

                // CRITICAL: Return results with toolCallId so Vapi knows which calls were handled
                return NextResponse.json({ results });
            }

            // Speech updates (optional)
            case "speech-update": {
                // Voice activity detection events
                return NextResponse.json({ success: true });
            }

            // End of call report (includes structured outputs)
            case "end-of-call-report": {
                console.log("[VAPI] End of call report received");
                // This contains the structured outputs you configured
                // message.artifact?.structuredData contains the extracted data
                return NextResponse.json({ success: true });
            }

            default:
                console.log("[VAPI] Unhandled event type:", message.type);
                return NextResponse.json({ success: true });
        }
    } catch (error) {
        console.error("[VAPI Webhook Error]", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}

// Health check - VAPI may ping this to verify the endpoint
export async function GET() {
    return NextResponse.json({
        status: "ok",
        service: "personavoice-vapi-webhook",
        timestamp: new Date().toISOString(),
        supabase_configured: isSupabaseConfigured(),
    });
}

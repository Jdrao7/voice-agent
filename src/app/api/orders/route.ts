// Orders API - Create orders from calls

import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrdersForCall, getCall } from "@/lib/database";
import { CreateOrderSchema } from "@/lib/types";

// POST /api/orders - Create order from call
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const result = CreateOrderSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid request", details: result.error.issues },
                { status: 400 }
            );
        }

        // Check call exists
        const call = await getCall(result.data.call_id);
        if (!call) {
            return NextResponse.json(
                { error: "Call not found" },
                { status: 404 }
            );
        }

        // Create order
        const order = await createOrder({
            call_id: result.data.call_id,
            order_details: result.data.order_details,
        });

        return NextResponse.json({ order });
    } catch (error) {
        console.error("[Orders API Error]", error);
        return NextResponse.json(
            { error: "Failed to create order" },
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

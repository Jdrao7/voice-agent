// Calls API - List and manage calls

import { NextRequest, NextResponse } from "next/server";
import { Call } from "@/lib/types";

// Mock data for demo (when Supabase is not configured)
const MOCK_CALLS: Call[] = [
    {
        id: "call-001",
        phone_number: "+1 555-0123",
        transcript: [
            { role: "assistant", content: "Hello! Thanks for calling. How can I help you today?", timestamp: Date.now() - 300000 },
            { role: "user", content: "Hi, I'd like to place an order for delivery", timestamp: Date.now() - 290000 },
            { role: "assistant", content: "I'd be happy to help you with that. What would you like to order?", timestamp: Date.now() - 280000 },
            { role: "user", content: "Two large pepperoni pizzas and a side of garlic bread", timestamp: Date.now() - 270000 },
            { role: "assistant", content: "Great choice! Two large pepperoni pizzas and garlic bread. Can I get your delivery address?", timestamp: Date.now() - 260000 },
            { role: "user", content: "123 Main Street, Apartment 4B", timestamp: Date.now() - 250000 },
        ],
        summary: "Order: 2x Large Pepperoni Pizza, 1x Garlic Bread. Delivery to 123 Main St, Apt 4B. Total: $42.50",
        intent: "order",
        status: "new",
        needs_human: false,
        created_at: new Date(Date.now() - 300000).toISOString(),
    },
    {
        id: "call-002",
        phone_number: "+1 555-0456",
        transcript: [
            { role: "assistant", content: "Hello! How can I assist you?", timestamp: Date.now() - 600000 },
            { role: "user", content: "My order arrived cold and I'm extremely disappointed!", timestamp: Date.now() - 590000 },
            { role: "user", content: "I want to speak to a manager right now!", timestamp: Date.now() - 580000 },
            { role: "assistant", content: "I completely understand your frustration. Let me connect you with a team member who can resolve this.", timestamp: Date.now() - 570000 },
        ],
        summary: "COMPLAINT: Order arrived cold. Customer very upset. Requested manager.",
        intent: "complaint",
        status: "escalated",
        needs_human: true,
        created_at: new Date(Date.now() - 600000).toISOString(),
    },
    {
        id: "call-003",
        phone_number: "+1 555-0789",
        transcript: [
            { role: "assistant", content: "Hello! Thanks for calling.", timestamp: Date.now() - 900000 },
            { role: "user", content: "What time do you close tonight?", timestamp: Date.now() - 890000 },
            { role: "assistant", content: "We're open until 10 PM tonight. Is there anything else I can help you with?", timestamp: Date.now() - 880000 },
            { role: "user", content: "No that's all, thanks!", timestamp: Date.now() - 870000 },
        ],
        summary: "General inquiry: Asked about closing time",
        intent: "inquiry",
        status: "handled",
        needs_human: false,
        created_at: new Date(Date.now() - 900000).toISOString(),
    },
];

// Check if Supabase is configured
function isSupabaseConfigured(): boolean {
    return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}

// GET /api/calls - List all calls
export async function GET() {
    try {
        if (!isSupabaseConfigured()) {
            // Return mock data for demo
            return NextResponse.json({
                calls: MOCK_CALLS,
                _demo: true,
                _message: "Using mock data. Configure Supabase for real data."
            });
        }

        // Use real database
        const { getAllCalls } = await import("@/lib/database");
        const calls = await getAllCalls();
        return NextResponse.json({ calls });
    } catch (error) {
        console.error("[Calls API Error]", error);
        // Fallback to mock data on error
        return NextResponse.json({
            calls: MOCK_CALLS,
            _demo: true,
            _error: String(error)
        });
    }
}

// PUT /api/calls - Update call status
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { call_id, status, summary } = body;

        if (!call_id || !status) {
            return NextResponse.json(
                { error: "call_id and status required" },
                { status: 400 }
            );
        }

        if (!isSupabaseConfigured()) {
            // For demo, just return success
            return NextResponse.json({
                success: true,
                _demo: true,
                message: "Status updated (demo mode)"
            });
        }

        const { updateCallStatus, getCall } = await import("@/lib/database");
        await updateCallStatus(call_id, status, summary);
        const call = await getCall(call_id);

        return NextResponse.json({ call });
    } catch (error) {
        console.error("[Calls API Error]", error);
        return NextResponse.json(
            { error: "Failed to update call" },
            { status: 500 }
        );
    }
}

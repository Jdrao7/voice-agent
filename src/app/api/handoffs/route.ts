// Handoffs API - Get handoff context for human agents

import { NextRequest, NextResponse } from "next/server";
import { getHandoff, getPendingHandoffs, getCall } from "@/lib/database";

// GET /api/handoffs - List pending handoffs or get specific one
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const callId = searchParams.get("call_id");

        if (callId) {
            // Get specific handoff with full call context
            const handoff = await getHandoff(callId);
            const call = await getCall(callId);

            if (!handoff) {
                return NextResponse.json(
                    { error: "Handoff not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                handoff,
                call,
                // Format transcript for human readability
                formattedTranscript: call?.transcript
                    ?.map(m => `[${m.role.toUpperCase()}] ${m.content}`)
                    .join("\n\n"),
            });
        }

        // List all pending handoffs
        const handoffs = await getPendingHandoffs();
        return NextResponse.json({ handoffs });
    } catch (error) {
        console.error("[Handoffs API Error]", error);
        return NextResponse.json(
            { error: "Failed to fetch handoffs" },
            { status: 500 }
        );
    }
}

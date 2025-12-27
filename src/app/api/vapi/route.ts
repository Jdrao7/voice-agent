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
                console.log("[VAPI] Function call:", message.functionCall);

                // Handle custom functions here
                // Example: if (message.functionCall?.name === "create_order") {...}

                return NextResponse.json({
                    results: [{
                        result: "Function executed successfully",
                    }]
                });
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

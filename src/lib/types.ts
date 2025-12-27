// Core types for PersonaVoice AI
import { z } from "zod";

// Call status enum
export type CallStatus = "new" | "handled" | "escalated" | "order_made";

// Call record
export interface Call {
    id: string;
    phone_number: string | null;
    transcript: TranscriptMessage[];
    summary: string | null;
    intent: string | null;
    status: CallStatus;
    needs_human: boolean;
    created_at: string;
}

// Transcript message
export interface TranscriptMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

// Order from call
export interface Order {
    id: string;
    call_id: string;
    order_details: Record<string, unknown>;
    created_by: string | null;
    created_at: string;
}

// Handoff context for human
export interface Handoff {
    id: string;
    call_id: string;
    context: string;
    customer_sentiment: string | null;
    reason: string;
    assigned_to: string | null;
    created_at: string;
}

// Guardrails result
export interface GuardrailsResult {
    isAllowed: boolean;
    reason?: string;
    shouldEscalate: boolean;
}

// VAPI webhook event types
export type VapiEventType =
    | "call-start"
    | "call-end"
    | "speech-update"
    | "transcript"
    | "function-call"
    | "hang"
    | "tool-calls";

export interface VapiWebhookEvent {
    type: VapiEventType;
    call?: {
        id: string;
        phoneNumber?: string;
        status: string;
    };
    transcript?: string;
    role?: "user" | "assistant";
    timestamp?: number;
}

// Assistant config for VAPI
export interface AssistantConfig {
    name: string;
    firstMessage: string;
    systemPrompt: string;
    voice: {
        provider: string;
        voiceId: string;
    };
}

// Validation schemas
export const CreateOrderSchema = z.object({
    call_id: z.string().uuid(),
    order_details: z.record(z.unknown()),
});

export const EscalateCallSchema = z.object({
    call_id: z.string().uuid(),
    reason: z.string(),
    context: z.string().optional(),
});

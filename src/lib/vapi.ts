// VAPI Configuration and Helpers
import { AssistantConfig } from "./types";

// System prompt for the conversation agent
const SYSTEM_PROMPT = `You are a professional customer service representative for a business.

## YOUR ROLE
- Answer customer inquiries professionally and helpfully
- Collect relevant information from customers
- Help with orders, scheduling, and general questions
- Keep responses conversational but concise (1-3 sentences)

## CONVERSATION RULES
- Speak naturally, like a friendly professional
- Listen actively and acknowledge customer concerns
- Never use markdown, bullet points, or formatting (this is voice)
- If you don't know something, say so honestly

## BOUNDARIES - You must NEVER:
- Give legal, medical, or financial advice
- Share competitor information or pricing
- Make promises about refunds over $100
- Discuss internal company policies in detail

## ESCALATION - Offer to transfer to a human if:
- Customer explicitly asks for a manager/human
- The issue is complex and beyond your scope
- Customer seems frustrated or upset
- The request involves sensitive personal data

When escalating, say: "I understand this is important. Let me connect you with a specialist who can better assist you."`;

// Default assistant configuration
export function getAssistantConfig(overrides?: Partial<AssistantConfig>): AssistantConfig {
    return {
        name: "PersonaVoice Assistant",
        firstMessage: "Hello! Thanks for calling. How can I help you today?",
        systemPrompt: SYSTEM_PROMPT,
        voice: {
            provider: "playht",
            voiceId: "jennifer",
        },
        ...overrides,
    };
}

// Create VAPI assistant payload for API
export function createAssistantPayload(config: AssistantConfig) {
    return {
        name: config.name,
        firstMessage: config.firstMessage,
        model: {
            provider: "groq",
            model: "llama-3.3-70b-versatile",
            systemPrompt: config.systemPrompt,
            temperature: 0.7,
        },
        voice: config.voice,
        silenceTimeoutSeconds: 30,
        maxDurationSeconds: 600,
        backgroundSound: "off",
        backchannelingEnabled: true,
        serverUrl: process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL}/api/vapi`
            : undefined,
    };
}

// Parse VAPI webhook signature for security
export function verifyVapiWebhook(
    body: string,
    signature: string | null,
    secret: string
): boolean {
    if (!signature || !secret) return false;

    // In production, implement proper HMAC verification
    // For now, we'll trust requests with valid structure
    return true;
}

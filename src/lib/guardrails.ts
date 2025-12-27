// Guardrails Agent - Agent 2: Safety Check
// Validates AI responses before sending to customer

import { GuardrailsResult } from "./types";

// Forbidden topics - AI must NEVER discuss these
const FORBIDDEN_TOPICS = [
    "competitor pricing",
    "internal company information",
    "employee personal details",
    "legal advice",
    "medical diagnosis",
    "financial investment advice",
    "political opinions",
    "illegal activities",
];

// Escalation triggers - immediately hand off to human
const ESCALATION_TRIGGERS = [
    "speak to manager",
    "speak to human",
    "talk to a person",
    "real person",
    "supervisor",
    "complaint",
    "lawsuit",
    "lawyer",
    "very angry",
    "furious",
    "unacceptable",
];

// Sensitive patterns that need human review
const SENSITIVE_PATTERNS = [
    /refund.*\$?\d{3,}/i,  // Large refund requests
    /cancel.*account/i,
    /delete.*data/i,
    /emergency/i,
    /urgent.*help/i,
];

/**
 * Check if user message should trigger escalation
 */
export function checkUserMessage(message: string): GuardrailsResult {
    const lowerMessage = message.toLowerCase();

    // Check escalation triggers
    for (const trigger of ESCALATION_TRIGGERS) {
        if (lowerMessage.includes(trigger.toLowerCase())) {
            return {
                isAllowed: true,
                shouldEscalate: true,
                reason: `Customer requested escalation: "${trigger}"`,
            };
        }
    }

    // Check sensitive patterns
    for (const pattern of SENSITIVE_PATTERNS) {
        if (pattern.test(message)) {
            return {
                isAllowed: true,
                shouldEscalate: true,
                reason: `Sensitive topic detected: ${pattern.source}`,
            };
        }
    }

    return { isAllowed: true, shouldEscalate: false };
}

/**
 * Check if AI response is safe to send
 */
export function checkAIResponse(response: string): GuardrailsResult {
    const lowerResponse = response.toLowerCase();

    // Check forbidden topics
    for (const topic of FORBIDDEN_TOPICS) {
        if (lowerResponse.includes(topic.toLowerCase())) {
            return {
                isAllowed: false,
                shouldEscalate: true,
                reason: `AI attempted to discuss forbidden topic: ${topic}`,
            };
        }
    }

    // Check for promises AI shouldn't make
    const dangerousPromises = [
        /i guarantee/i,
        /i promise.*refund/i,
        /100% sure/i,
        /legally.*entitled/i,
    ];

    for (const pattern of dangerousPromises) {
        if (pattern.test(response)) {
            return {
                isAllowed: false,
                shouldEscalate: false,
                reason: `AI made dangerous promise: ${pattern.source}`,
            };
        }
    }

    return { isAllowed: true, shouldEscalate: false };
}

/**
 * Generate safe escalation response
 */
export function getEscalationResponse(): string {
    return "I understand this is important to you. Let me connect you with a team member who can better assist you. They'll have all the context from our conversation. Please hold for just a moment.";
}

/**
 * Generate safe refusal response
 */
export function getRefusalResponse(): string {
    return "I'm not able to help with that specific request, but I'd be happy to assist you with something else or connect you with a specialist.";
}

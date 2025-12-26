import Groq from "groq-sdk";
import { Message, DEFAULT_AGENT, VoiceAgentError, AgentPersona } from "./types";

// Lazy initialization to avoid build-time errors
function getGroqClient(): Groq {
    if (!process.env.GROQ_API_KEY) {
        throw new VoiceAgentError(
            "GROQ_API_KEY environment variable is not set",
            "MISSING_API_KEY"
        );
    }
    return new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });
}

export interface AgentResponse {
    content: string;
    tokensUsed: number;
}

/**
 * Process user message with LLM and return agent response
 * @param userMessage - The user's transcribed message
 * @param conversationHistory - Previous conversation messages
 * @param persona - Optional custom agent persona
 * @returns Agent response with content and token usage
 */
export async function processWithAgent(
    userMessage: string,
    conversationHistory: Message[] = [],
    persona: AgentPersona = DEFAULT_AGENT
): Promise<AgentResponse> {
    try {
        // Build messages array for the LLM
        const messages: Groq.Chat.ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: persona.systemPrompt,
            },
            // Add conversation history (last 10 messages for context)
            ...conversationHistory.slice(-10).map((msg) => ({
                role: msg.role as "user" | "assistant",
                content: msg.content,
            })),
            // Add current user message
            {
                role: "user" as const,
                content: userMessage,
            },
        ];

        const groq = getGroqClient();
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.7,
            max_tokens: 256, // Keep responses concise for voice
            top_p: 0.9,
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw new VoiceAgentError(
                "No response generated from LLM",
                "EMPTY_RESPONSE"
            );
        }

        return {
            content: content.trim(),
            tokensUsed: completion.usage?.total_tokens || 0,
        };
    } catch (error) {
        if (error instanceof VoiceAgentError) {
            throw error;
        }

        console.error("LLM Error:", error);
        throw new VoiceAgentError(
            "Failed to generate response",
            "LLM_ERROR"
        );
    }
}

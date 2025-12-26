import { z } from "zod";

// Message schemas
export const MessageRoleSchema = z.enum(["user", "assistant"]);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  role: MessageRoleSchema,
  content: z.string(),
  timestamp: z.number(),
  audioUrl: z.string().optional(),
});
export type Message = z.infer<typeof MessageSchema>;

// Voice API request/response schemas
export const VoiceRequestSchema = z.object({
  audio: z.instanceof(Blob).optional(),
  conversationHistory: z.array(MessageSchema).optional(),
});

export const VoiceResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      userTranscript: z.string(),
      agentResponse: z.string(),
      audioBase64: z.string(),
      audioMimeType: z.string(),
    })
    .optional(),
  error: z.string().optional(),
});
export type VoiceResponse = z.infer<typeof VoiceResponseSchema>;

// Agent configuration
export const AgentPersonaSchema = z.object({
  name: z.string(),
  systemPrompt: z.string(),
  voice: z.string(),
});
export type AgentPersona = z.infer<typeof AgentPersonaSchema>;

// Default agent persona
export const DEFAULT_AGENT: AgentPersona = {
  name: "Nova",
  systemPrompt: `You are Nova, a friendly and helpful AI voice assistant. You have a warm, conversational tone and speak naturally as if having a friendly chat. 

Key traits:
- Be concise but helpful - voice responses should be 1-3 sentences typically
- Be warm and personable
- If you don't know something, say so honestly
- Never use markdown formatting, bullet points, or code blocks - speak naturally
- Avoid saying "I'm an AI" unless directly asked

Remember: Your responses will be spoken aloud, so keep them conversational and natural.`,
  voice: "Fritz-PlayAI", // PlayAI voice option
};

// Recording state
export type RecordingState = "idle" | "recording" | "processing" | "playing";

// Error types
export class VoiceAgentError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = "VoiceAgentError";
  }
}

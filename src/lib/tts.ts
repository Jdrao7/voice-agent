import Groq from "groq-sdk";
import { VoiceAgentError, DEFAULT_AGENT } from "./types";

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

export interface TTSResult {
    audioBuffer: Buffer;
    mimeType: string;
}

/**
 * Generate speech from text using Groq's PlayAI TTS
 * @param text - Text to convert to speech
 * @param voice - Voice ID to use (default: Fritz-PlayAI)
 * @returns Audio buffer and MIME type
 */
export async function generateSpeech(
    text: string,
    voice: string = DEFAULT_AGENT.voice
): Promise<TTSResult> {
    try {
        const groq = getGroqClient();
        // Groq TTS API endpoint
        const response = await groq.audio.speech.create({
            model: "playai-tts",
            input: text,
            voice: voice,
            response_format: "wav",
        });

        // Get the audio data as ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);

        if (audioBuffer.length === 0) {
            throw new VoiceAgentError(
                "No audio generated from TTS",
                "EMPTY_AUDIO"
            );
        }

        return {
            audioBuffer,
            mimeType: "audio/wav",
        };
    } catch (error) {
        if (error instanceof VoiceAgentError) {
            throw error;
        }

        console.error("TTS Error:", error);
        throw new VoiceAgentError(
            "Failed to generate speech",
            "TTS_ERROR"
        );
    }
}

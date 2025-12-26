import Groq, { toFile } from "groq-sdk";
import { VoiceAgentError } from "./types";

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

/**
 * Transcribe audio using Groq's Whisper model
 * @param audioBuffer - Audio data as Buffer
 * @param mimeType - MIME type of the audio (e.g., "audio/webm")
 * @returns Transcribed text
 */
export async function transcribeAudio(
    audioBuffer: Buffer,
    mimeType: string
): Promise<string> {
    try {
        // Determine file extension from MIME type
        // Strip codecs info (e.g., "audio/webm;codecs=opus" -> "audio/webm")
        const baseMimeType = mimeType.split(";")[0];

        const extension = baseMimeType.includes("webm")
            ? "webm"
            : baseMimeType.includes("ogg")
                ? "ogg"
                : baseMimeType.includes("wav")
                    ? "wav"
                    : baseMimeType.includes("mp3")
                        ? "mp3"
                        : baseMimeType.includes("mp4")
                            ? "mp4"
                            : baseMimeType.includes("mpeg")
                                ? "mp3"
                                : "webm";

        console.log("STT processing:", {
            originalMimeType: mimeType,
            baseMimeType,
            extension,
            bufferSize: audioBuffer.length,
        });

        const groq = getGroqClient();

        // Use Groq's toFile helper for proper file handling
        const file = await toFile(audioBuffer, `recording.${extension}`, {
            type: baseMimeType,
        });

        const transcription = await groq.audio.transcriptions.create({
            file: file,
            model: "whisper-large-v3-turbo",
            response_format: "json",
            language: "en",
        });

        // Handle response - Groq returns { text: string } for json format
        const text = (transcription as { text: string }).text?.trim() || "";

        if (!text) {
            throw new VoiceAgentError(
                "No speech detected in audio",
                "EMPTY_TRANSCRIPTION"
            );
        }

        return text;
    } catch (error) {
        if (error instanceof VoiceAgentError) {
            throw error;
        }

        console.error("STT Error:", error);
        throw new VoiceAgentError(
            "Failed to transcribe audio",
            "STT_ERROR"
        );
    }
}


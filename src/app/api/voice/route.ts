import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/stt";
import { processWithAgent } from "@/lib/llm";
import { generateSpeech } from "@/lib/tts";
import { Message, VoiceAgentError } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30; // Allow up to 30 seconds for full pipeline

export async function POST(request: NextRequest) {
    try {
        // Parse form data
        const formData = await request.formData();
        const audioFile = formData.get("audio") as File | null;
        const historyJson = formData.get("conversationHistory") as string | null;

        // Validate audio
        if (!audioFile) {
            return NextResponse.json(
                {
                    success: false,
                    error: "No audio file provided",
                },
                { status: 400 }
            );
        }

        // Parse conversation history
        let conversationHistory: Message[] = [];
        if (historyJson) {
            try {
                conversationHistory = JSON.parse(historyJson);
            } catch {
                console.warn("Failed to parse conversation history");
            }
        }

        // Convert file to buffer
        const arrayBuffer = await audioFile.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);

        console.log("Processing audio:", {
            size: audioBuffer.length,
            type: audioFile.type,
        });

        // Step 1: Speech-to-Text
        const userTranscript = await transcribeAudio(audioBuffer, audioFile.type);
        console.log("Transcription:", userTranscript);

        // Step 2: LLM Processing
        const agentResponse = await processWithAgent(
            userTranscript,
            conversationHistory
        );
        console.log("Agent response:", agentResponse.content);

        // Step 3: Text-to-Speech
        const ttsResult = await generateSpeech(agentResponse.content);
        console.log("Generated audio:", ttsResult.audioBuffer.length, "bytes");

        // Convert audio to base64 for transport
        const audioBase64 = ttsResult.audioBuffer.toString("base64");

        return NextResponse.json({
            success: true,
            data: {
                userTranscript,
                agentResponse: agentResponse.content,
                audioBase64,
                audioMimeType: ttsResult.mimeType,
            },
        });
    } catch (error) {
        console.error("Voice API Error:", error);

        if (error instanceof VoiceAgentError) {
            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                    code: error.code,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: "An unexpected error occurred",
            },
            { status: 500 }
        );
    }
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, Phone, PhoneOff, AlertCircle } from "lucide-react";
import Vapi from "@vapi-ai/web";
import { TranscriptMessage } from "@/lib/types";

interface VapiButtonProps {
    assistantId?: string;
    publicKey: string;
    onTranscript?: (message: TranscriptMessage) => void;
    onCallStart?: () => void;
    onCallEnd?: () => void;
}

export function VapiButton({
    assistantId,
    publicKey,
    onTranscript,
    onCallStart,
    onCallEnd,
}: VapiButtonProps) {
    const vapiRef = useRef<Vapi | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [volume, setVolume] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Initialize VAPI
    useEffect(() => {
        if (!publicKey) return;

        const vapi = new Vapi(publicKey);
        vapiRef.current = vapi;

        // Event handlers
        vapi.on("call-start", () => {
            setIsActive(true);
            setIsConnecting(false);
            onCallStart?.();
        });

        vapi.on("call-end", () => {
            setIsActive(false);
            setIsConnecting(false);
            setVolume(0);
            onCallEnd?.();
        });

        vapi.on("message", (message) => {
            if (message.type === "transcript" && message.transcript) {
                onTranscript?.({
                    role: message.role as "user" | "assistant",
                    content: message.transcript,
                    timestamp: Date.now(),
                });
            }
        });

        vapi.on("volume-level", (level) => {
            setVolume(level);
        });

        vapi.on("error", (err) => {
            console.error("[VAPI Error]", err);
            const errorMsg = typeof err === 'object' && err !== null
                ? (err as { message?: string }).message || JSON.stringify(err)
                : String(err);
            setError(errorMsg);
            setIsActive(false);
            setIsConnecting(false);
        });

        return () => {
            vapi.stop();
        };
    }, [publicKey, onTranscript, onCallStart, onCallEnd]);

    const toggleCall = useCallback(async () => {
        if (!vapiRef.current) return;

        setError(null); // Clear previous error

        if (isActive) {
            vapiRef.current.stop();
        } else {
            setIsConnecting(true);
            try {
                if (assistantId) {
                    await vapiRef.current.start(assistantId);
                } else {
                    // Use inline assistant config with VAPI-supported providers
                    await vapiRef.current.start({
                        name: "PersonaVoice Assistant",
                        firstMessage: "Hello! Thanks for calling. How can I help you today?",
                        model: {
                            provider: "openai",
                            model: "gpt-4o-mini",
                            temperature: 0.7,
                            messages: [
                                {
                                    role: "system",
                                    content: "You are a helpful customer service assistant. Keep responses brief and conversational (1-2 sentences). Never use markdown or formatting - this is a voice conversation."
                                }
                            ]
                        },
                        voice: {
                            provider: "11labs",
                            voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel voice
                        },
                    });
                }
            } catch (err) {
                console.error("Failed to start call:", err);
                const errorMsg = err instanceof Error ? err.message : String(err);
                setError(errorMsg);
                setIsConnecting(false);
            }
        }
    }, [isActive, assistantId]);

    return (
        <div className="relative">
            {/* Volume ring */}
            {isActive && (
                <motion.div
                    className="absolute inset-0 rounded-full border-4 border-green-500"
                    style={{ scale: 1 + volume * 0.3, opacity: 0.3 + volume * 0.7 }}
                />
            )}

            {/* Button */}
            <motion.button
                onClick={toggleCall}
                disabled={isConnecting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center justify-center rounded-full h-24 w-24 transition-all ${isConnecting
                    ? "bg-yellow-500 cursor-wait"
                    : isActive
                        ? "bg-red-500 hover:bg-red-600"
                        : error
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-app-primary hover:bg-purple-600"
                    }`}
                style={{
                    boxShadow: isActive
                        ? "0 0 40px rgba(34, 197, 94, 0.5)"
                        : "0 4px 20px rgba(0,0,0,0.3)",
                }}
            >
                {isConnecting ? (
                    <Loader2 className="h-10 w-10 text-white animate-spin" />
                ) : isActive ? (
                    <PhoneOff className="h-10 w-10 text-white" />
                ) : error ? (
                    <AlertCircle className="h-10 w-10 text-white" />
                ) : (
                    <Phone className="h-10 w-10 text-white" />
                )}
            </motion.button>

            {/* Status */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                <span className={`text-sm font-medium ${error ? "text-red-400" :
                    isConnecting ? "text-yellow-400" :
                        isActive ? "text-green-400" :
                            "text-gray-400"
                    }`}>
                    {error ? "Error - Tap to retry" :
                        isConnecting ? "Connecting..." :
                            isActive ? "● Connected" :
                                "Tap to call"}
                </span>
            </div>

            {/* Error details */}
            {error && (
                <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 text-center">
                    <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
}

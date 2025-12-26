"use client";

import { Mic, MicOff, Loader2 } from "lucide-react";

interface DockProps {
    onToggleListening: () => void;
    isListening: boolean;
    isRecording: boolean;
    isProcessing: boolean;
    volume: number;  // 0-1 for visualizer
}

export function Dock({
    onToggleListening,
    isListening,
    isRecording,
    isProcessing,
    volume
}: DockProps) {
    // Get status text
    const getStatus = () => {
        if (isProcessing) return "PROCESSING";
        if (isRecording) return "LISTENING...";
        if (isListening) return "WAITING FOR SPEECH";
        return "TAP TO ACTIVATE";
    };

    // Get status color
    const getStatusColor = () => {
        if (isProcessing) return "text-nova-cyan animate-pulse";
        if (isRecording) return "text-red-400 animate-pulse";
        if (isListening) return "text-green-400";
        return "text-gray-400";
    };

    return (
        <div className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 transform">
            <div className="flex flex-col items-center gap-4">
                {/* Volume Visualizer Ring */}
                <div className="relative">
                    {/* Outer glow ring based on volume */}
                    {isListening && (
                        <div
                            className="absolute inset-0 rounded-full transition-all duration-75"
                            style={{
                                transform: `scale(${1 + volume * 0.5})`,
                                boxShadow: isRecording
                                    ? `0 0 ${40 + volume * 60}px rgba(239, 68, 68, ${0.3 + volume * 0.4})`
                                    : `0 0 ${20 + volume * 40}px rgba(34, 197, 94, ${0.2 + volume * 0.3})`,
                            }}
                        />
                    )}

                    {/* Main button */}
                    <button
                        onClick={onToggleListening}
                        disabled={isProcessing}
                        className={`
                            relative flex h-24 w-24 items-center justify-center rounded-full
                            transition-all duration-300 transform
                            ${isProcessing ? "cursor-wait opacity-70" : "cursor-pointer hover:scale-105 active:scale-95"}
                            ${isRecording
                                ? "bg-gradient-to-br from-red-500 to-red-600 shadow-[0_0_50px_rgba(239,68,68,0.5)]"
                                : isListening
                                    ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-[0_0_40px_rgba(34,197,94,0.4)]"
                                    : "bg-gradient-to-br from-nova-purple to-indigo-600 shadow-[0_0_30px_rgba(112,0,255,0.4)]"
                            }
                        `}
                    >
                        {/* Inner decorative ring */}
                        <div className="absolute inset-2 rounded-full border-2 border-white/20" />

                        {/* Icon */}
                        {isProcessing ? (
                            <Loader2 className="h-10 w-10 text-white animate-spin" />
                        ) : isListening ? (
                            <MicOff className="h-10 w-10 text-white" />
                        ) : (
                            <Mic className="h-10 w-10 text-white" />
                        )}

                        {/* Recording pulse animation */}
                        {isRecording && (
                            <>
                                <span className="absolute -inset-2 animate-ping rounded-full bg-red-500/30" />
                                <span className="absolute -inset-4 animate-ping rounded-full bg-red-500/20" style={{ animationDelay: "0.2s" }} />
                            </>
                        )}
                    </button>
                </div>

                {/* Status Label */}
                <div className="rounded-xl border border-nova-border bg-nova-glass px-6 py-3 backdrop-blur-xl">
                    <div className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-1 text-center">
                        STATUS
                    </div>
                    <div className={`text-sm font-bold tracking-wider text-center ${getStatusColor()}`}>
                        {getStatus()}
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TranscriptMessage } from "@/lib/types";

interface TranscriptProps {
    messages: TranscriptMessage[];
    isActive: boolean;
}

export function Transcript({ messages, isActive }: TranscriptProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll on new messages
    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages]);

    return (
        <div className="w-full max-w-lg mx-auto glass rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
                    Live Transcript
                </span>
                {isActive && (
                    <span className="flex items-center gap-2 text-xs text-green-400">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Recording
                    </span>
                )}
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="h-80 overflow-y-auto scrollbar-hide p-4 space-y-4"
            >
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={`${msg.timestamp}-${i}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.role === "user"
                                        ? "bg-app-primary/30 text-white"
                                        : "bg-white/10 text-gray-100"
                                    }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <span className="block text-[10px] text-gray-500 mt-1">
                                    {msg.role === "user" ? "You" : "Agent"} •{" "}
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {messages.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                        {isActive
                            ? "Listening..."
                            : "Start a call to see the transcript"}
                    </div>
                )}
            </div>
        </div>
    );
}

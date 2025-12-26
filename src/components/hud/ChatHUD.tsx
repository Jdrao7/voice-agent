"use client";

import { Message } from "@/lib/types";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatHUDProps {
    messages: Message[];
}

export function ChatHUD({ messages }: ChatHUDProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (messages.length === 0) return null;

    return (
        <div className="absolute right-8 top-1/2 -translate-y-1/2 h-[60vh] w-[400px]">
            <div className="flex h-full flex-col font-mono text-sm">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between border-b border-nova-border pb-2">
                    <span className="text-nova-cyan tracking-widest uppercase">SYS.LOG</span>
                    <span className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</span>
                </div>

                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide"
                >
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`
                    max-w-[90%] rounded-lg p-3 text-xs leading-relaxed
                    ${msg.role === 'user'
                                        ? 'bg-nova-purple/20 border border-nova-purple/30 text-white'
                                        : 'bg-nova-bg/80 border border-nova-border text-nova-cyan'
                                    }
                `}>
                                    {msg.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

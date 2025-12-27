"use client";

import { Message } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";

interface ChatHUDProps {
    messages: Message[];
}

export function ChatHUD({ messages }: ChatHUDProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check for mobile viewport
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        // Auto-expand on new message on mobile
        if (isMobile && messages.length > 1) {
            setIsExpanded(true);
        }
    }, [messages, isMobile]);

    if (messages.length === 0) return null;

    // Mobile drawer layout
    if (isMobile) {
        return (
            <div className="pointer-events-auto absolute top-0 left-0 right-0 safe-top z-30">
                {/* Collapsed header */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-nova-glass/80 backdrop-blur-xl border-b border-nova-border"
                >
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-nova-cyan" />
                        <span className="text-xs font-mono uppercase tracking-widest text-nova-cyan">
                            SYS.LOG
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                            {messages.length} messages
                        </span>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                </button>

                {/* Expandable content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "40vh", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-nova-bg/95 backdrop-blur-xl border-b border-nova-border overflow-hidden"
                        >
                            <div
                                ref={scrollRef}
                                className="h-full overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide"
                            >
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className={`
                                            max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                                            ${msg.role === 'user'
                                                ? 'bg-nova-purple/20 border border-nova-purple/30 text-white'
                                                : 'bg-nova-bg/80 border border-nova-border text-nova-cyan'
                                            }
                                        `}>
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Desktop side panel
    return (
        <div className="pointer-events-auto absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 h-[60vh] w-[340px] lg:w-[400px]">
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

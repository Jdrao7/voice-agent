"use client";

import { useRef, useEffect } from "react";
import { User, Bot } from "lucide-react";
import { Message } from "@/lib/types";
import { AudioPlayer } from "./AudioPlayer";

interface ConversationDisplayProps {
    messages: Message[];
    onAudioComplete?: () => void;
}

export function ConversationDisplay({
    messages,
    onAudioComplete,
}: ConversationDisplayProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (messages.length === 0) {
        return (
            <div className="conversation-empty">
                <div className="empty-icon">
                    <Bot size={48} />
                </div>
                <h3>Hi, I&apos;m Nova!</h3>
                <p>Hold the microphone button and speak to start a conversation.</p>
            </div>
        );
    }

    return (
        <div className="conversation-container" ref={containerRef}>
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`message ${message.role === "user" ? "user-message" : "assistant-message"}`}
                >
                    <div className="message-avatar">
                        {message.role === "user" ? (
                            <User className="avatar-icon" />
                        ) : (
                            <Bot className="avatar-icon" />
                        )}
                    </div>

                    <div className="message-content">
                        <div className="message-header">
                            <span className="message-role">
                                {message.role === "user" ? "You" : "Nova"}
                            </span>
                            <span className="message-time">
                                {formatTime(message.timestamp)}
                            </span>
                        </div>

                        <p className="message-text">{message.content}</p>

                        {message.role === "assistant" && message.audioUrl && (
                            <AudioPlayer
                                audioUrl={message.audioUrl}
                                autoPlay={message.id === messages[messages.length - 1]?.id}
                                onPlaybackComplete={onAudioComplete}
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

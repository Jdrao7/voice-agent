"use client";

import { Mic, Square } from "lucide-react";
import { RecordingState } from "@/lib/types";

interface VoiceRecorderProps {
    state: RecordingState;
    duration: number;
    onStartRecording: () => void;
    onStopRecording: () => void;
    disabled?: boolean;
}

export function VoiceRecorder({
    state,
    duration,
    onStartRecording,
    onStopRecording,
    disabled = false,
}: VoiceRecorderProps) {
    const isRecording = state === "recording";
    const isProcessing = state === "processing";
    const isPlaying = state === "playing";

    const formatDuration = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const tenths = Math.floor((ms % 1000) / 100);
        return `${seconds}.${tenths}s`;
    };

    return (
        <div className="voice-recorder">
            <button
                className={`record-button ${isRecording ? "recording" : ""} ${isProcessing ? "processing" : ""}`}
                onMouseDown={onStartRecording}
                onMouseUp={onStopRecording}
                onMouseLeave={isRecording ? onStopRecording : undefined}
                onTouchStart={onStartRecording}
                onTouchEnd={onStopRecording}
                disabled={disabled || isProcessing || isPlaying}
                aria-label={isRecording ? "Release to stop" : "Hold to record"}
            >
                <div className="button-inner">
                    {isRecording ? (
                        <Square className="icon stop-icon" />
                    ) : (
                        <Mic className="icon mic-icon" />
                    )}
                </div>

                {/* Pulse rings for recording animation */}
                {isRecording && (
                    <>
                        <div className="pulse-ring pulse-ring-1" />
                        <div className="pulse-ring pulse-ring-2" />
                        <div className="pulse-ring pulse-ring-3" />
                    </>
                )}

                {/* Processing spinner */}
                {isProcessing && <div className="processing-spinner" />}
            </button>

            <div className="recorder-label">
                {isRecording ? (
                    <span className="recording-indicator">
                        <span className="recording-dot" />
                        Recording {formatDuration(duration)}
                    </span>
                ) : isProcessing ? (
                    <span className="processing-text">Processing...</span>
                ) : isPlaying ? (
                    <span className="playing-text">Playing response...</span>
                ) : (
                    <span className="idle-text">Hold to speak</span>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState, useRef, useCallback } from "react";
import { RecordingState } from "@/lib/types";

interface UseVoiceRecorderOptions {
    maxDuration?: number; // Max recording duration in ms
    onRecordingComplete?: (blob: Blob) => void;
}

interface UseVoiceRecorderReturn {
    state: RecordingState;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    audioBlob: Blob | null;
    error: string | null;
    duration: number;
}

export function useVoiceRecorder(
    options: UseVoiceRecorderOptions = {}
): UseVoiceRecorderReturn {
    const { maxDuration = 10000, onRecordingComplete } = options;

    const [state, setState] = useState<RecordingState>("idle");
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const startTimeRef = useRef<number>(0);
    const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const maxDurationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const cleanup = useCallback(() => {
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }
        if (maxDurationTimeoutRef.current) {
            clearTimeout(maxDurationTimeoutRef.current);
            maxDurationTimeoutRef.current = null;
        }
    }, []);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            setAudioBlob(null);
            chunksRef.current = [];

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000,
                },
            });

            // Determine supported MIME type - prefer formats that work well with Whisper
            // audio/webm;codecs=opus works, but we try more compatible formats first
            let mimeType = "audio/webm";

            if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
                mimeType = "audio/webm;codecs=opus";
            } else if (MediaRecorder.isTypeSupported("audio/webm")) {
                mimeType = "audio/webm";
            } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
                mimeType = "audio/mp4";
            } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
                mimeType = "audio/ogg;codecs=opus";
            }

            console.log("Using MIME type:", mimeType);

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                cleanup();
                stream.getTracks().forEach((track) => track.stop());

                const blob = new Blob(chunksRef.current, { type: mimeType });
                console.log("Recording complete:", {
                    chunks: chunksRef.current.length,
                    blobSize: blob.size,
                    blobType: blob.type,
                });

                setAudioBlob(blob);
                setState("idle");

                if (onRecordingComplete) {
                    onRecordingComplete(blob);
                }
            };

            mediaRecorder.onerror = () => {
                cleanup();
                setError("Recording failed");
                setState("idle");
                stream.getTracks().forEach((track) => track.stop());
            };

            // Start recording - collect all data when stopped (not in chunks)
            // This ensures the webm container is properly formed
            mediaRecorder.start();
            startTimeRef.current = Date.now();
            setState("recording");
            setDuration(0);

            console.log("Recording started with MIME type:", mimeType);

            // Update duration every 100ms
            durationIntervalRef.current = setInterval(() => {
                setDuration(Date.now() - startTimeRef.current);
            }, 100);

            // Auto-stop at max duration
            maxDurationTimeoutRef.current = setTimeout(() => {
                if (mediaRecorderRef.current?.state === "recording") {
                    mediaRecorderRef.current.stop();
                }
            }, maxDuration);
        } catch (err) {
            console.error("Failed to start recording:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to access microphone"
            );
            setState("idle");
        }
    }, [maxDuration, onRecordingComplete, cleanup]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    }, []);

    return {
        state,
        startRecording,
        stopRecording,
        audioBlob,
        error,
        duration,
    };
}

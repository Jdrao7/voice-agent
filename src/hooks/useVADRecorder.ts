"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { RecordingState } from "@/lib/types";

interface UseVADRecorderOptions {
    silenceThreshold?: number;      // Volume threshold (0-1)
    silenceDuration?: number;       // How long silence before stopping (ms)
    maxDuration?: number;           // Max recording duration (ms)
    onRecordingComplete?: (blob: Blob) => void;
}

interface UseVADRecorderReturn {
    state: RecordingState;
    isListening: boolean;
    volume: number;                 // Current mic volume (0-1)
    startListening: () => Promise<void>;
    stopListening: () => void;
    error: string | null;
}

export function useVADRecorder(
    options: UseVADRecorderOptions = {}
): UseVADRecorderReturn {
    const {
        silenceThreshold = 0.015,    // Lower threshold for better sensitivity
        silenceDuration = 1500,       // 1.5s of silence to stop
        maxDuration = 15000,          // 15s max
        onRecordingComplete,
    } = options;

    const [state, setState] = useState<RecordingState>("idle");
    const [isListening, setIsListening] = useState(false);
    const [volume, setVolume] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Use refs to avoid stale closures in animation loop
    const stateRef = useRef<RecordingState>("idle");
    const isListeningRef = useRef(false);

    // Audio refs
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Timing refs
    const silenceStartRef = useRef<number | null>(null);
    const recordingStartRef = useRef<number | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const onRecordingCompleteRef = useRef(onRecordingComplete);

    // Keep callback ref updated
    useEffect(() => {
        onRecordingCompleteRef.current = onRecordingComplete;
    }, [onRecordingComplete]);

    // Cleanup function
    const cleanup = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
            audioContextRef.current.close();
        }
        audioContextRef.current = null;
        mediaRecorderRef.current = null;
        analyserRef.current = null;
    }, []);

    // Analyze audio levels - uses refs to avoid stale closures
    const analyzeAudio = useCallback(() => {
        if (!analyserRef.current || !isListeningRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate RMS volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += (dataArray[i] / 255) ** 2;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        setVolume(rms);

        // Voice activity detection logic
        const now = Date.now();
        const isSpeaking = rms > silenceThreshold;
        const currentState = stateRef.current;

        // Debug logging
        if (rms > 0.01) {
            console.log(`VAD: volume=${rms.toFixed(3)}, threshold=${silenceThreshold}, speaking=${isSpeaking}, state=${currentState}`);
        }

        if (currentState === "idle" && isSpeaking) {
            // Start recording when speech detected
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
                chunksRef.current = [];
                mediaRecorderRef.current.start();
                recordingStartRef.current = now;
                stateRef.current = "recording";
                setState("recording");
                silenceStartRef.current = null;
                console.log("VAD: 🎙️ Speech detected! Started recording");
            }
        } else if (currentState === "recording") {
            // Check for silence or max duration
            const recordingDuration = now - (recordingStartRef.current || now);

            if (recordingDuration >= maxDuration) {
                console.log("VAD: Max duration reached, stopping");
                if (mediaRecorderRef.current?.state === "recording") {
                    mediaRecorderRef.current.stop();
                }
                return;
            }

            if (!isSpeaking) {
                // Silence detected
                if (!silenceStartRef.current) {
                    silenceStartRef.current = now;
                    console.log("VAD: Silence started...");
                } else if (now - silenceStartRef.current >= silenceDuration) {
                    // Silence long enough, stop recording
                    console.log("VAD: ⏹️ Silence detected, stopping recording");
                    if (mediaRecorderRef.current?.state === "recording") {
                        mediaRecorderRef.current.stop();
                    }
                    return;
                }
            } else {
                // Reset silence timer when speaking
                if (silenceStartRef.current) {
                    console.log("VAD: Speech resumed");
                }
                silenceStartRef.current = null;
            }
        }

        // Continue analyzing
        if (isListeningRef.current) {
            animationFrameRef.current = requestAnimationFrame(analyzeAudio);
        }
    }, [silenceThreshold, silenceDuration, maxDuration]);

    // Start listening for voice
    const startListening = useCallback(async () => {
        try {
            setError(null);
            console.log("VAD: Starting microphone access...");

            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
            streamRef.current = stream;
            console.log("VAD: Microphone access granted");

            // Setup Web Audio API for analysis  
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;

            // Resume audio context if suspended (Chrome autoplay policy)
            if (audioContext.state === "suspended") {
                await audioContext.resume();
                console.log("VAD: Audio context resumed");
            }

            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.5; // Less smoothing = more responsive
            source.connect(analyser);
            analyserRef.current = analyser;

            // Setup MediaRecorder
            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? "audio/webm;codecs=opus"
                : "audio/webm";

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                console.log("VAD: Recording complete, blob size:", blob.size);

                stateRef.current = "idle";
                setState("idle");
                silenceStartRef.current = null;
                recordingStartRef.current = null;

                if (blob.size > 1000 && onRecordingCompleteRef.current) {
                    console.log("VAD: Sending audio to API...");
                    onRecordingCompleteRef.current(blob);
                }
            };

            // Set listening state
            isListeningRef.current = true;
            setIsListening(true);
            stateRef.current = "idle";
            setState("idle");

            // Start analyzing audio
            console.log("VAD: 👂 Now listening for speech...");
            animationFrameRef.current = requestAnimationFrame(analyzeAudio);

        } catch (err) {
            console.error("VAD Error:", err);
            setError(err instanceof Error ? err.message : "Microphone access denied");
            cleanup();
        }
    }, [analyzeAudio, cleanup]);

    // Stop listening
    const stopListening = useCallback(() => {
        console.log("VAD: Stopping...");
        isListeningRef.current = false;
        setIsListening(false);

        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        cleanup();
        stateRef.current = "idle";
        setState("idle");
        setVolume(0);
        console.log("VAD: Stopped listening");
    }, [cleanup]);

    // Cleanup on unmount
    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    return {
        state,
        isListening,
        volume,
        startListening,
        stopListening,
        error,
    };
}

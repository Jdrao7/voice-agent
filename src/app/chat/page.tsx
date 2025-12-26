"use client";

import dynamic from "next/dynamic";
import { useCallback, useState, useEffect } from "react";
import { ImmersiveLayout } from "@/components/layout/ImmersiveLayout";
import { Dock } from "@/components/hud/Dock";
import { ChatHUD } from "@/components/hud/ChatHUD";
import { SystemStatus } from "@/components/hud/SystemStatus";
import { useVADRecorder } from "@/hooks/useVADRecorder";
import { Message, VoiceResponse } from "@/lib/types";

// Dynamically import Scene to avoid SSR issues with R3F
const Scene = dynamic(
  () => import("@/components/canvas/Scene").then((mod) => mod.Scene),
  { ssr: false }
);

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [serverState, setServerState] = useState<"idle" | "processing" | "playing">("idle");

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: "system-1",
        role: "assistant",
        content: "Neural core online. Tap the microphone to activate voice detection. I'll automatically listen when you speak.",
        timestamp: Date.now(),
      }
    ]);
  }, []);

  const processAudio = useCallback(async (audioBlob: Blob) => {
    setServerState("processing");

    try {
      // Build form data
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("conversationHistory", JSON.stringify(messages));

      // Send to API
      const response = await fetch("/api/voice", {
        method: "POST",
        body: formData,
      });

      const result: VoiceResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to process voice");
      }

      // Create audio for playback
      const audioBytes = atob(result.data.audioBase64);
      const audioArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }
      const responseBlob = new Blob([audioArray], {
        type: result.data.audioMimeType,
      });
      const audioUrl = URL.createObjectURL(responseBlob);

      // Create messages
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: result.data.userTranscript,
        timestamp: Date.now(),
      };

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: result.data.agentResponse,
        timestamp: Date.now(),
        audioUrl,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      // Auto-play response
      setServerState("playing");
      const audio = new Audio(audioUrl);
      audio.onended = () => setServerState("idle");
      audio.play().catch(() => setServerState("idle"));

    } catch (err) {
      console.error("Processing error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Error in processing pipeline. Please retry.",
          timestamp: Date.now(),
        },
      ]);
      setServerState("idle");
    }
  }, [messages]);

  // VAD Recorder hook
  const {
    state: recordingState,
    isListening,
    volume,
    startListening,
    stopListening,
    error: vadError
  } = useVADRecorder({
    silenceThreshold: 0.03,     // Sensitivity
    silenceDuration: 1500,       // 1.5s silence to stop
    maxDuration: 15000,          // 15s max
    onRecordingComplete: processAudio,
  });

  // Toggle listening mode
  const handleToggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Show VAD errors in chat
  useEffect(() => {
    if (vadError) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Microphone error: ${vadError}`,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [vadError]);

  // Is the orb "active" (listening, recording, or processing)
  const isOrbActive = isListening || recordingState === "recording" || serverState === "processing" || serverState === "playing";

  return (
    <ImmersiveLayout>
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Scene active={isOrbActive} />
      </div>

      {/* 2D HUD */}
      <SystemStatus />

      <ChatHUD messages={messages} />

      {/* Primary Control - VAD Mode */}
      <Dock
        onToggleListening={handleToggleListening}
        isListening={isListening}
        isRecording={recordingState === "recording"}
        isProcessing={serverState === "processing"}
        volume={volume}
      />

      {/* Title Overlay */}
      <div className="pointer-events-none absolute top-8 left-8">
        <h1 className="text-4xl font-bold tracking-tighter text-white/90">
          NOVA
          <span className="text-xs align-top text-nova-purple ml-2 font-mono">CORE V.2</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">
          {isListening ? "Voice Detection Active" : "Tap to Activate"}
        </p>
      </div>
    </ImmersiveLayout>
  );
}

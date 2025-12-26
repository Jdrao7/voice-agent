"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface AudioPlayerProps {
    src?: string;       // Direct audio source URL (new)
    audioBlob?: Blob;   // Legacy blob support
    mimeType?: string;
    autoPlay?: boolean;
    onEnded?: () => void;
}

export function AudioPlayer({
    src,
    audioBlob,
    mimeType = "audio/webm",
    autoPlay = false,
    onEnded
}: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Create URL from blob if src not provided
    const audioUrl = useMemo(() => {
        if (src) return src;
        if (audioBlob) return URL.createObjectURL(audioBlob);
        return null;
    }, [src, audioBlob]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audioUrl) return;

        audio.src = audioUrl;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            if (autoPlay) {
                audio.play().catch(console.error);
            }
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            onEnded?.();
        };

        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [audioUrl, autoPlay, onEnded]);

    const togglePlayback = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(console.error);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (!audioUrl) return null;

    // Calculate progress percentage
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="audio-player">
            <audio ref={audioRef} />

            <button
                className="play-button"
                onClick={togglePlayback}
                aria-label={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? (
                    <Pause className="icon" />
                ) : (
                    <Play className="icon" />
                )}
            </button>

            <div className="player-content">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="time-display">
                    <Volume2 className="volume-icon" />
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
}

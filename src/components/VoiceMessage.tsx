"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceMessageProps {
  audioSrc: string;
  isOwn?: boolean;
  duration?: number;
}

export default function VoiceMessage({ audioSrc, isOwn = false, duration: propDuration }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(propDuration || 0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [bars] = useState(() => Array.from({ length: 28 }, () => Math.random() * 0.7 + 0.3));

  useEffect(() => {
    if (!audioSrc) return;

    const audio = new Audio();
    audio.preload = "auto";
    // Add crossorigin for Cloudinary URLs so duration can be read
    if (audioSrc.includes("cloudinary.com")) {
      audio.crossOrigin = "anonymous";
    }
    audio.src = audioSrc;
    audioRef.current = audio;
    setLoadError(false);
    setLoading(true);

    const onLoadedData = () => {
      setLoading(false);
      const d = audio.duration;
      if (Number.isFinite(d) && d > 0) {
        setDuration(d);
      }
    };

    const onDurationChange = () => {
      const d = audio.duration;
      if (Number.isFinite(d) && d > 0) {
        setDuration(d);
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const onError = () => {
      setLoading(false);
      setLoadError(true);
    };

    // Also try to get duration after play starts (some browsers need this)
    const onPlay = () => {
      const d = audio.duration;
      if (Number.isFinite(d) && d > 0) {
        setDuration(d);
      }
    };

    audio.addEventListener("loadeddata", onLoadedData);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.pause();
      audio.removeEventListener("loadeddata", onLoadedData);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("play", onPlay);
      audio.src = "";
    };
  }, [audioSrc]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || loadError) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => setLoadError(true));
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const safeCurrent = Number.isFinite(currentTime) ? Math.min(currentTime, safeDuration) : 0;
  const progress = safeDuration > 0 ? (safeCurrent / safeDuration) * 100 : 0;

  if (loadError) {
    return (
      <div className="flex items-center gap-2 min-w-[160px] text-destructive text-xs">
        <Mic className="h-3 w-3 shrink-0" />
        <span>Failed to load voice message</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 min-w-[200px]">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-full shrink-0",
          isOwn
            ? "text-primary-foreground hover:text-primary-foreground/80"
            : "text-foreground hover:text-foreground/80"
        )}
        onClick={togglePlay}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </Button>

      <div className="flex-1 min-w-0">
        {/* Waveform bars */}
        <div className="flex items-end gap-[2px] h-6 mb-1">
          {bars.map((height, i) => {
            const barProgress = (i / bars.length) * 100;
            const isActive = barProgress <= progress;
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-full transition-all duration-150",
                  isActive
                    ? isOwn ? "bg-primary-foreground/80" : "bg-primary"
                    : isOwn ? "bg-primary-foreground/25" : "bg-muted-foreground/30"
                )}
                style={{
                  height: `${height * 100}%`,
                  minHeight: "3px",
                }}
              />
            );
          })}
        </div>

        {/* Time */}
        <div className={cn(
          "flex items-center justify-between text-[10px]",
          isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
        )}>
          <span>{formatTime(safeCurrent)}</span>
          <span>{safeDuration > 0 ? formatTime(safeDuration) : ""}</span>
        </div>
      </div>

      <Mic className={cn(
        "h-3 w-3 shrink-0",
        isOwn ? "text-primary-foreground/40" : "text-muted-foreground/40"
      )} />
    </div>
  );
}

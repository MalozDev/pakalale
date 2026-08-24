"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceMessageProps {
  audioBase64: string;
  isOwn?: boolean;
  duration?: number;
}

export default function VoiceMessage({ audioBase64, isOwn = false, duration: propDuration }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(propDuration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [bars] = useState(() => Array.from({ length: 28 }, () => Math.random() * 0.7 + 0.3));

  useEffect(() => {
    if (!audioBase64) return;

    const audio = new Audio(audioBase64);
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(Math.floor(audio.duration));
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(Math.floor(audio.currentTime));
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audioBase64]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

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
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
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
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <Mic className={cn(
        "h-3 w-3 shrink-0",
        isOwn ? "text-primary-foreground/40" : "text-muted-foreground/40"
      )} />
    </div>
  );
}

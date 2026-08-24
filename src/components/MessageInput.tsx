"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Image as ImageIcon, Paperclip, Mic, X, Camera, FileText, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSendMessage: (content: string, type?: "text" | "image" | "file" | "voice") => void;
  onSendFile?: (file: File) => void;
  onSendImage?: (file: File) => void;
  replyTo?: { messageId: string; content: string; senderName: string } | null;
  onCancelReply?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function MessageInput({
  onSendMessage,
  onSendFile,
  onSendImage,
  replyTo,
  onCancelReply,
  placeholder = "Type a message...",
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingBars, setRecordingBars] = useState<number[]>(Array(20).fill(0.3));

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + "px";
    }
  }, [message]);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) onSendImage?.(file);
      else onSendFile?.(file);
    }
  };

  // Voice recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      // Set up audio analyser for visual feedback
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Animate recording bars
      const updateBars = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const bars = Array.from({ length: 20 }, (_, i) => {
          const val = dataArray[i * 2] || 0;
          return Math.max(0.15, val / 255);
        });
        setRecordingBars(bars);
        animFrameRef.current = requestAnimationFrame(updateBars);
      };
      updateBars();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        // Convert to base64 for storage
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          onSendMessage(base64, "voice");
        };
        reader.readAsDataURL(audioBlob);

        // Cleanup
        stream.getTracks().forEach((track) => track.stop());
        audioContext.close();
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        analyserRef.current = null;
      };

      mediaRecorder.start(100); // Collect data every 100ms for smooth waveform
      setIsRecording(true);
      setRecordingTime(0);

      // Timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  }, [onSendMessage]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setIsRecording(false);
    setRecordingTime(0);
    setRecordingBars(Array(20).fill(0.3));
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    // Stop all tracks
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsRecording(false);
    setRecordingTime(0);
    setRecordingBars(Array(20).fill(0.3));
  }, []);

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Recording UI
  if (isRecording) {
    return (
      <div className="bg-background border-t border-border p-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-destructive hover:text-destructive"
            onClick={cancelRecording}
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="flex-1 flex items-center gap-2">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse shrink-0" />
            <span className="text-sm font-mono text-muted-foreground shrink-0">
              {formatRecordingTime(recordingTime)}
            </span>

            {/* Live waveform */}
            <div className="flex-1 flex items-center justify-center gap-[2px] h-8">
              {recordingBars.map((height, i) => (
                <div
                  key={i}
                  className="w-1 bg-destructive rounded-full transition-all duration-100"
                  style={{
                    height: `${height * 100}%`,
                    minHeight: "3px",
                  }}
                />
              ))}
            </div>
          </div>

          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shrink-0"
            onClick={stopRecording}
          >
            <Square className="h-4 w-4 fill-current" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border-t border-border p-3">
      {replyTo && (
        <div className="mb-2 p-2 bg-muted rounded-lg border-l-4 border-primary">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-muted-foreground">Replying to {replyTo.senderName}</p>
              <p className="text-xs truncate">{replyTo.content}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onCancelReply}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="relative shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            disabled={disabled}
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          {showAttachmentMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-lg shadow-lg z-10 p-1">
              <button
                onClick={() => { imageInputRef.current?.click(); setShowAttachmentMenu(false); }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted w-full rounded"
              >
                <ImageIcon className="h-3.5 w-3.5" /> Photo
              </button>
              <button
                onClick={() => { setShowAttachmentMenu(false); }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted w-full rounded"
              >
                <Camera className="h-3.5 w-3.5" /> Camera
              </button>
              <button
                onClick={() => { fileInputRef.current?.click(); setShowAttachmentMenu(false); }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted w-full rounded"
              >
                <FileText className="h-3.5 w-3.5" /> Document
              </button>
            </div>
          )}
        </div>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 px-3 py-2 bg-muted border border-border rounded-full text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none h-[40px] max-h-[100px]"
        />

        {message.trim() ? (
          <Button
            size="icon"
            className="h-9 w-9 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
            disabled={disabled || !message.trim()}
            onClick={handleSend}
          >
            <Send className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full"
            disabled={disabled}
            onClick={startRecording}
          >
            <Mic className="h-4 w-4" />
          </Button>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.zip,.rar" onChange={handleFileSelect} className="hidden" />
      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
    </div>
  );
}

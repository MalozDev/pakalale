"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MoreVertical,
  Reply,
  Copy,
  Trash2,
  Pencil,
  Check,
  CheckCheck,
  Loader2,
  Forward,
  X,
} from "lucide-react";
import VoiceMessage from "./VoiceMessage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  currentUserId?: string;
  onReply?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onForward?: (message: Message) => void;
  showAvatar?: boolean;
  isConsecutive?: boolean;
  /** Whether this message is pending (sent locally but not yet confirmed by server) */
  isPending?: boolean;
}

export default function MessageBubble({
  message,
  currentUserId,
  onReply,
  onDelete,
  onEdit,
  onForward,
  showAvatar = false,
  isConsecutive = false,
  isPending = false,
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [showSwipeReply, setShowSwipeReply] = useState(false);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Touch gesture refs
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSwipingRef = useRef(false);
  const hasMovedRef = useRef(false);

  const isOwn = message.senderId === currentUserId;
  const isTextMessage =
    message.type === "text" || message.type === "deal_update";

  // ── Swipe-right-to-reply gesture ──
  const SWIPE_THRESHOLD = 60;
  const SWIPE_MAX = 120;

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      isSwipingRef.current = false;
      hasMovedRef.current = false;

      // Start long-press timer (500ms)
      longPressTimerRef.current = setTimeout(() => {
        if (!hasMovedRef.current) {
          setShowMenu(true);
          // Haptic feedback on supported devices
          navigator.vibrate?.(30);
        }
      }, 500);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;

      // If moved more than 10px vertically, cancel swipe detection
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        return;
      }

      // If moved more than 10px horizontally, it's a swipe
      if (Math.abs(dx) > 10) {
        hasMovedRef.current = true;
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }

      // Only allow swipe-right for non-own messages, and swipe-left for own
      if (isOwn && dx > 0) return;
      if (!isOwn && dx < 0) return;

      if (Math.abs(dx) > 10) {
        isSwipingRef.current = true;
        const offset = Math.max(-SWIPE_MAX, Math.min(SWIPE_MAX, dx * (isOwn ? 1 : 1)));
        setSwipeOffset(offset);
        setShowSwipeReply(Math.abs(offset) > SWIPE_THRESHOLD);
      }
    },
    [isOwn]
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (isSwipingRef.current && Math.abs(swipeOffset) > SWIPE_THRESHOLD) {
      onReply?.(message);
      // Haptic feedback
      navigator.vibrate?.(20);
    }

    setSwipeOffset(0);
    setShowSwipeReply(false);
    isSwipingRef.current = false;
    touchStartRef.current = null;
  }, [swipeOffset, message, onReply]);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setShowDeleteConfirm(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  // Cleanup long-press on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === "Escape") {
      setEditContent(message.content);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn("flex group", isOwn ? "justify-end" : "justify-start")}
      ref={bubbleRef}
    >
      <div
        className={cn(
          "flex items-end gap-2 max-w-[80%]",
          isOwn ? "flex-row-reverse" : ""
        )}
      >
        {showAvatar && !isOwn && (
          <Avatar className="h-7 w-7 shrink-0 mb-1">
            <AvatarFallback className="bg-muted text-[10px]">
              {message.senderName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        )}

        <div
          className="relative"
          ref={menuRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translateX(${swipeOffset}px)`,
            transition: swipeOffset === 0 ? "transform 0.2s ease" : "none",
          }}
        >
          {/* Swipe reply indicator */}
          {showSwipeReply && (
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 flex items-center gap-1 text-primary",
                isOwn ? "right-full mr-2" : "left-full ml-2"
              )}
            >
              <Reply className="h-4 w-4" />
            </div>
          )}

          {/* Reply quote */}
          {message.replyTo && (
            <div
              className={cn(
                "mb-1 p-2 rounded-lg border-l-4 text-xs cursor-pointer hover:opacity-80",
                isOwn
                  ? "bg-primary/10 border-primary"
                  : "bg-muted border-muted-foreground/30"
              )}
            >
              <p className="text-muted-foreground mb-0.5 font-medium">
                {message.replyTo.senderName}
              </p>
              <p className="truncate">{message.replyTo.content}</p>
            </div>
          )}

          <div
            className={cn(
              "px-3 py-2 rounded-2xl text-sm",
              isOwn
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted text-foreground rounded-bl-md",
              isConsecutive && (isOwn ? "rounded-tr-md" : "rounded-tl-md"),
              isPending && "opacity-70"
            )}
          >
            {message.type === "voice" ? (
              <VoiceMessage
                audioBase64={message.content}
                isOwn={isOwn}
              />
            ) : isEditing ? (
              <div className="min-w-[180px]">
                <textarea
                  ref={editInputRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  rows={1}
                  className={cn(
                    "w-full bg-transparent border-none outline-none resize-none text-sm p-0",
                    isOwn
                      ? "text-primary-foreground placeholder:text-primary-foreground/50"
                      : "text-foreground placeholder:text-muted-foreground"
                  )}
                />
                <div className="flex items-center gap-1 mt-1">
                  <button
                    onClick={() => {
                      setEditContent(message.content);
                      setIsEditing(false);
                    }}
                    className="text-[10px] opacity-60 hover:opacity-100"
                  >
                    Cancel
                  </button>
                  <span className="text-[10px] opacity-40">•</span>
                  <button
                    onClick={handleSaveEdit}
                    className="text-[10px] opacity-60 hover:opacity-100 font-medium"
                  >
                    Save
                  </button>
                  <span className="text-[10px] opacity-40 ml-1">enter ↵</span>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}

            {/* Edited indicator */}
            {message.content !== message.content && (
              <span className="text-[9px] opacity-50 italic">(edited)</span>
            )}

            <div
              className={cn(
                "flex items-center justify-end gap-1 mt-0.5",
                isOwn
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              )}
            >
              {/* Pending/loading indicator */}
              {isPending && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              <span className="text-[10px]">
                {formatTime(message.timestamp)}
              </span>
              {isOwn && !isPending && (
                message.isRead && message.readBy.length > 0 ? (
                  <CheckCheck className="h-3 w-3 text-blue-400" />
                ) : (
                  <Check className="h-3 w-3" />
                )
              )}
            </div>
          </div>

          {/* Context menu button — visible on hover (desktop) or tap (mobile) */}
          <div
            className={cn(
              "absolute top-0 transition-opacity",
              isOwn ? "right-full mr-1" : "left-full ml-1",
              "opacity-0 group-hover:opacity-100",
              "sm:opacity-0 sm:group-hover:opacity-100",
              showMenu && "opacity-100"
            )}
          >
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <MoreVertical className="h-3 w-3" />
            </button>
          </div>

          {/* Context menu */}
          {showMenu && (
            <div
              className={cn(
                "absolute top-0 z-20 bg-card border border-border rounded-xl shadow-xl min-w-[160px] py-1",
                isOwn ? "right-full mr-2" : "left-full ml-2"
              )}
            >
              <button
                onClick={() => {
                  onReply?.(message);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted w-full text-left"
              >
                <Reply className="h-3.5 w-3.5" /> Reply
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(message.content);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted w-full text-left"
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
              {onForward && (
                <button
                  onClick={() => {
                    onForward?.(message);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted w-full text-left"
                >
                  <Forward className="h-3.5 w-3.5" /> Forward
                </button>
              )}
              {isOwn && isTextMessage && (
                <button
                  onClick={() => {
                    setEditContent(message.content);
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted w-full text-left"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              )}
              {isOwn && (
                <>
                  <div className="border-t border-border my-1" />
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 w-full text-left"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  ) : (
                    <div className="px-3 py-2">
                      <p className="text-[10px] text-muted-foreground mb-1.5">
                        Delete this message?
                      </p>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] px-2"
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 text-[10px] px-2"
                          onClick={() => {
                            onDelete?.(message.id);
                            setShowMenu(false);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

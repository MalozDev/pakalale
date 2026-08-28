"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useNotificationStore } from "@/store/notificationStore";
import { useDealStore } from "@/store/dealStore";

const SOCKET_URL = typeof window !== "undefined" ? window.location.origin : "";

/**
 * Global socket connection that runs in the dashboard layout.
 * Listens for new messages, notifications, and deal updates
 * and pushes counts to zustand stores in real-time.
 */
export function useGlobalSocket(userId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const incrementDealCount = useDealStore((s) => s.incrementDealCount);

  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("register", userId);
    });

    socket.on("reconnect", () => {
      socket.emit("register", userId);
    });

    // ── Real-time notification count ──
    socket.on("new_notification", (data: { userId: string; unreadCount?: number }) => {
      if (data.userId === userId) {
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        } else {
          // Increment if we don't have exact count
          useNotificationStore.setState((s) => ({
            unreadCount: s.unreadCount + 1,
          }));
        }
      }
    });

    // ── Real-time chat unread count ──
    // When a new message arrives for a chat the user is NOT actively viewing,
    // the chat page will handle it. But we can listen for a count event.
    socket.on("new_message_count", (data: { userId: string; totalUnread: number }) => {
      if (data.userId === userId) {
        // Update via custom event that BottomNav listens to
        window.dispatchEvent(
          new CustomEvent("chat-unread-update", { detail: { totalUnread: data.totalUnread } })
        );
      }
    });

    // ── Real-time deal count ──
    socket.on("new_deal", (data: { userId: string }) => {
      if (data.userId === userId) {
        incrementDealCount();
      }
    });

    // ── Broadcast message received ──
    // The server broadcasts "new_message" to all users in the chat room.
    // If the user is NOT in that chat, they need their unread count bumped.
    socket.on("new_message", (msg: { chatId: string; senderId: string }) => {
      if (msg.senderId !== userId) {
        // Bump chat unread count for BottomNav
        window.dispatchEvent(new CustomEvent("chat-unread-increment"));
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, setUnreadCount, incrementDealCount]);
}

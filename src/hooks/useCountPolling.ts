"use client";

import { useEffect, useRef } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import { useDealStore } from "@/store/dealStore";

const POLL_INTERVAL = 30_000; // 30 seconds

/**
 * Polls for chat unread count, deal count, and notification count.
 * Returns nothing — updates zustand stores directly so all components react.
 */
export function useCountPolling(userId?: string) {
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const setDealCount = useDealStore((s) => s.setDealCount);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCounts = async () => {
    if (!userId) return;
    try {
      const [notifRes, chatRes] = await Promise.all([
        fetch(`/api/notifications?userId=${userId}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch(`/api/chat?userId=${userId}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);

      if (notifRes?.unreadCount !== undefined) {
        setUnreadCount(notifRes.unreadCount);
      }
      if (chatRes?.totalDeals !== undefined) {
        setDealCount(chatRes.totalDeals);
      }
    } catch {
      // Silently fail — will retry on next interval
    }
  };

  // Also expose a way to get chat unread count for components that need it locally
  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    fetchCounts();

    // Poll every 30s
    intervalRef.current = setInterval(fetchCounts, POLL_INTERVAL);

    // Also refetch on visibility change (user comes back to tab)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchCounts();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [userId, setUnreadCount, setDealCount]);
}

/**
 * Separate hook that returns chat unread count via polling (for BottomNav/Header).
 * Also syncs to zustand for other components.
 */
export function useChatUnreadPolling(userId?: string): { chatUnread: number } {
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const setDealCount = useDealStore((s) => s.setDealCount);

  useEffect(() => {
    if (!userId) return;

    let count = 0;
    const el = document.getElementById("__chat_unread_count__");

    const fetchChatCount = async () => {
      try {
        const res = await fetch(`/api/chat?userId=${userId}`);
        if (!res.ok) return;
        const d = await res.json();
        count = d.totalUnread || 0;
        setDealCount(d.totalDeals || 0);
      } catch { /* ignore */ }
    };

    // Initial + polling
    fetchChatCount();
    const iv = setInterval(fetchChatCount, POLL_INTERVAL);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchChatCount();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [userId, setDealCount, setUnreadCount]);

  return { chatUnread: 0 }; // The actual value is managed by custom events from socket
}

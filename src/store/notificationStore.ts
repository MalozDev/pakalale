"use client";

import { create } from "zustand";

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: (by?: number) => void;
  resetUnreadCount: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementUnreadCount: (by = 1) => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - by) })),
  resetUnreadCount: () => set({ unreadCount: 0 }),
}));

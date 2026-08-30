"use client";

import { create } from "zustand";

interface TypingState {
  // Map of chatId -> { userId, userName, timestamp }
  typingUsers: Map<string, { userId: string; userName: string; timestamp: number }>;
  setTyping: (chatId: string, userId: string, userName: string) => void;
  clearTyping: (chatId: string, userId: string) => void;
  getTypingUser: (chatId: string) => { userId: string; userName: string } | null;
}

export const useTypingStore = create<TypingState>()((set, get) => ({
  typingUsers: new Map(),

  setTyping: (chatId, userId, userName) => {
    set((state) => {
      const next = new Map(state.typingUsers);
      next.set(chatId, { userId, userName, timestamp: Date.now() });
      return { typingUsers: next };
    });
    // Auto-clear after 4 seconds
    setTimeout(() => {
      const current = get().typingUsers.get(chatId);
      if (current && current.userId === userId) {
        get().clearTyping(chatId, userId);
      }
    }, 4000);
  },

  clearTyping: (chatId, userId) => {
    set((state) => {
      const next = new Map(state.typingUsers);
      const existing = next.get(chatId);
      if (existing && existing.userId === userId) {
        next.delete(chatId);
      }
      return { typingUsers: next };
    });
  },

  getTypingUser: (chatId) => {
    return get().typingUsers.get(chatId) || null;
  },
}));

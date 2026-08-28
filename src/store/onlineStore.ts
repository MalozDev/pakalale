"use client";

import { create } from "zustand";

interface OnlineState {
  onlineUserIds: Set<string>;
  setOnlineUsers: (userIds: string[]) => void;
  addUser: (userId: string) => void;
  removeUser: (userId: string) => void;
}

export const useOnlineStore = create<OnlineState>()((set) => ({
  onlineUserIds: new Set<string>(),

  setOnlineUsers: (userIds: string[]) => {
    set({ onlineUserIds: new Set(userIds) });
  },

  addUser: (userId: string) => {
    set((state) => {
      const next = new Set(state.onlineUserIds);
      next.add(userId);
      return { onlineUserIds: next };
    });
  },

  removeUser: (userId: string) => {
    set((state) => {
      const next = new Set(state.onlineUserIds);
      next.delete(userId);
      return { onlineUserIds: next };
    });
  },
}));

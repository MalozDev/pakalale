"use client";

import { create } from "zustand";

interface DealState {
  dealCount: number;
  incrementDealCount: () => void;
  resetDealCount: () => void;
}

export const useDealStore = create<DealState>()((set) => ({
  dealCount: 0,
  incrementDealCount: () => set((state) => ({ dealCount: state.dealCount + 1 })),
  resetDealCount: () => set({ dealCount: 0 }),
}));

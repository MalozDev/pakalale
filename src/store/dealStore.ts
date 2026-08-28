"use client";

import { create } from "zustand";

interface DealState {
  dealCount: number;
  setDealCount: (count: number) => void;
  incrementDealCount: () => void;
  decrementDealCount: () => void;
  resetDealCount: () => void;
}

export const useDealStore = create<DealState>()((set) => ({
  dealCount: 0,
  setDealCount: (count) => set({ dealCount: count }),
  incrementDealCount: () => set((state) => ({ dealCount: state.dealCount + 1 })),
  decrementDealCount: () => set((state) => ({ dealCount: Math.max(0, state.dealCount - 1) })),
  resetDealCount: () => set({ dealCount: 0 }),
}));

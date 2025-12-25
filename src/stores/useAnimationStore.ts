import { create } from "zustand";

export interface WinnerRecord {
  id: string;
  name: string;
  prize: string;
  color: string;
  timestamp: number;
}

interface AnimationStore {
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;
  toggleAnimation: () => void;
  winnerRecords: WinnerRecord[];
  addWinnerRecord: (record: Omit<WinnerRecord, "timestamp">) => void;
  clearWinnerRecords: () => void;
}

export const useAnimationStore = create<AnimationStore>((set) => ({
  isAnimating: false,
  setIsAnimating: (value) => set({ isAnimating: value }),
  toggleAnimation: () => set((state) => ({ isAnimating: !state.isAnimating })),
  winnerRecords: [],
  addWinnerRecord: (record) =>
    set((state) => ({
      winnerRecords: [
        ...state.winnerRecords,
        { ...record, timestamp: Date.now() },
      ],
    })),
  clearWinnerRecords: () => set({ winnerRecords: [] }),
}));

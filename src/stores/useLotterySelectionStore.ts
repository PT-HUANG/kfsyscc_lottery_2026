import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LotterySelectionStore {
  // Selection states
  selectedPrizeId: string;
  setSelectedPrizeId: (id: string) => void;

  selectedGroup: string;
  setSelectedGroup: (group: string) => void;

  drawMode: 'single' | 'all';
  setDrawMode: (mode: 'single' | 'all') => void;

  // Reset all selections
  reset: () => void;
}

export const useLotterySelectionStore = create<LotterySelectionStore>()(
  persist(
    (set) => ({
      selectedPrizeId: '',
      setSelectedPrizeId: (id) => set({ selectedPrizeId: id }),

      selectedGroup: '',
      setSelectedGroup: (group) => set({ selectedGroup: group }),

      drawMode: 'all',
      setDrawMode: (mode) => set({ drawMode: mode }),

      reset: () => set({
        selectedPrizeId: '',
        selectedGroup: '',
        drawMode: 'all',
      }),
    }),
    {
      name: 'lottery-selection',
    }
  )
);

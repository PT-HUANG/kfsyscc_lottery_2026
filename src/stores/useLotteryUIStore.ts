import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LotteryUIStore {
  // Modal states
  showManagement: boolean;
  openManagement: () => void;
  closeManagement: () => void;

  showBgPanel: boolean;
  openBgPanel: () => void;
  closeBgPanel: () => void;
  toggleBgPanel: () => void;

  // Winner board visibility
  showWinnerBoard: boolean;
  setShowWinnerBoard: (show: boolean) => void;
  toggleWinnerBoard: () => void;

  // Loading states
  loading: boolean;
  setLoading: (loading: boolean) => void;

  progress: number;
  setProgress: (progress: number) => void;

  sceneReady: boolean;
  setSceneReady: (ready: boolean) => void;
}

export const useLotteryUIStore = create<LotteryUIStore>()(
  persist(
    (set) => ({
      // Modal states
      showManagement: false,
      openManagement: () => set({ showManagement: true }),
      closeManagement: () => set({ showManagement: false }),

      showBgPanel: false,
      openBgPanel: () => set({ showBgPanel: true }),
      closeBgPanel: () => set({ showBgPanel: false }),
      toggleBgPanel: () => set((state) => ({ showBgPanel: !state.showBgPanel })),

      // Winner board visibility
      showWinnerBoard: true, // 預設顯示
      setShowWinnerBoard: (show) => set({ showWinnerBoard: show }),
      toggleWinnerBoard: () => set((state) => ({ showWinnerBoard: !state.showWinnerBoard })),

      // Loading states
      loading: true,
      setLoading: (loading) => set({ loading }),

      progress: 0,
      setProgress: (progress) => set({ progress }),

      sceneReady: false,
      setSceneReady: (ready) => set({ sceneReady: ready }),
    }),
    {
      name: 'lottery-ui',
      partialize: (state) => ({
        showBgPanel: state.showBgPanel,
        showWinnerBoard: state.showWinnerBoard, // 持久化看板顯示狀態
      }),
    }
  )
);

import { create } from 'zustand';

interface LotteryUIStore {
  // Modal states
  showManagement: boolean;
  openManagement: () => void;
  closeManagement: () => void;

  showBgPanel: boolean;
  openBgPanel: () => void;
  closeBgPanel: () => void;
  toggleBgPanel: () => void;

  // Loading states
  loading: boolean;
  setLoading: (loading: boolean) => void;

  progress: number;
  setProgress: (progress: number) => void;

  sceneReady: boolean;
  setSceneReady: (ready: boolean) => void;
}

export const useLotteryUIStore = create<LotteryUIStore>((set) => ({
  // Modal states
  showManagement: false,
  openManagement: () => set({ showManagement: true }),
  closeManagement: () => set({ showManagement: false }),

  showBgPanel: false,
  openBgPanel: () => set({ showBgPanel: true }),
  closeBgPanel: () => set({ showBgPanel: false }),
  toggleBgPanel: () => set((state) => ({ showBgPanel: !state.showBgPanel })),

  // Loading states
  loading: true,
  setLoading: (loading) => set({ loading }),

  progress: 0,
  setProgress: (progress) => set({ progress }),

  sceneReady: false,
  setSceneReady: (ready) => set({ sceneReady: ready }),
}));

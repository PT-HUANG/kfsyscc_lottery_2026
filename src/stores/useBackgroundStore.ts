import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BackgroundConfig {
  positionX: number;
  positionY: number;
  positionZ: number;
  scale: number;
}

interface BackgroundStore {
  // Background configuration
  config: BackgroundConfig;
  updateConfig: (config: Partial<BackgroundConfig>) => void;
  resetConfig: () => void;

  // Background image selection
  selectedBackground: string;
  setSelectedBackground: (name: string) => void;

  // Image refresh key for cache busting
  imageRefreshKey: number;
  refreshImage: () => void;
}

const DEFAULT_CONFIG: BackgroundConfig = {
  positionX: 11,
  positionY: -1,
  positionZ: -67,
  scale: 150,
};

export const useBackgroundStore = create<BackgroundStore>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      updateConfig: (partial) =>
        set((state) => ({
          config: { ...state.config, ...partial }
        })),
      resetConfig: () => set({ config: DEFAULT_CONFIG }),

      selectedBackground: 'OfficeBG',
      setSelectedBackground: (name) => set({ selectedBackground: name }),

      imageRefreshKey: 0,
      refreshImage: () =>
        set((state) => ({
          imageRefreshKey: state.imageRefreshKey + 1
        })),
    }),
    {
      name: 'background-config',
    }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getThemeChannel } from "@/utils/themeChannel";

export type ThemeType = "classic" | "modern" | "elegant" | "pastel";

interface ThemeStore {
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      currentTheme: "classic",
      setTheme: (theme) => {
        set({ currentTheme: theme });
        // 🎯 通過 Broadcast Channel 通知其他分頁
        const channel = getThemeChannel();
        if (channel) {
          channel.postMessage({
            type: "THEME_CHANGE",
            theme,
          });
          channel.close();
        }
      },
    }),
    {
      name: "lottery-theme-storage",
    }
  )
);

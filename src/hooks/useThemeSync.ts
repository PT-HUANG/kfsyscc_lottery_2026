import { useEffect } from "react";
import { getThemeChannel, ThemeMessage } from "@/utils/themeChannel";
import { useThemeStore } from "@/stores/useThemeStore";

export function useThemeSync() {
  useEffect(() => {
    const channel = getThemeChannel();
    if (!channel) return;

    channel.onmessage = (event: MessageEvent<ThemeMessage>) => {
      const data = event.data;

      if (data.type === "THEME_CHANGE") {
        // 🎯 直接更新 store 狀態，但不再發送 broadcast（避免循環）
        useThemeStore.setState({ currentTheme: data.theme });
      }
    };

    return () => {
      channel.close();
    };
  }, []);
}

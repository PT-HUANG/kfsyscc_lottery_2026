import { ThemeType } from "@/stores/useThemeStore";

export const THEME_CHANNEL_NAME = "lottery_theme_channel_v1";

export type ThemeMessage = {
  type: "THEME_CHANGE";
  theme: ThemeType;
};

export const getThemeChannel = () => {
  if (typeof window === "undefined") return null;
  return new BroadcastChannel(THEME_CHANNEL_NAME);
};

"use client";

import { useThemeStore, ThemeType } from "@/stores/useThemeStore";

const themeOptions: { value: ThemeType; label: string; description: string }[] = [
  {
    value: "classic",
    label: "慶典緋紅金",
    description: "傳統喜慶氛圍",
  },
  {
    value: "modern",
    label: "極光電幻",
    description: "未來科技風格",
  },
  {
    value: "elegant",
    label: "星幕金黑",
    description: "奢華琥珀金質感",
  },
  {
    value: "pastel",
    label: "夢幻櫻粉",
    description: "柔和櫻花配色",
  },
];

export default function ThemeSelector() {
  const { currentTheme, setTheme } = useThemeStore();

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 rounded-lg shadow-[0_8px_30px_rgba(168,85,247,0.2)] border-2 border-amber-400 p-5">
      <label className="block text-base font-bold text-amber-900 mb-2">
        中獎看板主題
      </label>

      <select
        value={currentTheme}
        onChange={(e) => setTheme(e.target.value as ThemeType)}
        className="w-full px-3 py-2.5 bg-amber-100 border-2 border-amber-300 rounded-lg text-sm font-medium text-amber-900 cursor-pointer outline-none focus:ring-2 focus:ring-amber-400 transition-all hover:border-amber-400"
      >
        {themeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} - {option.description}
          </option>
        ))}
      </select>

      <div className="border-t border-amber-300/50 mt-4 mb-3" />

      {/* 主題預覽 */}
      <div className="p-3 rounded-lg border-2 border-amber-200 bg-white/50 backdrop-blur-sm">
        <div className="text-xs font-bold text-amber-700 mb-2 uppercase tracking-wider">目前主題預覽</div>
        
        {currentTheme === "classic" && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-red-700 to-red-500 shadow-sm border border-red-900/20"></div>
            <div className="flex flex-col">
              <span className="text-sm text-red-900 font-bold">慶典緋紅金風格</span>
            </div>
          </div>
        )}
        
        {currentTheme === "modern" && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-600 to-purple-600 shadow-sm border border-indigo-900/20"></div>
            <div className="flex flex-col">
              <span className="text-sm text-indigo-900 font-bold">極光電幻風格</span>
            </div>
          </div>
        )}
        
        {currentTheme === "elegant" && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-600 to-yellow-400 shadow-sm border border-amber-900/20"></div>
            <div className="flex flex-col">
              <span className="text-sm text-amber-900 font-bold">星幕金黑風格</span>
            </div>
          </div>
        )}
        
        {currentTheme === "pastel" && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-pink-300 shadow-sm border border-pink-900/20"></div>
            <div className="flex flex-col">
              <span className="text-sm text-pink-900 font-bold">夢幻櫻粉風格</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";
import LotteryControlPanel from "@/components/LotteryControlPanel";
import FloatingBackgroundPanel from "@/components/FloatingBackgroundPanel";
import ThemeSelector from "@/components/ThemeSelector";
import ManagementModal from "@/components/ManagementModal";
import { useLotteryUIStore } from "@/stores/useLotteryUIStore";
import { useLotteryReceiver } from "@/hooks/useLotteryReceiver";
import { useStorageSync } from "@/hooks/useStorageSync";
import { useThemeSync } from "@/hooks/useThemeSync";

export default function BackstagePage() {
  // Sync state from frontend (e.g. isAnimating)
  useLotteryReceiver();
  // Sync data from other tabs (localStorage)
  useStorageSync();
  // Sync theme from other tabs (BroadcastChannel)
  useThemeSync();

  const {
    showManagement,
    closeManagement,
  } = useLotteryUIStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4 md:p-8 flex flex-col gap-6">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-600 drop-shadow-sm">
          抽獎後台管理系統
        </h1>
      </header>

      <main className="flex flex-col md:flex-row gap-6 items-start max-w-7xl mx-auto w-full">
        {/* Left Column: Main Control */}
        <div className="flex-1 w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-amber-200/60 mb-4 hover:shadow-xl transition-shadow">
             <h2 className="text-lg font-bold mb-3 text-amber-900 border-b border-amber-100 pb-2">抽獎控制</h2>
             <LotteryControlPanel />
          </div>
        </div>

        {/* Right Column: Settings & Background */}
        <div className="flex-1 w-full max-w-md flex flex-col gap-4">
           {/* Theme Selector */}
           <div className="bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-amber-200/60 transition-all hover:shadow-xl">
              <h2 className="text-lg font-bold mb-3 text-amber-900 border-b border-amber-100 pb-2">主題風格設定</h2>
              <ThemeSelector />
           </div>

           {/* Background Settings */}
           <div className="bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-amber-200/60 transition-all hover:shadow-xl">
              <h2 className="text-lg font-bold mb-3 text-amber-900 border-b border-amber-100 pb-2">背景設定</h2>
              <FloatingBackgroundPanel />
           </div>
        </div>
      </main>

      <ManagementModal isOpen={showManagement} onClose={closeManagement} />
    </div>
  );
}

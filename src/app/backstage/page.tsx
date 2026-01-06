"use client";
import LotteryControlPanel from "@/components/LotteryControlPanel";
import FloatingBackgroundPanel from "@/components/FloatingBackgroundPanel";
import ManagementModal from "@/components/ManagementModal";
import { useLotteryUIStore } from "@/stores/useLotteryUIStore";
import { useLotteryReceiver } from "@/hooks/useLotteryReceiver";
import { useStorageSync } from "@/hooks/useStorageSync";

export default function BackstagePage() {
  // Sync state from frontend (e.g. isAnimating)
  useLotteryReceiver();
  // Sync data from other tabs (localStorage)
  useStorageSync();

  const {
    showManagement,
    closeManagement,
  } = useLotteryUIStore();

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col gap-6">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">抽獎後台管理系統</h1>
      </header>

      <main className="flex flex-col md:flex-row gap-6 items-start max-w-7xl mx-auto w-full">
        {/* Left Column: Main Control */}
        <div className="flex-1 w-full max-w-md">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4">
             <h2 className="text-lg font-semibold mb-3 text-gray-700">抽獎控制</h2>
             <LotteryControlPanel />
          </div>
        </div>

        {/* Right Column: Settings & Background */}
        <div className="flex-1 w-full max-w-md flex flex-col gap-4">
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition-all">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">背景設定</h2>
              <FloatingBackgroundPanel />
           </div>
        </div>
      </main>

      <ManagementModal isOpen={showManagement} onClose={closeManagement} />
    </div>
  );
}

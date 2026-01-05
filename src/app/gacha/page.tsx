"use client";
import { useCallback } from "react";
import Scene from "@/components/Scene";
import WinnerRecordBoard from "@/components/WinnerRecordBoard";
import ManagementModal from "@/components/ManagementModal";
import FloatingBackgroundPanel from "@/components/FloatingBackgroundPanel";
import LoadingScene from "@/components/LoadingScene";
import LotteryControlPanel from "@/components/LotteryControlPanel";
import { useLotteryUIStore } from "@/stores/useLotteryUIStore";
import { useLotteryDataStore } from "@/stores/useLotteryDataStore";
import "./loading.css";

export default function GachaPage() {
  // UI Store
  const {
    loading,
    setSceneReady,
    showManagement,
    closeManagement,
    showBgPanel,
  } = useLotteryUIStore();

  // Data Store
  const { isAnimating, showWinnerModal } = useLotteryDataStore();

  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
  }, [setSceneReady]);

  return (
    <>
      {/* 扭蛋機場景 */}
      <Scene onReadyAction={handleSceneReady} />

      {/* 左側結果顯示面板 */}
      {!loading && !isAnimating && !showWinnerModal && (
        <div className="fixed top-3 left-3 z-10 flex flex-col items-stretch gap-2 w-[40vw] md:w-[28vw] max-w-[350px]">
          <WinnerRecordBoard />
        </div>
      )}

      {/* 右側控制面板區域 - 垂直響應式佈局 */}
      {!loading && !isAnimating && !showWinnerModal && (
        <div className="fixed top-3 right-3 z-10 w-[52vw] sm:w-[28vw] max-w-[350px] flex flex-col gap-2 sm:gap-3">
          {/* 抽獎控制面板 - 佔據主要空間 */}
          <div
            className={`${
              showBgPanel ? "flex-[65]" : "flex-none"
            } min-h-0 overflow-y-auto custom-scrollbar`}
          >
            <LotteryControlPanel />
          </div>

          {/* 背景設定面板 - 佔據次要空間 */}
          <div
            className={`flex-[35] transition-opacity min-h-0 overflow-y-auto custom-scrollbar ${
              showBgPanel ? "opacity-100" : "opacity-0"
            }`}
          >
            <FloatingBackgroundPanel />
          </div>
        </div>
      )}

      {/* 管理後台 */}
      <ManagementModal isOpen={showManagement} onClose={closeManagement} />

      {/* Loading 畫面 */}
      {loading && <LoadingScene />}

      {!loading && (
        <div className="hidden sm:block fixed bottom-2 left-1/2 translate-x-[-30%] z-50 text-black text-lg">
          version: v26.01.05
        </div>
      )}
    </>
  );
}

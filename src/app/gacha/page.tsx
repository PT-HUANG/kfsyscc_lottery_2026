"use client";
import { useCallback } from "react";
import Scene from "@/components/Scene";
import WinnerRecordBoard from "@/components/WinnerRecordBoard";
import LoadingScene from "@/components/LoadingScene";
import { useLotteryUIStore } from "@/stores/useLotteryUIStore";
import { useLotteryDataStore } from "@/stores/useLotteryDataStore";
import { useStorageSync } from "@/hooks/useStorageSync";
import "./loading.css";

export default function GachaPage() {
  // Sync data from other tabs (localStorage)
  useStorageSync();

  // UI Store
  const {
    loading,
    setSceneReady,
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
      {!loading && !showWinnerModal && !isAnimating && (
        <div className="fixed top-3 left-3 z-10 flex flex-col items-stretch gap-2 w-[40vw] md:w-[28vw] max-w-[350px]">
          <WinnerRecordBoard />
        </div>
      )}

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

"use client";
import { useCallback } from "react";
import Scene from "@/components/Scene";
import WinnerRecordBoard from "@/components/WinnerRecordBoard";
import LoadingScene from "@/components/LoadingScene";
import { useLotteryUIStore } from "@/stores/useLotteryUIStore";
import { useLotteryDataStore } from "@/stores/useLotteryDataStore";
import { useStorageSync } from "@/hooks/useStorageSync";
import { useThemeSync } from "@/hooks/useThemeSync";
import "./loading.css";

export default function GachaPage() {
  // Sync data from other tabs (localStorage)
  useStorageSync();
  // Sync theme from backstage (BroadcastChannel)
  useThemeSync();

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
    </>
  );
}

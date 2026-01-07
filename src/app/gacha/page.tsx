"use client";
import { useCallback } from "react";
import Scene from "@/components/Scene";
import WinnerRecordBoard from "@/components/WinnerRecordBoard";
import LoadingScene from "@/components/LoadingScene";
import { useLotteryUIStore } from "@/stores/useLotteryUIStore";
import { useLotteryDataStore } from "@/stores/useLotteryDataStore";
import { useStorageSync } from "@/hooks/useStorageSync";
import { useThemeSync } from "@/hooks/useThemeSync";
import { usePreventClose } from "@/hooks/usePreventClose";
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
    showWinnerBoard,
  } = useLotteryUIStore();

  // Data Store
  const { isAnimating, showWinnerModal, isAnnouncingResults } = useLotteryDataStore();

  // 🎯 防止在抽奖或公布结果时关闭页面
  usePreventClose(
    isAnimating || isAnnouncingResults || showWinnerModal,
    "抽獎正在進行中，確定要離開嗎？"
  );

  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
  }, [setSceneReady]);

  return (
    <>
      {/* 扭蛋機場景 */}
      <Scene onReadyAction={handleSceneReady} />

      {/* 左側結果顯示面板 */}
      {!loading && !showWinnerModal && !isAnimating && showWinnerBoard && (
        <div className="fixed top-3 left-3 z-10 flex flex-col items-stretch gap-2 w-[40vw] md:w-[28vw] max-w-[350px]">
          <WinnerRecordBoard />
        </div>
      )}

      {/* Loading 畫面 */}
      {loading && <LoadingScene />}
    </>
  );
}

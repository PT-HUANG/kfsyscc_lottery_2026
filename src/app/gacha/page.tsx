"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import Scene from "@/components/Scene";
import { Button } from "@/components/ui/button";
import WinnerRecordBoard from "@/components/WinnerRecordBoard";
import ManagementModal from "@/components/ManagementModal";
import { useAnimationStore } from "@/stores/useAnimationStore";
import { useLotteryLogic } from "@/hooks/useLotteryLogic";
import "./loading.css";

function RotatingBox() {
  const meshRef = useRef<Mesh>(null);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} scale={2}>
      <boxGeometry />
      <meshNormalMaterial />
    </mesh>
  );
}

function LoadingScene({ progress }: { progress: number }) {
  return (
    <div className="loading-container">
      <div className="loading-content">
        {/* 3D旋转方块 */}
        <div className="canvas-container">
          <Canvas camera={{ fov: 50, position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <RotatingBox />
          </Canvas>
        </div>

        {/* Loading文字 */}
        <div className="loading-text">
          <h2 className="loading-title">Loading Gacha Machine...</h2>
        </div>

        {/* 进度条 */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-text">{Math.round(progress)}%</div>
        </div>
      </div>
    </div>
  );
}

export default function GachaPage() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [showManagement, setShowManagement] = useState(false);

  // 使用 Zustand store
  const { isAnimating, setIsAnimating } = useAnimationStore();

  // 抽獎邏輯
  const { validateLottery, prizes, winnerRecords } = useLotteryLogic();

  // 獎項選擇狀態
  const [selectedPrizeId, setSelectedPrizeId] = useState<string>("");
  const [drawMode, setDrawMode] = useState<"single" | "all">("all"); // single: 一次抽一個, all: 一次抽全部

  // 計算獎項的剩餘名額
  const getPrizeRemainingSlots = useCallback((prizeId: string) => {
    const prize = prizes.find((p) => p.id === prizeId);
    if (!prize) return 0;

    const winnersForThisPrize = winnerRecords.filter(
      (record) => record.prize === prize.name
    ).length;

    return Math.max(0, prize.quantity - winnersForThisPrize);
  }, [prizes, winnerRecords]);

  // 開始抽獎前驗證
  const handleStartLottery = () => {
    // 檢查是否有設定獎品
    if (prizes.length === 0) {
      alert("尚未設定獎項！請先在管理頁面新增獎項。");
      return;
    }

    // 檢查是否選擇了獎項
    if (!selectedPrizeId) {
      alert("請先選擇要抽取的獎項！");
      return;
    }

    const selectedPrize = prizes.find((p) => p.id === selectedPrizeId);
    if (!selectedPrize) {
      alert("選擇的獎項不存在！");
      return;
    }

    // 檢查該獎項是否還有剩餘名額
    const remainingSlots = getPrizeRemainingSlots(selectedPrizeId);
    if (remainingSlots === 0) {
      alert(`「${selectedPrize.name}」已抽完！請選擇其他獎項。`);
      return;
    }

    // 計算本次要抽取的人數
    const drawCount = drawMode === "all" ? remainingSlots : 1;

    // 檢查是否有足夠的參與者（排除已中獎者）
    const validation = validateLottery(drawCount, { skipWinners: true });
    if (!validation.valid) {
      alert(validation.error || "無法進行抽獎，請確認參與者名單。");
      return;
    }

    // 驗證通過，開始抽獎動畫
    setIsAnimating(true);
  };

  useEffect(() => {
    // 模拟加载进度
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const newProgress = Math.min(prev + 3, 100);
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // 当进度到100%且Scene准备好后，隐藏loading
  useEffect(() => {
    if (progress >= 100 && sceneReady) {
      // 稍微延迟一下，让用户看到100%
      const timer = setTimeout(() => {
        setLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress, sceneReady]);

  const handleSceneReady = useCallback(() => {
    console.log("Scene ready!"); // 调试用
    setSceneReady(true);
  }, []);

  // 自動選擇第一個有剩餘名額的獎項
  useEffect(() => {
    if (!selectedPrizeId && prizes.length > 0) {
      // 按照等級排序（從小到大），選擇第一個有剩餘名額的獎項
      const sortedPrizes = [...prizes].sort((a, b) => a.level - b.level);
      const firstAvailable = sortedPrizes.find((prize) => {
        const remaining = getPrizeRemainingSlots(prize.id);
        return remaining > 0;
      });
      if (firstAvailable) {
        setSelectedPrizeId(firstAvailable.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prizes, selectedPrizeId, winnerRecords]);

  return (
    <>
      {/* Scene始终渲染，用z-index和opacity控制显示 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: loading ? 0 : 1,
          pointerEvents: loading ? "none" : "auto",
          transition: "opacity 1s ease",
          zIndex: 1,
        }}
      >
        <Scene
          onReadyAction={handleSceneReady}
          selectedPrizeId={selectedPrizeId}
          drawCount={
            selectedPrizeId && drawMode === "all"
              ? getPrizeRemainingSlots(selectedPrizeId)
              : 1
          }
        />
      </div>

      {/* 控制按钮和計分版 */}
      {!loading && (
        <div className="fixed top-5 right-5 z-10 flex flex-col items-stretch gap-4 min-w-[320px]">
          {/* 獎項選擇器 */}
          {prizes.length > 0 && (
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  選擇獎項
                </label>
                <select
                  value={selectedPrizeId}
                  onChange={(e) => setSelectedPrizeId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  disabled={isAnimating}
                >
                  {[...prizes]
                    .sort((a, b) => a.level - b.level)
                    .map((prize) => {
                      const remaining = getPrizeRemainingSlots(prize.id);
                      return (
                        <option key={prize.id} value={prize.id}>
                          {prize.name} (剩餘 {remaining}/{prize.quantity} 名)
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* 抽獎模式 */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  抽獎模式
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDrawMode("single")}
                    disabled={isAnimating}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      drawMode === "single"
                        ? "bg-pink-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    單次抽一個
                  </button>
                  <button
                    onClick={() => setDrawMode("all")}
                    disabled={isAnimating}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      drawMode === "all"
                        ? "bg-pink-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    抽全部剩餘
                  </button>
                </div>
              </div>

              {/* 顯示本次將抽取的人數 */}
              {selectedPrizeId && (
                <div className="text-center text-sm text-gray-600 bg-pink-50 rounded px-3 py-2">
                  本次將抽取：
                  <span className="font-bold text-pink-600 ml-1">
                    {drawMode === "all"
                      ? getPrizeRemainingSlots(selectedPrizeId)
                      : 1}{" "}
                    人
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 抽獎按鈕 */}
          <div className="flex gap-2">
            <Button
              onClick={handleStartLottery}
              size="lg"
              disabled={isAnimating || prizes.length === 0}
              className="flex-1 text-xl font-semibold py-6 bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500 hover:from-pink-500 hover:via-pink-600 hover:to-rose-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {prizes.length === 0 ? "請先設定獎項" : "開始抽獎"}
            </Button>

            {/* 管理按鈕 */}
            <Button
              onClick={() => setShowManagement(true)}
              size="lg"
              className="min-w-[120px] text-xl font-semibold py-6 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              管理
            </Button>
          </div>

          {/* 計分版 */}
          <WinnerRecordBoard />
        </div>
      )}

      {/* 管理彈窗 */}
      <ManagementModal
        isOpen={showManagement}
        onClose={() => setShowManagement(false)}
      />

      {/* Loading覆盖在上面 */}
      {loading && (
        <div style={{ position: "fixed", top: 0, left: 0, zIndex: 10 }}>
          <LoadingScene progress={progress} />
        </div>
      )}
    </>
  );
}

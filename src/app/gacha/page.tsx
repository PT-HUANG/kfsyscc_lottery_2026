"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import Scene from "@/components/Scene";
import { Button } from "@/components/ui/button";
import WinnerRecordBoard from "@/components/WinnerRecordBoard";
import ManagementModal from "@/components/ManagementModal";
import FloatingBackgroundPanel from "@/components/FloatingBackgroundPanel";
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
  const [showBgPanel, setShowBgPanel] = useState(false);

  // 背景設定狀態
  const [bgConfig, setBgConfig] = useState({
    positionX: 4,
    positionY: 20,
    positionZ: -60,
    scale: 150,
  });

  // 使用 Zustand store
  const { isAnimating, setIsAnimating } = useAnimationStore();
  const showWinnerModal = useAnimationStore((state) => state.showWinnerModal);

  // 抽獎邏輯
  const { validateLottery, prizes, winnerRecords, participants } =
    useLotteryLogic();

  // 獎項選擇狀態
  const [selectedPrizeId, setSelectedPrizeId] = useState<string>("");
  const [drawMode, setDrawMode] = useState<"single" | "all">("all"); // single: 一次抽一個, all: 一次抽全部
  const [selectedGroup, setSelectedGroup] = useState<string>(""); // 選擇的分組（空字串表示全部）

  // 獲取所有可用的分組（去重，group 現在是必填）
  const availableGroups = Array.from(
    new Set(participants.map((p) => p.group))
  ).sort();

  // 計算獎項的剩餘名額
  const getPrizeRemainingSlots = useCallback(
    (prizeId: string) => {
      const prize = prizes.find((p) => p.id === prizeId);
      if (!prize) return 0;

      const winnersForThisPrize = winnerRecords.filter(
        (record) => record.prize === prize.name
      ).length;

      return Math.max(0, prize.quantity - winnersForThisPrize);
    },
    [prizes, winnerRecords]
  );

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

    // 檢查是否選擇了分組
    if (!selectedGroup) {
      alert("請選擇要抽獎的分組！");
      return;
    }

    // 檢查是否有足夠的參與者（排除已中獎者，考慮分組篩選）
    const validation = validateLottery(drawCount, {
      skipWinners: true,
      selectedGroup: selectedGroup,
    });
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

  // 🎯 當選擇的獎項有 allowedGroup 限制時，自動設定正確的分組
  useEffect(() => {
    if (selectedPrizeId) {
      const selectedPrize = prizes.find((p) => p.id === selectedPrizeId);
      if (selectedPrize?.allowedGroup) {
        // 如果獎項有分組限制，自動設定該分組
        setSelectedGroup(selectedPrize.allowedGroup);
      }
    }
  }, [selectedPrizeId, prizes]);

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
          selectedGroup={selectedGroup}
          backgroundConfig={bgConfig}
        />
      </div>

      {/* 控制按钮和計分版 */}
      {!loading && !isAnimating && !showWinnerModal && (
        <div className="fixed top-3 right-3 z-10 flex flex-col items-stretch gap-3 w-[25vw] max-w-[360px]">
          {/* 獎項選擇器 */}
          {prizes.length > 0 && (
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 space-y-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  選擇獎項
                </label>
                <select
                  value={selectedPrizeId}
                  onChange={(e) => setSelectedPrizeId(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
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

              {/* 分組選擇器 */}
              {availableGroups.length > 0 && (() => {
                const selectedPrize = prizes.find((p) => p.id === selectedPrizeId);
                const isGroupLocked = !!selectedPrize?.allowedGroup;

                return (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">
                      選擇分組 <span className="text-red-500">*</span>
                      {isGroupLocked && (
                        <span className="ml-1 text-xs font-normal text-orange-600">
                          (此獎項限定分組)
                        </span>
                      )}
                    </label>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={isAnimating || isGroupLocked}
                    >
                      <option value="">請選擇分組</option>
                      {availableGroups.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                    {isGroupLocked && selectedPrize?.allowedGroup && (
                      <p className="text-xs text-orange-600 mt-1">
                        此獎項僅限「{selectedPrize.allowedGroup}」分組參與
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* 抽獎模式 */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  抽獎模式
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDrawMode("single")}
                    disabled={isAnimating}
                    className={`flex-1 px-3 py-3 rounded-md text-xs font-medium transition-colors ${
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
                    className={`flex-1 px-3 py-3 rounded-md text-xs font-medium transition-colors ${
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
                <div className="text-center text-xs text-gray-600 bg-pink-50 rounded px-2 py-3">
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
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleStartLottery}
              disabled={isAnimating || prizes.length === 0}
              className="flex-1 text-lg font-semibold py-3 bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500 hover:from-pink-500 hover:via-pink-600 hover:to-rose-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {prizes.length === 0 ? "請先設定獎項" : "開始抽獎"}
            </Button>

            <div className="flex gap-2">
              {/* 管理按鈕 */}
              <Button
                onClick={() => setShowManagement(true)}
                className="flex-1 text-lg font-semibold py-6 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                管理
              </Button>

              {/* 背景設定按鈕 */}
              <Button
                onClick={() => setShowBgPanel(!showBgPanel)}
                className={`flex-1 text-lg font-semibold py-6 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  showBgPanel
                    ? "bg-gradient-to-br from-purple-600 via-purple-700 to-violet-700 ring-4 ring-purple-300"
                    : "bg-gradient-to-br from-purple-400 via-purple-500 to-violet-500 hover:from-purple-500 hover:via-purple-600 hover:to-violet-600"
                }`}
              >
                背景
              </Button>
            </div>
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

      {/* 浮動背景設定面板 */}
      {!loading && !isAnimating && !showWinnerModal && showBgPanel && (
        <FloatingBackgroundPanel
          config={bgConfig}
          onChange={setBgConfig}
          onClose={() => setShowBgPanel(false)}
        />
      )}

      {/* Loading覆盖在上面 */}
      {loading && (
        <div style={{ position: "fixed", top: 0, left: 0, zIndex: 10 }}>
          <LoadingScene progress={progress} />
        </div>
      )}
    </>
  );
}

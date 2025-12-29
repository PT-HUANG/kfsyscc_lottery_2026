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

        {/* 3D模型授權資訊 */}
        <div className="text-center mt-8 text-base text-gray-400 max-w-2xl mx-auto px-4">
          <p>
            3D Model based on{" "}
            <a
              href="https://sketchfab.com/3d-models/gacha-machine-upload-c2ff648add1e4062bb16313ce40ab5e3"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              &quot;Gacha machine upload&quot;
            </a>{" "}
            by{" "}
            <a
              href="https://sketchfab.com/ChesterLin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              ChesterLin
            </a>
            , licensed under{" "}
            <a
              href="http://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              CC-BY-4.0
            </a>
          </p>
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
    positionX: 11,
    positionY: -1,
    positionZ: -67,
    scale: 150,
  });

  // 圖片刷新 key（當圖片上傳時遞增此值以觸發重新加載）
  const [imageRefreshKey, setImageRefreshKey] = useState(0);

  // 選中的預設背景圖片
  const [selectedBackground, setSelectedBackground] = useState("OfficeBG");

  // 處理圖片上傳完成
  const handleImageUpload = useCallback(() => {
    setImageRefreshKey((prev) => prev + 1);
  }, []);

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

  // 根據選擇的分組過濾獎項
  const getFilteredPrizes = useCallback(() => {
    if (!selectedGroup) {
      return []; // 沒選分組，不顯示任何獎項
    }
    return prizes.filter((prize) => {
      // 如果獎項沒有限定分組，或限定分組等於選擇的分組，則顯示
      return !prize.allowedGroup || prize.allowedGroup === selectedGroup;
    });
  }, [prizes, selectedGroup]);

  const filteredPrizes = getFilteredPrizes();

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

  // 🎯 當分組改變時，自動選擇第一個可用的獎項
  useEffect(() => {
    if (!selectedGroup) {
      // 如果沒有選擇分組，清空獎項選擇
      setSelectedPrizeId("");
      return;
    }

    // 檢查當前選擇的獎項是否還在過濾後的列表中
    const isCurrentPrizeValid = filteredPrizes.some(
      (p) => p.id === selectedPrizeId
    );

    if (!isCurrentPrizeValid || !selectedPrizeId) {
      // 如果當前獎項無效，或沒有選擇，則自動選擇第一個有剩餘名額的獎項
      const sortedPrizes = [...filteredPrizes].sort(
        (a, b) => a.level - b.level
      );
      const firstAvailable = sortedPrizes.find((prize) => {
        const remaining = getPrizeRemainingSlots(prize.id);
        return remaining > 0;
      });
      if (firstAvailable) {
        setSelectedPrizeId(firstAvailable.id);
      } else {
        setSelectedPrizeId("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup, filteredPrizes]);

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
          imageRefreshKey={imageRefreshKey}
          selectedBackground={selectedBackground}
        />
      </div>

      {/* 控制按钮和計分版 */}
      {!loading && !isAnimating && !showWinnerModal && (
        <div className="fixed top-3 right-3 z-10 flex flex-col items-stretch gap-2 w-[28vw] max-w-[350px] max-h-[98vh]">
          {/* 抽獎控制面板（合併設定與按鈕） */}
          <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 rounded-lg shadow-[0_8px_30px_rgba(168,85,247,0.2)] px-4 py-5 border-2 border-amber-400 flex flex-col gap-3">
            {/* 抽獎設定區 */}
            {prizes.length > 0 && (
              <>
                {/* 1️⃣ 分組選擇器（先選擇分組） */}
                {availableGroups.length > 0 && (
                  <div>
                    <label className="text-base font-bold text-amber-900 flex items-center gap-1.5">
                      分組
                    </label>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full px-2 py-2.5 text-sm border-2 border-amber-300 rounded-lg bg-amber-100 text-amber-900 font-medium focus:outline-none focus:ring-3 focus:ring-amber-400/50 focus:border-amber-400 shadow-sm transition-all hover:border-amber-400"
                      disabled={isAnimating}
                    >
                      <option value="">請選擇分組</option>
                      {availableGroups.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 2️⃣ 獎項選擇器（根據分組顯示對應獎項） */}
                <div>
                  <label className="text-base font-bold text-amber-900 flex items-center gap-1.5">
                    獎項
                  </label>
                  <select
                    value={selectedPrizeId}
                    onChange={(e) => setSelectedPrizeId(e.target.value)}
                    className="w-full px-2 py-2.5 text-sm border-2 border-amber-300 rounded-lg bg-amber-100 text-amber-900 font-medium focus:outline-none focus:ring-3 focus:ring-amber-400/50 focus:border-amber-400 shadow-sm transition-all hover:border-amber-400 disabled:bg-amber-50/50 disabled:cursor-not-allowed disabled:border-amber-200"
                    disabled={
                      isAnimating ||
                      !selectedGroup ||
                      filteredPrizes.length === 0
                    }
                  >
                    {!selectedGroup && <option value="">請先選擇分組</option>}
                    {selectedGroup && filteredPrizes.length === 0 && (
                      <option value="">此分組沒有可用獎項</option>
                    )}
                    {selectedGroup &&
                      filteredPrizes.length > 0 &&
                      [...filteredPrizes]
                        .sort((a, b) => a.level - b.level)
                        .map((prize) => {
                          const remaining = getPrizeRemainingSlots(prize.id);
                          return (
                            <option key={prize.id} value={prize.id}>
                              {prize.name} (剩餘 {remaining}/{prize.quantity}{" "}
                              名)
                            </option>
                          );
                        })}
                  </select>
                </div>

                {/* 3️⃣ 抽獎模式 */}
                <div>
                  <label className="text-base font-bold text-amber-900 flex items-center gap-1.5">
                    抽獎模式
                  </label>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setDrawMode("single")}
                      disabled={isAnimating}
                      className={`flex-1 px-3 py-2 rounded-lg text-base font-bold shadow-md relative border-[3px] text-white transition-opacity duration-200 ${
                        drawMode === "single"
                          ? "shadow-[0_4px_14px_rgba(168,85,247,0.9),0_0_25px_rgba(217,70,239,0.7)] opacity-100"
                          : "opacity-50 hover:opacity-100 hover:shadow-lg"
                      } `}
                      style={
                        drawMode === "single"
                          ? {
                              background: `
                                linear-gradient(#a855f7, #a855f7) padding-box,
                                conic-gradient(
                                  from calc(var(--border-angle, 0deg)),
                                  #a855f7 0%,
                                  #d946ef 3%,
                                  #e879f9 6%,
                                  #f0abfc 9%,
                                  #fae8ff 12%,
                                  #a855f7 16%,
                                  #a855f7 50%,
                                  #d946ef 53%,
                                  #e879f9 56%,
                                  #f0abfc 59%,
                                  #fae8ff 62%,
                                  #a855f7 66%,
                                  #a855f7 100%
                                ) border-box
                              `,
                              border: "3px solid transparent",
                              animation: "border-rotate 2.8s linear infinite",
                            }
                          : {
                              background: "#a855f7",
                              border: "3px solid transparent",
                            }
                      }
                    >
                      <style>{`
                        @property --border-angle {
                          syntax: "<angle>";
                          initial-value: 0deg;
                          inherits: false;
                        }
                        @keyframes border-rotate {
                          from { --border-angle: 0deg; }
                          to { --border-angle: 360deg; }
                        }
                      `}</style>
                      <span className="relative z-10">抽一個</span>
                    </button>
                    <button
                      onClick={() => setDrawMode("all")}
                      disabled={isAnimating}
                      className={`flex-1 px-3 py-2 rounded-lg text-base font-bold shadow-md relative border-[3px] text-white transition-opacity duration-200 ${
                        drawMode === "all"
                          ? "shadow-[0_4px_14px_rgba(168,85,247,0.9),0_0_25px_rgba(217,70,239,0.7)] opacity-100"
                          : "opacity-50 hover:opacity-100 hover:shadow-lg"
                      } `}
                      style={
                        drawMode === "all"
                          ? {
                              background: `
                                linear-gradient(#a855f7, #a855f7) padding-box,
                                conic-gradient(
                                  from calc(var(--border-angle, 0deg)),
                                  #a855f7 0%,
                                  #d946ef 3%,
                                  #e879f9 6%,
                                  #f0abfc 9%,
                                  #fae8ff 12%,
                                  #a855f7 16%,
                                  #a855f7 50%,
                                  #d946ef 53%,
                                  #e879f9 56%,
                                  #f0abfc 59%,
                                  #fae8ff 62%,
                                  #a855f7 66%,
                                  #a855f7 100%
                                ) border-box
                              `,
                              border: "3px solid transparent",
                              animation: "border-rotate 2.8s linear infinite",
                            }
                          : {
                              background: "#a855f7",
                              border: "3px solid transparent",
                            }
                      }
                    >
                      <span className="relative z-10">抽全部</span>
                    </button>
                  </div>
                </div>

                {/* 顯示本次將抽取的人數 */}
                {selectedPrizeId && (
                  <div className="text-center text-sm text-amber-900 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg px-3 py-2.5 border-2 border-amber-300 shadow-sm">
                    <span className="font-medium">本次將抽取：</span>
                    <span className="font-black text-rose-500 ml-1 text-base">
                      {drawMode === "all"
                        ? getPrizeRemainingSlots(selectedPrizeId)
                        : getPrizeRemainingSlots(selectedPrizeId) === 0
                        ? 0
                        : 1}{" "}
                      人
                    </span>
                  </div>
                )}
              </>
            )}

            {/* 抽獎按鈕區 */}
            <div className="flex flex-col gap-3">
              <div>
                <Button
                  onClick={handleStartLottery}
                  disabled={
                    isAnimating ||
                    prizes.length === 0 ||
                    getPrizeRemainingSlots(selectedPrizeId) === 0
                  }
                  className="w-full text-lg font-bold py-6 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white border-0 hover:shadow-[0_8px_30px_rgba(16,185,129,0.6)] hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {prizes.length === 0 ? "請先設定獎項" : "開始抽獎"}
                </Button>
              </div>

              <div className="flex gap-2.5">
                {/* 管理按鈕 */}
                <Button
                  onClick={() => setShowManagement(true)}
                  className="flex-1 text-base font-bold py-6 rounded-lg bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200"
                >
                  設定
                </Button>

                {/* 背景設定按鈕 */}
                <Button
                  onClick={() => setShowBgPanel(!showBgPanel)}
                  className={`flex-1 text-base font-bold py-6 rounded-lg text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 ${
                    showBgPanel
                      ? "bg-rose-600 hover:bg-rose-600 ring-3 ring-rose-300 scale-[1.02]"
                      : "bg-rose-500 hover:bg-rose-600 hover:scale-[1.02] active:scale-95"
                  }`}
                >
                  背景
                </Button>
              </div>
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
          onImageUpload={handleImageUpload}
          selectedBackground={selectedBackground}
          onBackgroundChange={setSelectedBackground}
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

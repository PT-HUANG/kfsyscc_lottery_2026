"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Html,
  useTexture,
} from "@react-three/drei";
import { Physics, RapierRigidBody } from "@react-three/rapier";
import { useRef, useEffect, useState, createRef, useMemo, useCallback } from "react";
import * as THREE from "three";
import FloatingText from "@/components/FloatingText";
import CameraAnimation from "@/components/CameraAnimation";
import Coin from "@/components/Coin";
import GachaMachine, { preloadGachaMachine } from "@/components/GachaMachine";
import GachaBall from "@/components/GachaBall";
import WinnerModal from "@/components/WinnerModal";
import { useLotteryDataStore } from "@/stores/useLotteryDataStore";
import { useLotterySelectionStore } from "@/stores/useLotterySelectionStore";
import { useBackgroundStore, type BackgroundConfig } from "@/stores/useBackgroundStore";
import { useLotteryUIStore } from "@/stores/useLotteryUIStore";
import { useLotteryLogic } from "@/hooks/useLotteryLogic";
import { useLotteryReceiver } from "@/hooks/useLotteryReceiver";
import { useLotteryRemote } from "@/hooks/useLotteryRemote";
import { WinnerInfo } from "@/types/lottery";
import {
  COIN_CONFIG,
  SHAKE_CONFIG,
  GACHA_COLORS,
  GACHA_BALL_PHYSICS,
} from "@/config/gachaConfig";

// ==================== 背景平面組件 ====================

import {
  getBackgroundImage,
  blobToDataURL,
} from "@/utils/imageStorage";

interface BackgroundPlaneProps {
  config: BackgroundConfig;
  imageRefreshKey?: number; // 用于触发图片重新加载
  selectedBackground: string; // 選中的預設背景名稱
}

function BackgroundPlane({ config, imageRefreshKey, selectedBackground }: BackgroundPlaneProps) {
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(1.5); // 默认 1.5:1

  // 加载自定义背景图片
  useEffect(() => {
    async function loadCustomImage() {
      try {
        const storedImage = await getBackgroundImage();
        if (storedImage) {
          const dataUrl = await blobToDataURL(storedImage.blob);
          setCustomImageUrl(dataUrl);
          setImageAspectRatio(storedImage.aspectRatio);
        } else {
          // 没有自定义图片，使用默认图片
          setCustomImageUrl(null);
          setImageAspectRatio(1.5); // 默认图片的比例
        }
      } catch (error) {
        console.error("加載自定義背景圖片失敗：", error);
        setCustomImageUrl(null);
        setImageAspectRatio(1.5);
      }
    }

    loadCustomImage();
  }, [imageRefreshKey]); // 当 imageRefreshKey 变化时重新加载

  // 使用自定义图片或選中的預設圖片
  const imageUrl = customImageUrl || `/${selectedBackground}.png`;
  const originalTexture = useTexture(imageUrl);

  // 設定正確的色彩空間以保持原始顏色（克隆以避免修改原始 texture）
  const texture = useMemo(() => {
    const clonedTexture = originalTexture.clone();
    clonedTexture.colorSpace = THREE.SRGBColorSpace;
    clonedTexture.needsUpdate = true;
    return clonedTexture;
  }, [originalTexture]);

  // 根据图片比例计算平面尺寸（保持图片不变形）
  const planeWidth = config.scale * imageAspectRatio;
  const planeHeight = config.scale;

  return (
    <mesh
      position={[config.positionX, config.positionY, config.positionZ]}
      renderOrder={-1}
    >
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshBasicMaterial
        map={texture}
        toneMapped={false} // 停用色調映射以保持原始顏色
        transparent={false}
      />
    </mesh>
  );
}

// ==================== 類型定義 ====================
interface GachaSceneProps {
  onLoad?: () => void;
  selectedPrizeId?: string;
  drawCount?: number;
  selectedGroup?: string; // 選擇的分組
}

// ==================== 扭蛋場景組件 ====================
function GachaScene({
  onLoad,
  selectedPrizeId,
  drawCount = 1,
  selectedGroup,
}: GachaSceneProps) {
  const hasCalledOnLoad = useRef(false);

  // Remote Control Hooks
  const { pendingWinnersRef, pendingBallColorRef, pendingSkipAnimationRef } = useLotteryReceiver();
  const { syncAnimationState, syncWinnerModalState, syncAnnouncingState } = useLotteryRemote();

  const isAnimating = useLotteryDataStore((state) => state.isAnimating);
  const setIsAnimating = useLotteryDataStore((state) => state.setIsAnimating);
  const addWinnerRecord = useLotteryDataStore((state) => state.addWinnerRecord);
  const setIsAnnouncingResults = useLotteryDataStore((state) => state.setIsAnnouncingResults); // 🎯 設定公布結果狀態
  const showWinnerModal = useLotteryDataStore((state) => state.showWinnerModal);
  const setShowWinnerModal = useLotteryDataStore((state) => state.setShowWinnerModal);
  const skipWinners = useLotteryDataStore((state) => state.skipWinners); // 讀取全域設定
  const skipAnimation = useLotteryDataStore((state) => state.skipAnimation); // 是否跳過動畫
  const startNewDrawSession = useLotteryDataStore((state) => state.startNewDrawSession); // 開始新的抽獎輪次
  const setCurrentDrawSessionId = useLotteryDataStore((state) => state.setCurrentDrawSessionId); // 設定當前抽獎輪次 ID

  // 🎯 當 Modal 關閉時（無論是本地還是遠端），重置 3D 場景狀態
  useEffect(() => {
    if (!showWinnerModal) {
      setSelectedBallId(null);
      setFloatingBallColor("");
      setFlashOpacity(0);
      floatingProgress.current = 0;
      setCurrentWinners([]);
      currentWinnersRef.current = [];
      hasStartedWinnerSequence.current = false;
      if (winnerSequenceInterval.current) {
        clearInterval(winnerSequenceInterval.current);
        winnerSequenceInterval.current = null;
      }
    }
  }, [showWinnerModal]);

  // 抽獎邏輯
  const { drawMultipleWinners, prizes } = useLotteryLogic();
  const [currentWinners, setCurrentWinners] = useState<WinnerInfo[]>([]);
  const currentWinnersRef = useRef<WinnerInfo[]>([]); // 🎯 Ref for animation loop access

  const [coinVisible, setCoinVisible] = useState(false);
  const [coinPosition, setCoinPosition] = useState<[number, number, number]>(
    COIN_CONFIG.START_POSITION.toArray() as [number, number, number]
  );
  const [coinOpacity, setCoinOpacity] = useState(1);
  const coinPositionRef = useRef(COIN_CONFIG.START_POSITION.clone());
  const coinAnimating = useRef(false);
  const isFading = useRef(false);

  const coinDisappearTime = useRef<number | null>(null);
  const [isMachineShaking, setIsMachineShaking] = useState(false);

  // 滑出的扭蛋球狀態
  const [slidingBalls, setSlidingBalls] = useState<
    Array<{
      id: number;
      position: [number, number, number];
      color: string;
      ref: React.RefObject<RapierRigidBody | null>;
    }>
  >([]);
  const ballIdCounter = useRef(0);

  // 動畫序列狀態
  const [selectedBallId, setSelectedBallId] = useState<number | null>(null);
  const [floatingBallColor, setFloatingBallColor] = useState<string>("");
  const [floatingBallPosition, setFloatingBallPosition] = useState<
    [number, number, number]
  >([0, 0, 0]);
  const floatingStartPosition = useRef<[number, number, number]>([0, 0, 0]);
  const [showFlash, setShowFlash] = useState(false);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const floatingProgress = useRef(0);

  const shouldStartAnimation = useRef(false);
  const prevIsAnimating = useRef(isAnimating);
  const hasStartedWinnerSequence = useRef(false); // 🎯 防止重複執行逐筆新增
  const winnerSequenceInterval = useRef<NodeJS.Timeout | null>(null); // 儲存 interval ID
  const animationInitialized = useRef(false); // 🎯 防止重複初始化動畫

  // 🎲 共用的抽獎邏輯函數
  const executeLottery = useCallback((): {
    winners: WinnerInfo[];
    ballColor: string;
  } | null => {
    // 優先使用遠端傳來的預計算中獎者
    if (pendingWinnersRef.current && pendingWinnersRef.current.length > 0) {
       const winners = pendingWinnersRef.current;
       const ballColor = pendingBallColorRef.current || GACHA_COLORS[0];
       
       // Clear pending
       pendingWinnersRef.current = null;
       
       return { winners, ballColor };
    }

    // 取得選擇的獎項
    let currentPrize = prizes.find((p) => p.id === selectedPrizeId);
    if (!currentPrize && prizes.length > 0) {
      currentPrize = prizes.sort((a, b) => a.level - b.level)[0];
    }

    // 🎯 使用獎項的分組（group 現在是必填）
    const effectiveGroup = currentPrize?.group || selectedGroup;

    // 🎲 執行真實抽獎（抽取多人，考慮分組篩選）
    const lotteryResult = drawMultipleWinners(drawCount, {
      skipWinners: skipWinners,
      selectedGroup: effectiveGroup,
    });

    if (
      lotteryResult.error ||
      !lotteryResult.winners ||
      lotteryResult.winners.length === 0
    ) {
      // 抽獎失敗
      alert(lotteryResult.error || "抽獎失敗，請確認是否有可用的參與者名單");
      return null;
    }

    // 獎項名稱
    const prizeName = currentPrize?.name || "參加獎";
    const ballColor =
      GACHA_COLORS[Math.floor(Math.random() * GACHA_COLORS.length)];

    // 儲存所有中獎者資訊
    const winners: WinnerInfo[] = lotteryResult.winners.map((winner) => ({
      name: winner.name,
      prizeId: currentPrize?.id || "",
      prize: prizeName,
      participantId: winner.id,
      employeeId: winner.employeeId,
      department: winner.department,
      group: winner.group,
    }));

    return { winners, ballColor };
  }, [prizes, selectedPrizeId, selectedGroup, drawCount, skipWinners, drawMultipleWinners]);

  // 處理跳過動畫，直接顯示結果
  const handleDirectLottery = useCallback(() => {
    // 執行抽獎
    const result = executeLottery();
    if (!result) {
      setIsAnimating(false);
      return;
    }

    const { winners, ballColor } = result;
    setCurrentWinners(winners);
    currentWinnersRef.current = winners;

    // 記錄所有中獎者到資料庫
    winners.forEach((winner) => {
      addWinnerRecord({
        id: winner.participantId,
        name: winner.name,
        employeeId: winner.employeeId,
        department: winner.department,
        group: winner.group,
        prizeId: winner.prizeId,
        prize: winner.prize,
        color: ballColor,
        recordId: winner.recordId,
        timestamp: winner.timestamp,
        drawSessionId: winner.drawSessionId
      });
    });

    // 設定浮起球的顏色
    setFloatingBallColor(ballColor);

    // 直接顯示 WinnerModal
    setShowWinnerModal(true);
    syncWinnerModalState(true);
    setIsAnimating(false);
    syncAnimationState(false);
  }, [
    executeLottery,
    setCurrentWinners,
    addWinnerRecord,
    setFloatingBallColor,
    setShowWinnerModal,
    setIsAnimating,
    syncAnimationState,
  ]);

  useEffect(() => {
    if (!hasCalledOnLoad.current && onLoad) {
      hasCalledOnLoad.current = true;
      onLoad();
    }
  }, [onLoad]);

  useEffect(() => {
    // 🎯 只在動畫開始時執行一次，避免重複初始化
    if (isAnimating && !animationInitialized.current) {
      animationInitialized.current = true;

      // 🎯 確保清除可能還在運行的 interval (防止快速重啟時舊的繼續執行)
      if (winnerSequenceInterval.current) {
        clearInterval(winnerSequenceInterval.current);
        winnerSequenceInterval.current = null;
      }

      // 🎯 確保關閉上一次的中獎彈窗
      setShowWinnerModal(false);

      // 🎯 設定抽獎輪次 ID
      // 優先使用 pendingWinners 中的 sessionId，以確保前後台一致
      if (pendingWinnersRef.current && pendingWinnersRef.current.length > 0) {
        const firstWinner = pendingWinnersRef.current[0];
        if (firstWinner.drawSessionId) {
          setCurrentDrawSessionId(firstWinner.drawSessionId);
        } else {
          startNewDrawSession();
        }
      } else {
        startNewDrawSession();
      }

      // 🎯 開始新的抽獎輪次
      // ... (existing sessionId logic) ...

      // 🎯 重置公布結果狀態
      setIsAnnouncingResults(false);
      syncAnnouncingState(false);

      // 檢查是否應該跳過動畫 (直接讀取最新狀態，避免閉包/渲染過時問題)
      // 優先使用 pendingSkipAnimationRef，確保即時性
      const shouldSkip = pendingSkipAnimationRef.current || useLotteryDataStore.getState().skipAnimation;

      // 如果啟用「跳過動畫」，直接顯示結果
      if (shouldSkip) {
        // 延遲到下一個事件循環，避免級聯渲染
        setTimeout(() => {
          handleDirectLottery();
        }, 0);
      } else {
        // 正常流程：開始動畫
        shouldStartAnimation.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimating]); // Remove skipAnimation from dependency to avoid double trigger logic, rely on isAnimating trigger and getState()

  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();

    // 當動畫停止時重置所有狀態
    if (prevIsAnimating.current && !isAnimating) {
      shouldStartAnimation.current = false;
      coinAnimating.current = false;
      isFading.current = false;
      setCoinVisible(false);
      setCoinOpacity(1);
      setIsMachineShaking(false);
      coinDisappearTime.current = null;
      hasStartedWinnerSequence.current = false; // 🎯 重置逐筆新增標記
      animationInitialized.current = false; // 🎯 重置初始化標記
      // 🎯 清除可能還在運行的 interval
      if (winnerSequenceInterval.current) {
        clearInterval(winnerSequenceInterval.current);
        winnerSequenceInterval.current = null;
      }
    }
    prevIsAnimating.current = isAnimating;

    // 開始金幣動畫
    if (shouldStartAnimation.current && !coinAnimating.current) {
      // 🛡️ 防禦性檢查：如果這時發現應該跳過，則取消動畫並直接顯示結果
      // 這種情況可能發生在狀態更新有極微小延遲時
      if (pendingSkipAnimationRef.current || useLotteryDataStore.getState().skipAnimation) {
        shouldStartAnimation.current = false;
        // 確保在下一個循環處理結果，避免這裡直接調用可能導致的問題
        setTimeout(() => handleDirectLottery(), 0);
        return;
      }

      coinAnimating.current = true;
      isFading.current = false;
      setCoinVisible(true);
      setCoinOpacity(1);
      coinPositionRef.current.copy(COIN_CONFIG.START_POSITION);
      setCoinPosition(
        COIN_CONFIG.START_POSITION.toArray() as [number, number, number]
      );
      shouldStartAnimation.current = false;
    }

    // 金幣下落動畫
    if (coinAnimating.current && coinVisible && !isFading.current) {
      if (coinPositionRef.current.y > COIN_CONFIG.DISAPPEAR_Y) {
        coinPositionRef.current.lerp(
          COIN_CONFIG.TARGET_POSITION,
          delta * COIN_CONFIG.FALL_SPEED
        );
        setCoinPosition(
          coinPositionRef.current.toArray() as [number, number, number]
        );
      } else {
        isFading.current = true;
      }
    }

    // 金幣淡出動畫
    if (isFading.current && coinVisible) {
      const newOpacity = Math.max(
        0,
        coinOpacity - delta * COIN_CONFIG.FADE_OUT_SPEED
      );
      setCoinOpacity(newOpacity);

      if (newOpacity <= 0) {
        setCoinVisible(false);
        coinAnimating.current = false;
        isFading.current = false;
        if (coinDisappearTime.current === null) {
          coinDisappearTime.current = time;
        }
      }
    }

    // 金幣消失後延遲啟動扭蛋機晃動
    if (
      coinDisappearTime.current !== null &&
      !isMachineShaking &&
      time - coinDisappearTime.current >= COIN_CONFIG.DELAY_BEFORE_SHAKE
    ) {
      setIsMachineShaking(true);
    }

    // 浮起動畫
    if (selectedBallId !== null && floatingProgress.current < 1) {
      floatingProgress.current += delta * 0.8; // 控制浮起速度

      if (floatingProgress.current >= 1) {
        floatingProgress.current = 1;
        // 浮起完成，顯示白光
        if (!showFlash && !hasStartedWinnerSequence.current) {
          hasStartedWinnerSequence.current = true; // 🎯 標記已開始，防止重複執行

          // 🎯 先保存中獎者資料和顏色（在清除前）
          const winnersToAdd = [...currentWinnersRef.current];
          const ballColor = floatingBallColor;

          // 🎯 立即清除球和視覺元素（在白光前）
          setSelectedBallId(null);
          setFloatingBallColor("");
          floatingProgress.current = 0;

          // 顯示白光
          setShowFlash(true);

          // 🎯 立即結束動畫狀態，讓左右側面板出現
          setIsAnimating(false);
          syncAnimationState(false);

          setTimeout(() => {
            setShowFlash(false);

            // 🎯 逐筆新增中獎者到 WinnerRecordBoard（不彈出 Modal）
            if (winnersToAdd.length > 0) {
              // 🎯 開始公布結果，禁用開始抽獎按鈕
              setIsAnnouncingResults(true);
              syncAnnouncingState(true);

              // 立即新增第一位中獎者
              addWinnerRecord({
                id: winnersToAdd[0].participantId,
                name: winnersToAdd[0].name,
                employeeId: winnersToAdd[0].employeeId,
                department: winnersToAdd[0].department,
                group: winnersToAdd[0].group,
                prizeId: winnersToAdd[0].prizeId,
                prize: winnersToAdd[0].prize,
                color: ballColor,
                recordId: winnersToAdd[0].recordId,
                timestamp: winnersToAdd[0].timestamp,
                drawSessionId: winnersToAdd[0].drawSessionId
              });

              // 如果有多位中獎者，每 1000ms 新增一位
              if (winnersToAdd.length > 1) {
                let currentIndex = 1;
                winnerSequenceInterval.current = setInterval(() => {
                  if (currentIndex < winnersToAdd.length) {
                    addWinnerRecord({
                      id: winnersToAdd[currentIndex].participantId,
                      name: winnersToAdd[currentIndex].name,
                      employeeId: winnersToAdd[currentIndex].employeeId,
                      department: winnersToAdd[currentIndex].department,
                      group: winnersToAdd[currentIndex].group,
                      prizeId: winnersToAdd[currentIndex].prizeId,
                      prize: winnersToAdd[currentIndex].prize,
                      color: ballColor,
                      recordId: winnersToAdd[currentIndex].recordId,
                      timestamp: winnersToAdd[currentIndex].timestamp,
                      drawSessionId: winnersToAdd[currentIndex].drawSessionId
                    });
                    currentIndex++;
                  } else {
                    // 所有中獎者都已新增，清理剩餘狀態並彈出 Modal
                    if (winnerSequenceInterval.current) {
                      clearInterval(winnerSequenceInterval.current);
                      winnerSequenceInterval.current = null;
                    }
                    // 🎯 公布結果結束，啟用開始抽獎按鈕
                    setIsAnnouncingResults(false);
                    syncAnnouncingState(false);
                    // 🎯 彈出 Modal 顯示所有中獎者
                    setShowWinnerModal(true);
                    syncWinnerModalState(true);
                  }
                }, 1000);
              } else {
                // 只有一位中獎者，直接彈出 Modal
                // 🎯 公布結果結束，啟用開始抽獎按鈕
                setIsAnnouncingResults(false);
                syncAnnouncingState(false);
                // 🎯 彈出 Modal 顯示所有中獎者
                setShowWinnerModal(true);
                syncWinnerModalState(true);
              }
            } else {
              // 沒有中獎者的情況
              setCurrentWinners([]);
            }
          }, 500);
        }
      }

      // 更新浮起位置（從起始位置向上移動）
      const t = Math.min(floatingProgress.current, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
      const [startX, startY, startZ] = floatingStartPosition.current;
      setFloatingBallPosition([
        startX - eased * 1.25,
        startY + eased * 5,
        startZ + eased * 6,
      ]);
    }

    // 白光淡入淡出動畫
    if (showFlash) {
      const newOpacity = Math.min(0.8, flashOpacity + delta * 4); // 快速淡入
      setFlashOpacity(newOpacity);
    } else if (flashOpacity > 0) {
      const newOpacity = Math.max(0, flashOpacity - delta * 4); // 快速淡出
      setFlashOpacity(newOpacity);
    }
  });

  // 處理關閉彈窗
  const handleCloseModal = () => {
    setShowWinnerModal(false);
    syncWinnerModalState(false);
    setSelectedBallId(null);
    setFloatingBallColor("");
    setFlashOpacity(0);
    floatingProgress.current = 0;
    setCurrentWinners([]);
    currentWinnersRef.current = [];
    hasStartedWinnerSequence.current = false; // 🎯 重置標記
    // 🎯 確保清除 interval
    if (winnerSequenceInterval.current) {
      clearInterval(winnerSequenceInterval.current);
      winnerSequenceInterval.current = null;
    }
  };

  // 處理扭蛋機晃動結束
  const handleShakeEnd = () => {
    setIsMachineShaking(false);
    coinDisappearTime.current = null;
    coinAnimating.current = false;
    isFading.current = false;
    setCoinOpacity(1);
    // 注意：不在這裡設定 setIsAnimating(false)，而是在顯示彈窗時才設定

    // 執行抽獎
    const result = executeLottery();
    if (!result) {
      return;
    }

    const { winners, ballColor } = result;
    setCurrentWinners(winners);
    currentWinnersRef.current = winners;

    // 在軌道入口處（z 軸負方向，高處）生成一顆球
    const ballId = ballIdCounter.current++;
    const ballRef = createRef<RapierRigidBody>();
    const newBall: {
      id: number;
      position: [number, number, number];
      color: string;
      ref: React.RefObject<RapierRigidBody | null>;
    } = {
      id: ballId,
      position: [1.5, -3, 0] as [number, number, number], // 略高於軌道，讓它自然落下
      color: ballColor,
      ref: ballRef,
    };
    setSlidingBalls((prev) => [...prev, newBall]);

    // 2秒後觸發浮起動畫
    setTimeout(() => {
      // 從 ref 讀取球的實際位置
      const actualPosition = ballRef.current?.translation();
      const startPosition: [number, number, number] = actualPosition
        ? [actualPosition.x, actualPosition.y, actualPosition.z]
        : [1.5, -4.5, 2]; // 備用位置

      // 儲存起始位置到 ref
      floatingStartPosition.current = startPosition;

      setSelectedBallId(ballId);
      setFloatingBallColor(ballColor);
      setFloatingBallPosition(startPosition); // 使用實際位置
      floatingProgress.current = 0;
      // 從滑動球列表中移除
      setSlidingBalls((prev) => prev.filter((b) => b.id !== ballId));
    }, 2000);
  };

  return (
    <>
      <GachaMachine
        onLoad={onLoad}
        isShaking={isMachineShaking}
        onShakeEnd={handleShakeEnd}
        shakeConfig={{
          duration: SHAKE_CONFIG.DURATION,
          rotationZAmplitude: SHAKE_CONFIG.ROTATION_Z_AMPLITUDE,
          rotationXAmplitude: SHAKE_CONFIG.ROTATION_X_AMPLITUDE,
          positionYAmplitude: SHAKE_CONFIG.POSITION_Y_AMPLITUDE,
          easeDuration: SHAKE_CONFIG.EASE_DURATION,
          freqZ: SHAKE_CONFIG.FREQ_Z,
          freqX: SHAKE_CONFIG.FREQ_X,
          freqY: SHAKE_CONFIG.FREQ_Y,
        }}
      />

      <FloatingText />
      <Coin
        position={coinPosition}
        visible={coinVisible}
        opacity={coinOpacity}
      />

      {/* 渲染滑出的扭蛋球 */}
      {slidingBalls.map((ball) => (
        <GachaBall
          key={ball.id}
          ref={ball.ref}
          position={ball.position}
          color={ball.color}
          radius={GACHA_BALL_PHYSICS.radius}
        />
      ))}

      {/* 渲染浮起的扭蛋球（不使用物理，純動畫控制）*/}
      {selectedBallId !== null && (
        <mesh position={floatingBallPosition} castShadow>
          <sphereGeometry args={[GACHA_BALL_PHYSICS.radius, 32, 32]} />
          <meshStandardMaterial
            color={floatingBallColor}
            metalness={0.3}
            roughness={0.1}
            emissive={floatingBallColor}
            emissiveIntensity={0.3}
          />
        </mesh>
      )}

      {/* 金色光閃爍效果（3D 場景全屏金色平面）*/}
      {flashOpacity > 0 && (
        <mesh position={[0, 3, 10]} renderOrder={999}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial
            color="#000000"
            emissive="#000000"
            emissiveIntensity={flashOpacity * 5}
            transparent
            opacity={flashOpacity}
            depthTest={false}
          />
        </mesh>
      )}

      {/* 中獎人彈窗（使用HTML覆蓋層）*/}
      {showWinnerModal && currentWinners.length > 0 && (
        <Html fullscreen>
          <WinnerModal
            isOpen={showWinnerModal}
            onClose={handleCloseModal}
            winners={currentWinners}
          />
        </Html>
      )}
    </>
  );
}

// 預載扭蛋機模型
preloadGachaMachine();

// ==================== 場景組件 ====================
export default function Scene({
  onReadyAction,
}: {
  onReadyAction?: () => void;
}) {
  // Get selection state from store
  const { selectedPrizeId, selectedGroup, drawMode } =
    useLotterySelectionStore();

  // Get background config from store
  const {
    config: backgroundConfig,
    imageRefreshKey,
    selectedBackground,
  } = useBackgroundStore();

  // Get prizes and winner records to calculate drawCount
  const prizes = useLotteryDataStore((state) => state.prizes);
  const winnerRecords = useLotteryDataStore((state) => state.winnerRecords);

  // Calculate draw count based on selected prize and mode
  const drawCount = useMemo(() => {
    if (!selectedPrizeId) return 1;

    const prize = prizes.find((p) => p.id === selectedPrizeId);
    if (!prize) return 1;

    const winnersForThisPrize = winnerRecords.filter(
      (record) => record.prize === prize.name
    ).length;
    const remaining = Math.max(0, prize.quantity - winnersForThisPrize);

    return drawMode === "all" ? remaining : 1;
  }, [selectedPrizeId, drawMode, prizes, winnerRecords]);
  // Get loading state for opacity control
  const loading = useLotteryUIStore((state) => state.loading);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        opacity: loading ? 0 : 1,
        pointerEvents: loading ? "none" : "auto",
        transition: "opacity 1s ease",
        zIndex: 1,
      }}
    >
      <Canvas
        camera={{ fov: 65, near: 0.01, far: 1000, position: [0, 3, 20] }}
        gl={{ toneMappingExposure: 1.2 }}
      >
        {/* 背景平面 - 固定在 3D 場景中 */}
        <BackgroundPlane
          config={backgroundConfig}
          imageRefreshKey={imageRefreshKey}
          selectedBackground={selectedBackground}
        />

        <CameraAnimation />
        <Environment preset="sunset" environmentIntensity={1.5} />
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 5, 3]}
          intensity={0.8}
          color="#ffffff"
        />
        <pointLight position={[-3, 2, -2]} intensity={0.5} color="#ffd6a5" />
        <Physics gravity={[0, -9.81, 0]}>
          <GachaScene
            onLoad={onReadyAction}
            selectedPrizeId={selectedPrizeId}
            drawCount={drawCount}
            selectedGroup={selectedGroup}
          />
        </Physics>
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.4}
          minDistance={3}
          maxDistance={20}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}

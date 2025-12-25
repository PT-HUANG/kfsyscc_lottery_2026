"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";
import { Physics, RapierRigidBody } from "@react-three/rapier";
import { useRef, useEffect, useState, createRef } from "react";
import FloatingText from "@/components/FloatingText";
import CameraAnimation from "@/components/CameraAnimation";
import Coin from "@/components/Coin";
import GachaMachine, { preloadGachaMachine } from "@/components/GachaMachine";
import GachaBall from "@/components/GachaBall";
import WinnerModal from "@/components/WinnerModal";
import { useAnimationStore } from "@/stores/useAnimationStore";
import {
  COIN_CONFIG,
  SHAKE_CONFIG,
  GACHA_COLORS,
  GACHA_BALL_PHYSICS,
} from "@/config/gachaConfig";

// ==================== 類型定義 ====================
interface GachaSceneProps {
  onLoad?: () => void;
}

// ==================== 扭蛋場景組件 ====================
function GachaScene({ onLoad }: GachaSceneProps) {
  const hasCalledOnLoad = useRef(false);

  const isAnimating = useAnimationStore((state) => state.isAnimating);
  const setIsAnimating = useAnimationStore((state) => state.setIsAnimating);
  const addWinnerRecord = useAnimationStore((state) => state.addWinnerRecord);

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
      ref: React.RefObject<RapierRigidBody>;
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
  const [showModal, setShowModal] = useState(false);
  const floatingProgress = useRef(0);

  const shouldStartAnimation = useRef(false);
  const prevIsAnimating = useRef(isAnimating);

  useEffect(() => {
    if (!hasCalledOnLoad.current && onLoad) {
      hasCalledOnLoad.current = true;
      onLoad();
    }
  }, [onLoad]);

  useEffect(() => {
    if (isAnimating) {
      shouldStartAnimation.current = true;
    }
  }, [isAnimating]);

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
    }
    prevIsAnimating.current = isAnimating;

    // 開始金幣動畫
    if (shouldStartAnimation.current && !coinAnimating.current) {
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
        if (!showFlash) {
          setShowFlash(true);
          setTimeout(() => {
            setShowFlash(false);
            setShowModal(true);
            // 記錄中獎信息
            if (selectedBallId !== null) {
              addWinnerRecord({
                id: `#${String(selectedBallId).padStart(6, "0")}`,
                name: "張小明",
                prize: "頭獎 - iPhone 15 Pro",
                color: floatingBallColor,
              });
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
        startY + eased * 3.5, // 向上浮起 6 個單位
        startZ + eased * 7,
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
    setShowModal(false);
    setSelectedBallId(null);
    setFloatingBallColor("");
    setFlashOpacity(0);
    floatingProgress.current = 0;
  };

  // 處理扭蛋機晃動結束
  const handleShakeEnd = () => {
    setIsMachineShaking(false);
    coinDisappearTime.current = null;
    coinAnimating.current = false;
    isFading.current = false;
    setCoinOpacity(1);
    setIsAnimating(false);

    // 在軌道入口處（z 軸負方向，高處）生成一顆球
    const ballId = ballIdCounter.current++;
    const ballColor =
      GACHA_COLORS[Math.floor(Math.random() * GACHA_COLORS.length)];
    const ballRef = createRef<RapierRigidBody>();
    const newBall = {
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
      {showModal && (
        <Html fullscreen>
          <WinnerModal
            isOpen={showModal}
            onClose={handleCloseModal}
            winnerInfo={{
              name: "張小明",
              prize: "頭獎 - iPhone 15 Pro",
              id: `#${String(selectedBallId).padStart(6, "0")}`,
            }}
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
      }}
    >
      <Canvas
        camera={{ fov: 65, near: 0.01, far: 1000, position: [0, 3, 20] }}
        gl={{ toneMappingExposure: 1.2 }}
      >
        <color attach="background" args={["#e8f4f8"]} />
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
          <GachaScene onLoad={onReadyAction} />
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

"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { useRef, useEffect, useState } from "react";
import FloatingText from "@/components/FloatingText";
import CameraAnimation from "@/components/CameraAnimation";
import Coin from "@/components/Coin";
import GachaMachine, { preloadGachaMachine } from "@/components/GachaMachine";
import { useAnimationStore } from "@/stores/useAnimationStore";
import { COIN_CONFIG, SHAKE_CONFIG } from "@/config/gachaConfig";

// ==================== 類型定義 ====================
interface GachaSceneProps {
  onLoad?: () => void;
}

// ==================== 扭蛋場景組件 ====================
function GachaScene({ onLoad }: GachaSceneProps) {
  const hasCalledOnLoad = useRef(false);

  const isAnimating = useAnimationStore((state) => state.isAnimating);
  const setIsAnimating = useAnimationStore((state) => state.setIsAnimating);

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
  });

  // 處理扭蛋機晃動結束
  const handleShakeEnd = () => {
    setIsMachineShaking(false);
    coinDisappearTime.current = null;
    coinAnimating.current = false;
    isFading.current = false;
    setCoinOpacity(1);
    setIsAnimating(false);
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
        <Physics gravity={[0, -9.81, 0]} debug>
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

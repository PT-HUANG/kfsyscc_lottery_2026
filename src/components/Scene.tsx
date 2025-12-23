"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Center, Environment } from "@react-three/drei";
import { useRef, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import type { Group } from "three";
import FloatingText from "@/components/FloatingText";
import CameraAnimation from "@/components/CameraAnimation";
import Coin from "@/components/Coin";
import { useAnimationStore } from "@/stores/useAnimationStore";

// ==================== 工具函数 ====================
// 缓动函数：二次方缓入缓出，让过渡更柔和自然
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ==================== 常量定义 ====================
const COIN_CONFIG = {
  START_POSITION: new THREE.Vector3(6.0625, 4, -4.25),
  TARGET_POSITION: new THREE.Vector3(6.0625, -0.15, -4.25),
  DISAPPEAR_Y: 2.5,
  FALL_SPEED: 0.5,
  FADE_OUT_SPEED: 4.0, // 淡出速度
  DELAY_BEFORE_SHAKE: 0.2, // 金币消失后延迟（秒）
} as const;

const SHAKE_CONFIG = {
  DURATION: 5, // 晃动持续时间（秒）
  ROTATION_Z_AMPLITUDE: 0.045, // 再增加100%
  ROTATION_X_AMPLITUDE: 0.03, // 再增加100%
  POSITION_Y_AMPLITUDE: 0.06, // 再增加100%
  EASE_DURATION: 0.5, // 渐入渐出的持续时间（秒）- 增加让过渡更平滑
  // 协调的晃动频率
  FREQ_Z: 6, // Z轴旋转频率
  FREQ_X: 3, // X轴旋转频率
  FREQ_Y: 4, // Y轴位移频率
} as const;

const CAPSULE_CONFIG = {
  BOUNCE_HEIGHT: 0.036, // 再增加100%
  GROUP_THRESHOLD: 0.01,
  POSITION_OFFSET: { x: -0.5, y: 0.005 },
  DELAY_START: 0.1, // 扭蛋延迟开始的时间（秒）
  DELAY_END: 0.1, // 扭蛋提前结束的时间（秒）
} as const;

// ==================== 类型定义 ====================
interface CapsuleGroup {
  meshData: { mesh: THREE.Mesh; originalPos: THREE.Vector3 }[];
  centerPos: THREE.Vector3;
  groupIndex: number;
}

interface GachaModelProps {
  onLoad?: () => void;
}

// ==================== 主组件 ====================
function GachaModel({ onLoad }: GachaModelProps) {
  const { scene } = useGLTF("/models/gacha.gltf");
  const groupRef = useRef<Group>(null);
  const hasCalledOnLoad = useRef(false);

  // 使用 Zustand store
  const isAnimating = useAnimationStore((state) => state.isAnimating);
  const setIsAnimating = useAnimationStore((state) => state.setIsAnimating);

  // 金币动画状态
  const [coinVisible, setCoinVisible] = useState(false);
  const [coinPosition, setCoinPosition] = useState<[number, number, number]>([
    COIN_CONFIG.START_POSITION.x,
    COIN_CONFIG.START_POSITION.y,
    COIN_CONFIG.START_POSITION.z,
  ]);
  const [coinOpacity, setCoinOpacity] = useState(1);
  const coinPositionRef = useRef(COIN_CONFIG.START_POSITION.clone());
  const coinAnimating = useRef(false);
  const isFading = useRef(false);

  // 扭蛋机晃动状态
  const shakeStartTime = useRef<number | null>(null);
  const coinDisappearTime = useRef<number | null>(null);
  const isShaking = useRef(false);

  // 初始化标志，用于触发动画
  const shouldStartAnimation = useRef(false);
  const prevIsAnimating = useRef(isAnimating);

  // 儲存扭蛋物件及其原始位置，並基於位置分組
  const capsuleGroups = useMemo(() => {
    const allCapsules: { mesh: THREE.Mesh; originalPos: THREE.Vector3 }[] = [];

    scene.traverse((child) => {
      if (
        child.name &&
        (child.name.includes("white_wall-material") ||
          child.name.includes("Gacha_machine_glass-material"))
      ) {
        const mesh = child as THREE.Mesh;
        const originalPos = mesh.position.clone();
        originalPos.x += CAPSULE_CONFIG.POSITION_OFFSET.x;
        originalPos.y += CAPSULE_CONFIG.POSITION_OFFSET.y;
        allCapsules.push({ mesh, originalPos });
      }
    });

    // 基於位置分組
    const groups: CapsuleGroup[] = [];

    allCapsules.forEach((capsule) => {
      const foundGroup = groups.find(
        (group) =>
          group.centerPos.distanceTo(capsule.originalPos) <
          CAPSULE_CONFIG.GROUP_THRESHOLD
      );

      if (foundGroup) {
        foundGroup.meshData.push(capsule);
      } else {
        groups.push({
          meshData: [capsule],
          centerPos: capsule.originalPos.clone(),
          groupIndex: groups.length,
        });
      }
    });

    return groups;
  }, [scene]);

  // 加载完成回调
  useEffect(() => {
    if (!hasCalledOnLoad.current && onLoad) {
      hasCalledOnLoad.current = true;
      onLoad();
    }
  }, [onLoad]);

  // 监听播放按钮状态 - 只设置标志，不调用 setState
  useEffect(() => {
    if (isAnimating) {
      shouldStartAnimation.current = true;
    }
  }, [isAnimating]);

  // 动画循环
  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();

    // 检测 isAnimating 从 true 变为 false，重置所有状态
    if (prevIsAnimating.current && !isAnimating) {
      shouldStartAnimation.current = false;
      coinAnimating.current = false;
      isFading.current = false;
      setCoinVisible(false);
      setCoinOpacity(1);
      isShaking.current = false;
      shakeStartTime.current = null;
      coinDisappearTime.current = null;
    }
    prevIsAnimating.current = isAnimating;

    // 启动动画
    if (shouldStartAnimation.current && !coinAnimating.current) {
      coinAnimating.current = true;
      isFading.current = false;
      setCoinVisible(true);
      setCoinOpacity(1);
      coinPositionRef.current.copy(COIN_CONFIG.START_POSITION);
      setCoinPosition([
        COIN_CONFIG.START_POSITION.x,
        COIN_CONFIG.START_POSITION.y,
        COIN_CONFIG.START_POSITION.z,
      ]);
      shouldStartAnimation.current = false;
    }

    // 金币下落动画
    if (coinAnimating.current && coinVisible && !isFading.current) {
      if (coinPositionRef.current.y > COIN_CONFIG.DISAPPEAR_Y) {
        coinPositionRef.current.lerp(
          COIN_CONFIG.TARGET_POSITION,
          delta * COIN_CONFIG.FALL_SPEED
        );
        setCoinPosition([
          coinPositionRef.current.x,
          coinPositionRef.current.y,
          coinPositionRef.current.z,
        ]);
      } else {
        // 开始淡出动画
        isFading.current = true;
      }
    }

    // 金币淡出动画
    if (isFading.current && coinVisible) {
      const newOpacity = Math.max(
        0,
        coinOpacity - delta * COIN_CONFIG.FADE_OUT_SPEED
      );
      setCoinOpacity(newOpacity);

      if (newOpacity <= 0) {
        // 淡出完成，隐藏金币
        setCoinVisible(false);
        coinAnimating.current = false;
        isFading.current = false;
        if (coinDisappearTime.current === null) {
          coinDisappearTime.current = time;
        }
      }
    }

    // 延迟后开始晃动
    if (
      coinDisappearTime.current !== null &&
      !isShaking.current &&
      time - coinDisappearTime.current >= COIN_CONFIG.DELAY_BEFORE_SHAKE
    ) {
      isShaking.current = true;
      shakeStartTime.current = time;
    }

    // 扭蛋机晃动
    if (isShaking.current && shakeStartTime.current !== null) {
      const shakeDuration = time - shakeStartTime.current;

      if (shakeDuration < SHAKE_CONFIG.DURATION) {
        // 计算平滑因子（渐入渐出）
        let smoothFactor = 1;
        if (shakeDuration < SHAKE_CONFIG.EASE_DURATION) {
          // 渐入：从 0 到 1
          smoothFactor = shakeDuration / SHAKE_CONFIG.EASE_DURATION;
        } else if (
          shakeDuration >
          SHAKE_CONFIG.DURATION - SHAKE_CONFIG.EASE_DURATION
        ) {
          // 渐出：从 1 到 0
          const timeLeft = SHAKE_CONFIG.DURATION - shakeDuration;
          smoothFactor = timeLeft / SHAKE_CONFIG.EASE_DURATION;
        }

        // 应用缓动函数使过渡更平滑
        smoothFactor = easeInOutQuad(smoothFactor);

        // 晃动中，应用平滑因子
        if (groupRef.current) {
          groupRef.current.rotation.z =
            Math.sin(time * SHAKE_CONFIG.FREQ_Z) *
            SHAKE_CONFIG.ROTATION_Z_AMPLITUDE *
            smoothFactor;
          groupRef.current.rotation.x =
            Math.sin(time * SHAKE_CONFIG.FREQ_X) *
            SHAKE_CONFIG.ROTATION_X_AMPLITUDE *
            smoothFactor;
          groupRef.current.position.y =
            Math.sin(time * SHAKE_CONFIG.FREQ_Y) *
            SHAKE_CONFIG.POSITION_Y_AMPLITUDE *
            smoothFactor;
        }

        // 扭蛋弹跳（不应用平滑因子）- 延迟开始和提前结束
        if (
          shakeDuration >= CAPSULE_CONFIG.DELAY_START &&
          shakeDuration <= SHAKE_CONFIG.DURATION - CAPSULE_CONFIG.DELAY_END
        ) {
          capsuleGroups.forEach((group) => {
            const { meshData, groupIndex } = group;
            const bounceFrequency = 1.5 + (groupIndex % 5) * 0.4;
            const phase = (groupIndex / capsuleGroups.length) * Math.PI * 2;
            const t = (time * bounceFrequency + phase) % 1;
            const bounce = t < 0.5 ? t * 2 : 2 - t * 2;
            const verticalOffset = (bounce - 0.5) * CAPSULE_CONFIG.BOUNCE_HEIGHT;
            const rotationSpeed = 1.0 + (groupIndex % 3) * 0.2;
            const angle = time * rotationSpeed + phase;

            meshData.forEach(({ mesh, originalPos }) => {
              mesh.position.y = originalPos.y + verticalOffset;
              mesh.rotation.y = angle;
              mesh.rotation.x = Math.sin(time * 4 + phase) * 0.05;
            });
          });
        }
      } else {
        // 停止晃动并重置扭蛋机状态（但保持扭蛋的最终位置）
        if (groupRef.current) {
          groupRef.current.rotation.z = 0;
          groupRef.current.rotation.x = 0;
          groupRef.current.position.y = 0;
        }

        // 重置动画状态
        isShaking.current = false;
        shakeStartTime.current = null;
        coinDisappearTime.current = null;
        coinAnimating.current = false;
        isFading.current = false;
        setCoinOpacity(1);
        setIsAnimating(false); // 停止动画，更新按钮状态
      }
    }
  });

  return (
    <Center>
      <primitive ref={groupRef} object={scene} scale={12} />
      <FloatingText />
      <Coin
        position={coinPosition}
        visible={coinVisible}
        opacity={coinOpacity}
      />
    </Center>
  );
}

// 预加载GLTF模型
useGLTF.preload("/models/gacha.gltf");

// ==================== 场景组件 ====================
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
        camera={{ fov: 65, near: 0.01, far: 1000, position: [0, 2, 25] }}
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
        <GachaModel onLoad={onReadyAction} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.4}
          minDistance={3}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}

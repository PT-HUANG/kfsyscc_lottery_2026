"use client";

import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { PhysicsBounds, GachaTrack } from "@/components/PhysicsContainer";
import GachaBall from "@/components/GachaBall";
import { GACHA_MACHINE_CONFIG, GACHA_BALL_PHYSICS } from "@/config/gachaConfig";

/**
 * 工具函數：緩動函數
 */
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * 扭蛋球位置資訊
 */
interface PhysicsCapsule {
  position: THREE.Vector3;
  mesh: THREE.Mesh;
}

/**
 * 扭蛋機屬性
 */
export interface GachaMachineProps {
  /**
   * 模型載入完成的回調
   */
  onLoad?: () => void;
  /**
   * 模型文件路徑，默認為 "/models/gacha.gltf"
   */
  modelPath?: string;
  /**
   * 扭蛋機的縮放比例，默認為 12
   */
  modelScale?: number;
  /**
   * 扭蛋機的位置 [x, y, z]，默認為 [-6.6, -5.4, 6]
   */
  modelPosition?: [number, number, number];
  /**
   * 物理邊界相對於模型的位置，默認為 [0.6, 0.45, -0.5]
   */
  boundsPosition?: [number, number, number];
  /**
   * 物理邊界的大小，默認為 [0.3, 0.3, 0.3]
   */
  boundsSize?: [number, number, number];
  /**
   * 是否正在執行晃動動畫
   */
  isShaking?: boolean;
  /**
   * 晃動動畫的配置
   */
  shakeConfig?: {
    duration?: number;
    rotationZAmplitude?: number;
    rotationXAmplitude?: number;
    positionYAmplitude?: number;
    easeDuration?: number;
    freqZ?: number;
    freqX?: number;
    freqY?: number;
  };
  /**
   * 是否顯示扭蛋球，默認為 true
   */
  showBalls?: boolean;
  /**
   * 扭蛋球的數量（會自動生成對應數量的扭蛋球）
   */
  ballCount?: number;
  /**
   * 自定義扭蛋球顏色（可選）
   */
  ballColors?: string[];
  /**
   * 晃動動畫開始時間（由外部控制）
   */
  shakeStartTime?: number | null;
  /**
   * 晃動動畫結束的回調
   */
  onShakeEnd?: () => void;
}

/**
 * 扭蛋機元件
 *
 * 可重用的 3D 扭蛋機元件，包含物理效果和動畫
 *
 * @example
 * ```tsx
 * // 基本使用
 * <GachaMachine onLoad={() => console.log('Loaded!')} />
 *
 * // 自定義配置
 * <GachaMachine
 *   modelScale={15}
 *   modelPosition={[0, 0, 0]}
 *   showBalls={true}
 *   ballCount={10}
 * />
 *
 * // 控制晃動動畫
 * const [isShaking, setIsShaking] = useState(false);
 * <GachaMachine
 *   isShaking={isShaking}
 *   onShakeEnd={() => setIsShaking(false)}
 * />
 * ```
 */
export default function GachaMachine({
  onLoad,
  modelPath = "/models/gacha.gltf",
  modelScale = GACHA_MACHINE_CONFIG.modelScale,
  modelPosition = GACHA_MACHINE_CONFIG.modelPosition,
  boundsPosition = GACHA_MACHINE_CONFIG.boundsPosition,
  boundsSize = GACHA_MACHINE_CONFIG.boundsSize,
  isShaking = false,
  shakeConfig = {},
  showBalls = true,
  ballCount = 20,
  ballColors,
  shakeStartTime: externalShakeStartTime,
  onShakeEnd,
}: GachaMachineProps) {
  const { scene } = useGLTF(modelPath);
  const gachaMachineRef = useRef<RapierRigidBody>(null);
  const hasCalledOnLoad = useRef(false);

  const internalShakeStartTime = useRef<number | null>(null);
  const isShakingInternal = useRef(false);

  // 合併晃動配置
  const finalShakeConfig = {
    duration: shakeConfig.duration ?? 5,
    rotationZAmplitude: shakeConfig.rotationZAmplitude ?? 0.045,
    rotationXAmplitude: shakeConfig.rotationXAmplitude ?? 0.03,
    positionYAmplitude: shakeConfig.positionYAmplitude ?? 0.06,
    easeDuration: shakeConfig.easeDuration ?? 0.5,
    freqZ: shakeConfig.freqZ ?? 6,
    freqX: shakeConfig.freqX ?? 3,
    freqY: shakeConfig.freqY ?? 4,
  };

  // 使用 ref 來存儲扭蛋球，避免不必要的 re-render
  const physicsCapsulesRef = useRef<PhysicsCapsule[]>([]);
  const capsulesInitialized = useRef(false);

  // 只在首次加載 scene 時初始化扭蛋球位置
  /* eslint-disable react-hooks/purity */
  if (!capsulesInitialized.current && scene && showBalls) {
    const capsules: PhysicsCapsule[] = [];
    const modelPos = new THREE.Vector3(...modelPosition);

    const boundsW = boundsSize[0] * modelScale;
    const boundsH = boundsSize[1] * modelScale;
    const boundsD = boundsSize[2] * modelScale;
    const [boundsX, boundsY, boundsZ] = boundsPosition.map(
      (p) => p * modelScale
    );

    const ballRadius = GACHA_BALL_PHYSICS.radius;
    const minDistance = GACHA_BALL_PHYSICS.minDistance;
    const margin = GACHA_BALL_PHYSICS.margin;

    const halfW = boundsW / 2 - margin;
    const halfH = boundsH / 2 - margin;
    const halfD = boundsD / 2 - margin;

    const generateNonOverlappingPosition = (): THREE.Vector3 => {
      let attempts = 0;
      const maxAttempts = 100;

      while (attempts < maxAttempts) {
        const newPos = new THREE.Vector3(
          boundsX + (Math.random() - 0.5) * 2 * halfW,
          boundsY + Math.random() * halfH,
          boundsZ + (Math.random() - 0.5) * 2 * halfD
        );

        // 將模型的世界位置加到球的相對位置上，得到球的世界位置
        newPos.add(modelPos);

        let isOverlapping = false;
        for (const capsule of capsules) {
          if (capsule.position.distanceTo(newPos) < minDistance) {
            isOverlapping = true;
            break;
          }
        }

        if (!isOverlapping) {
          return newPos;
        }
        attempts++;
      }
      // Fallback
      const fallbackPos = new THREE.Vector3(
        boundsX + (Math.random() - 0.5) * 2 * halfW,
        boundsY + Math.random() * halfH,
        boundsZ + (Math.random() - 0.5) * 2 * halfD
      );
      return fallbackPos.add(modelPos);
    };

    // 找到模型中的扭蛋球 mesh，但只取 ballCount 數量
    let meshCount = 0;
    scene.traverse((child) => {
      if (
        child.name &&
        (child.name.includes("white_wall-material") ||
          child.name.includes("Gacha_machine_glass-material"))
      ) {
        const mesh = child as THREE.Mesh;
        mesh.visible = false; // 先隱藏所有模型中的扭蛋球

        // 只添加前 ballCount 數量到物理球陣列
        if (meshCount < ballCount) {
          const randomPos = generateNonOverlappingPosition();
          capsules.push({ position: randomPos, mesh });
          meshCount++;
        }
      }
    });

    // 如果模型中沒有找到足夠的 mesh，根據 ballCount 補充
    if (meshCount < ballCount) {
      for (let i = meshCount; i < ballCount; i++) {
        const randomPos = generateNonOverlappingPosition();
        // 創建一個虛擬的 mesh（不會被渲染）
        const dummyMesh = new THREE.Mesh();
        capsules.push({ position: randomPos, mesh: dummyMesh });
      }
    }

    physicsCapsulesRef.current = capsules;
    capsulesInitialized.current = true;
  }
  /* eslint-enable react-hooks/purity */

  useEffect(() => {
    if (!hasCalledOnLoad.current && onLoad) {
      hasCalledOnLoad.current = true;
      onLoad();
    }
  }, [onLoad]);

  // 監聽 isShaking 變化
  useEffect(() => {
    if (isShaking && !isShakingInternal.current) {
      isShakingInternal.current = true;
    } else if (!isShaking && isShakingInternal.current) {
      isShakingInternal.current = false;
      internalShakeStartTime.current = null;
    }
  }, [isShaking]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (gachaMachineRef.current) {
      const modelBasePosition = new THREE.Vector3(...modelPosition);

      // 使用外部提供的 shakeStartTime 或內部的
      const currentShakeStartTime =
        externalShakeStartTime !== undefined
          ? externalShakeStartTime
          : internalShakeStartTime.current;

      // 開始晃動
      if (isShakingInternal.current && currentShakeStartTime === null) {
        internalShakeStartTime.current = time;
      }

      if (isShakingInternal.current && currentShakeStartTime !== null) {
        const shakeDuration = time - currentShakeStartTime;

        if (shakeDuration < finalShakeConfig.duration) {
          let smoothFactor = 1;
          if (shakeDuration < finalShakeConfig.easeDuration) {
            smoothFactor = shakeDuration / finalShakeConfig.easeDuration;
          } else if (
            shakeDuration >
            finalShakeConfig.duration - finalShakeConfig.easeDuration
          ) {
            const timeLeft = finalShakeConfig.duration - shakeDuration;
            smoothFactor = timeLeft / finalShakeConfig.easeDuration;
          }
          smoothFactor = easeInOutQuad(smoothFactor);

          const yPos =
            Math.sin(time * finalShakeConfig.freqY) *
            finalShakeConfig.positionYAmplitude *
            smoothFactor;
          const rotationX =
            Math.sin(time * finalShakeConfig.freqX) *
            finalShakeConfig.rotationXAmplitude *
            smoothFactor;
          const rotationZ =
            Math.sin(time * finalShakeConfig.freqZ) *
            finalShakeConfig.rotationZAmplitude *
            smoothFactor;

          gachaMachineRef.current.setNextKinematicTranslation(
            modelBasePosition.clone().add(new THREE.Vector3(0, yPos, 0))
          );
          gachaMachineRef.current.setNextKinematicRotation(
            new THREE.Quaternion().setFromEuler(
              new THREE.Euler(rotationX, 0, rotationZ)
            )
          );
        } else {
          // 晃動結束，復位
          gachaMachineRef.current.setNextKinematicTranslation(
            modelBasePosition
          );
          gachaMachineRef.current.setNextKinematicRotation(
            new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0))
          );

          isShakingInternal.current = false;
          internalShakeStartTime.current = null;

          // 調用回調
          if (onShakeEnd) {
            onShakeEnd();
          }
        }
      } else {
        // 確保在非晃動狀態下，模型也回到正確的基礎位置
        gachaMachineRef.current.setNextKinematicTranslation(modelBasePosition);
      }
    }
  });

  return (
    <>
      <RigidBody
        ref={gachaMachineRef}
        type="kinematicPosition"
        colliders={false}
        position={modelPosition}
      >
        <primitive object={scene} scale={modelScale} position={[0.4, 0, 0]} />
        <group
          position={
            boundsPosition.map((p) => p * modelScale) as [
              number,
              number,
              number
            ]
          }
        >
          <PhysicsBounds
            size={
              boundsSize.map((s) => s * modelScale) as [number, number, number]
            }
          />
        </group>
      </RigidBody>

      {showBalls &&
        physicsCapsulesRef.current.map((capsule, index) => (
          <GachaBall
            key={index}
            position={capsule.position.toArray() as [number, number, number]}
            index={index}
            color={ballColors?.[index]}
          />
        ))}

      <GachaTrack />
    </>
  );
}

/**
 * 預載模型
 */
export function preloadGachaMachine(modelPath = "/models/gacha.gltf") {
  useGLTF.preload(modelPath);
}

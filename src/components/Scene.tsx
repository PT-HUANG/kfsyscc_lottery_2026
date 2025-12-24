"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import FloatingText from "@/components/FloatingText";
import CameraAnimation from "@/components/CameraAnimation";
import Coin from "@/components/Coin";
import { PhysicsBounds } from "@/components/PhysicsContainer";
import { useAnimationStore } from "@/stores/useAnimationStore";

// ==================== 工具函数 ====================
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ==================== 常量定义 ====================
const GACHA_MACHINE_CONFIG = {
  // 调整物理边界相对于模型的位置
  // 注意：这些值是基于模型本身的坐标系
  boundsPosition: [0.6, 0.45, -0.5] as [number, number, number],
  boundsSize: [0.28, 0.28, 0.25] as [number, number, number],
  modelScale: 12,
  // 手动调整模型位置以补偿几何中心的偏移，让它在视野中心
  // 如果模型在右上角，需要向左下移动（-x, -y）
  modelPosition: [-6.6, -5.4, 6] as [number, number, number],
};

const COIN_CONFIG = {
  START_POSITION: new THREE.Vector3(-0.125, -1, 1.75),
  TARGET_POSITION: new THREE.Vector3(-0.125, -3.5, 1.75),
  DISAPPEAR_Y: -2.75,
  FALL_SPEED: 1.5,
  FADE_OUT_SPEED: 4.0,
  DELAY_BEFORE_SHAKE: 0.2,
} as const;

const SHAKE_CONFIG = {
  DURATION: 5,
  ROTATION_Z_AMPLITUDE: 0.045,
  ROTATION_X_AMPLITUDE: 0.03,
  POSITION_Y_AMPLITUDE: 0.06,
  EASE_DURATION: 0.5,
  FREQ_Z: 6,
  FREQ_X: 3,
  FREQ_Y: 4,
} as const;

// ==================== 类型定义 ====================
interface GachaModelProps {
  onLoad?: () => void;
}

interface PhysicsCapsule {
  position: THREE.Vector3;
  mesh: THREE.Mesh;
}

interface PhysicsCapsulesProps {
  capsules: PhysicsCapsule[];
}

// ==================== 物理扭蛋组件 ====================
function PhysicsCapsules({ capsules }: PhysicsCapsulesProps) {
  return (
    <>
      {capsules.map((capsule, index) => (
        <RigidBody
          key={index}
          position={capsule.position.toArray() as [number, number, number]}
          restitution={0.5}
          friction={1.0}
          mass={0.2}
          colliders="ball"
          type="dynamic"
          gravityScale={1}
          linearDamping={0.2}
          angularDamping={0.2}
        >
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial
              color={
                (capsule.mesh.material as THREE.MeshStandardMaterial).color
              }
              metalness={0.2}
              roughness={0.4}
            />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}

// ==================== 主组件 ====================
function GachaModel({ onLoad }: GachaModelProps) {
  const { scene } = useGLTF("/models/gacha.gltf");
  const gachaMachineRef = useRef<RapierRigidBody>(null);
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

  const shakeStartTime = useRef<number | null>(null);
  const coinDisappearTime = useRef<number | null>(null);
  const isShaking = useRef(false);

  const shouldStartAnimation = useRef(false);
  const prevIsAnimating = useRef(isAnimating);

  // 使用 ref 来存储扭蛋球，避免不必要的 re-render
  const physicsCapsulesRef = useRef<PhysicsCapsule[]>([]);
  const capsulesInitialized = useRef(false);

  // 只在首次加载 scene 时初始化扭蛋球位置
  // 注意：这里使用 Math.random() 是安全的，因为有 capsulesInitialized ref 保证只执行一次
  /* eslint-disable react-hooks/purity */
  if (!capsulesInitialized.current && scene) {
    const capsules: PhysicsCapsule[] = [];
    const modelScale = GACHA_MACHINE_CONFIG.modelScale;
    const modelPos = new THREE.Vector3(...GACHA_MACHINE_CONFIG.modelPosition);

    const boundsW = GACHA_MACHINE_CONFIG.boundsSize[0] * modelScale;
    const boundsH = GACHA_MACHINE_CONFIG.boundsSize[1] * modelScale;
    const boundsD = GACHA_MACHINE_CONFIG.boundsSize[2] * modelScale;
    const [boundsX, boundsY, boundsZ] = GACHA_MACHINE_CONFIG.boundsPosition.map(
      (p) => p * modelScale
    );

    const ballRadius = 0.25;
    const minDistance = ballRadius * 2.5;
    const margin = ballRadius * 1.2;

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

        // 将模型的世界位置加到球的相对位置上，得到球的世界位置
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

    scene.traverse((child) => {
      if (
        child.name &&
        (child.name.includes("white_wall-material") ||
          child.name.includes("Gacha_machine_glass-material"))
      ) {
        const mesh = child as THREE.Mesh;
        const randomPos = generateNonOverlappingPosition();
        capsules.push({ position: randomPos, mesh });
        mesh.visible = false;
      }
    });

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

  useEffect(() => {
    if (isAnimating) {
      shouldStartAnimation.current = true;
    }
  }, [isAnimating]);

  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();

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

    if (
      coinDisappearTime.current !== null &&
      !isShaking.current &&
      time - coinDisappearTime.current >= COIN_CONFIG.DELAY_BEFORE_SHAKE
    ) {
      isShaking.current = true;
      shakeStartTime.current = time;
    }

    if (gachaMachineRef.current) {
      const modelBasePosition = new THREE.Vector3(
        ...GACHA_MACHINE_CONFIG.modelPosition
      );

      if (isShaking.current && shakeStartTime.current !== null) {
        const shakeDuration = time - shakeStartTime.current;

        if (shakeDuration < SHAKE_CONFIG.DURATION) {
          let smoothFactor = 1;
          if (shakeDuration < SHAKE_CONFIG.EASE_DURATION) {
            smoothFactor = shakeDuration / SHAKE_CONFIG.EASE_DURATION;
          } else if (
            shakeDuration >
            SHAKE_CONFIG.DURATION - SHAKE_CONFIG.EASE_DURATION
          ) {
            const timeLeft = SHAKE_CONFIG.DURATION - shakeDuration;
            smoothFactor = timeLeft / SHAKE_CONFIG.EASE_DURATION;
          }
          smoothFactor = easeInOutQuad(smoothFactor);

          const yPos =
            Math.sin(time * SHAKE_CONFIG.FREQ_Y) *
            SHAKE_CONFIG.POSITION_Y_AMPLITUDE *
            smoothFactor;
          const rotationX =
            Math.sin(time * SHAKE_CONFIG.FREQ_X) *
            SHAKE_CONFIG.ROTATION_X_AMPLITUDE *
            smoothFactor;
          const rotationZ =
            Math.sin(time * SHAKE_CONFIG.FREQ_Z) *
            SHAKE_CONFIG.ROTATION_Z_AMPLITUDE *
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
          gachaMachineRef.current.setNextKinematicTranslation(
            modelBasePosition
          );
          gachaMachineRef.current.setNextKinematicRotation(
            new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0))
          );

          isShaking.current = false;
          shakeStartTime.current = null;
          coinDisappearTime.current = null;
          coinAnimating.current = false;
          isFading.current = false;
          setCoinOpacity(1);
          setIsAnimating(false);
        }
      } else {
        // 确保在非晃动状态下，模型也回到正确的基础位置
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
        // RigidBody 的初始位置由 GACHA_MACHINE_CONFIG 控制
        position={GACHA_MACHINE_CONFIG.modelPosition}
      >
        <primitive
          object={scene}
          scale={GACHA_MACHINE_CONFIG.modelScale}
          // primitive 的位置是相对于 RigidBody 的，所以是 0,0,0
          position={[0.4, 0, 0]}
        />
        <group
          position={
            GACHA_MACHINE_CONFIG.boundsPosition.map(
              (p) => p * GACHA_MACHINE_CONFIG.modelScale
            ) as [number, number, number]
          }
        >
          <PhysicsBounds
            size={
              GACHA_MACHINE_CONFIG.boundsSize.map(
                (s) => s * GACHA_MACHINE_CONFIG.modelScale
              ) as [number, number, number]
            }
          />
        </group>
      </RigidBody>

      <PhysicsCapsules capsules={physicsCapsulesRef.current} />

      <FloatingText />
      <Coin
        position={coinPosition}
        visible={coinVisible}
        opacity={coinOpacity}
      />
    </>
  );
}

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
        // 调整相机位置以适应手动定位的模型
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
          <GachaModel onLoad={onReadyAction} />
        </Physics>
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.4}
          minDistance={3}
          maxDistance={20}
          // 调整 OrbitControls 的目标点，让它聚焦于模型
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}

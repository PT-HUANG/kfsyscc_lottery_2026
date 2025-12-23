"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Center, Environment } from "@react-three/drei";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import type { Group } from "three";
import FloatingText from "@/components/FloatingText";
import CameraAnimation from "@/components/CameraAnimation";

function GachaModel({ onLoad }: { onLoad?: () => void }) {
  const { scene } = useGLTF("/models/gacha.gltf");
  const groupRef = useRef<Group>(null);
  const hasCalledOnLoad = useRef(false);

  // 儲存扭蛋物件及其原始位置，並基於位置分組
  const capsuleGroups = useMemo(() => {
    const allCapsules: { mesh: THREE.Mesh; originalPos: THREE.Vector3 }[] = [];

    scene.traverse((child) => {
      // 找出扭蛋（white_wall-material 和 Gacha_machine_glass-material）
      if (
        child.name &&
        (child.name.includes("white_wall-material") ||
          child.name.includes("Gacha_machine_glass-material"))
      ) {
        const mesh = child as THREE.Mesh;
        const originalPos = mesh.position.clone();
        originalPos.x -= 0.5;
        originalPos.y += 0.005;
        allCapsules.push({
          mesh,
          originalPos,
        });
      }
    });

    // 基於位置分組（距離小於 0.01 的視為同一組）
    const groups: {
      meshData: { mesh: THREE.Mesh; originalPos: THREE.Vector3 }[];
      centerPos: THREE.Vector3;
      groupIndex: number;
    }[] = [];
    const threshold = 0.01;

    allCapsules.forEach((capsule) => {
      // 查找是否已經有接近的組
      let foundGroup = groups.find(
        (group) => group.centerPos.distanceTo(capsule.originalPos) < threshold
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

    console.log(
      `找到 ${allCapsules.length} 個扭蛋部件，分為 ${groups.length} 組`
    );
    return groups;
  }, [scene]);

  useEffect(() => {
    if (!hasCalledOnLoad.current) {
      hasCalledOnLoad.current = true;
      onLoad?.();
    }
  }, [onLoad]);

  // 扭蛋和扭蛋機動畫
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // 扭蛋機本體晃動（模擬扭蛋碰撞的震動）
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(time * 8) * 0.015;
      groupRef.current.rotation.x = Math.sin(time * 3.2) * 0.01;
      groupRef.current.position.y = Math.sin(time * 4) * 0.02;
    }

    // 扭蛋彈跳動畫
    capsuleGroups.forEach((group) => {
      const { meshData, groupIndex } = group;

      // 每組扭蛋有不同的頻率和相位
      const bounceFrequency = 1.5 + (groupIndex % 5) * 0.4; // 彈跳頻率
      const phase = (groupIndex / capsuleGroups.length) * Math.PI * 2;

      // 彈跳效果（使用三角波模擬重力彈跳）
      const t = (time * bounceFrequency + phase) % 1;
      const bounce =
        t < 0.5
          ? t * 2 // 上升（線性）
          : 2 - t * 2; // 下降（線性）

      // 彈跳幅度（限制範圍避免穿模）
      const bounceHeight = 0.012;
      const verticalOffset = (bounce - 0.5) * bounceHeight;

      // 固定旋轉速度（每組略有不同）
      const rotationSpeed = 1.0 + (groupIndex % 3) * 0.2;
      const angle = time * rotationSpeed + phase;

      // 對組內的所有 mesh 應用相同的旋轉，但保留各自的原始位置
      meshData.forEach(({ mesh, originalPos }) => {
        // 垂直彈跳
        mesh.position.y = originalPos.y + verticalOffset;

        // 旋轉
        mesh.rotation.y = angle;

        // 輕微的 X 軸抖動（模擬碰撞時的晃動）
        mesh.rotation.x = Math.sin(time * 4 + phase) * 0.05;
      });
    });
  });

  return (
    <Center>
      <primitive ref={groupRef} object={scene} scale={12} />
      <FloatingText />
    </Center>
  );
}

// 预加载GLTF模型
useGLTF.preload("/models/gacha.gltf");

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

        {/* Camera拉近动画 */}
        <CameraAnimation />

        {/* HDR 環境照明 - 增加強度讓顏色更飽和 */}
        <Environment preset="sunset" environmentIntensity={1.5} />

        {/* 補充光源 - 增加色彩層次 */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 5, 3]}
          intensity={0.8}
          color="#ffffff"
        />
        <pointLight position={[-3, 2, -2]} intensity={0.5} color="#ffd6a5" />

        {/* GLTF 模型 */}
        <GachaModel onLoad={onReadyAction} />

        {/* 轨道控制器 */}
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

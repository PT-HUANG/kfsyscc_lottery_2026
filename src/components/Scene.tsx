"use client";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Center, Environment } from "@react-three/drei";
import { useRef, useEffect } from "react";
import type { Group } from "three";
import FloatingText from "@/components/FloatingText";
import CameraAnimation from "@/components/CameraAnimation";

function GachaModel({ onLoad }: { onLoad?: () => void }) {
  const { scene } = useGLTF("/models/gacha.gltf");
  const groupRef = useRef<Group>(null);
  const hasCalledOnLoad = useRef(false);

  useEffect(() => {
    // 模型加载完成后通知父组件（只调用一次）
    if (scene && onLoad && !hasCalledOnLoad.current) {
      console.log("GLTF scene loaded!", scene);
      hasCalledOnLoad.current = true;
      onLoad();
    }
  }, [scene, onLoad]);

  return (
    <Center>
      <primitive ref={groupRef} object={scene} scale={12} />
      {/* 漂浮的3D文字 */}
      <FloatingText />
    </Center>
  );
}

// 预加载GLTF模型
useGLTF.preload("/models/gacha.gltf");

export default function Scene({ onReadyAction }: { onReadyAction?: () => void }) {
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

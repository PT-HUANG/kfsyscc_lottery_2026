"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Center, Environment } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh, Group } from "three";

function GachaModel() {
  const { scene } = useGLTF("/models/gacha.gltf");
  const groupRef = useRef<Group>(null);

  return (
    <Center>
      <primitive ref={groupRef} object={scene} scale={15} />
    </Center>
  );
}

function RotatingBox() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry />
      <meshNormalMaterial />
    </mesh>
  );
}

export default function Scene() {
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
        camera={{ fov: 65, near: 0.01, far: 1000, position: [0, 2, 10] }}
        gl={{ toneMappingExposure: 1.2 }}
      >
        <color attach="background" args={["#e8f4f8"]} />

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
        <GachaModel />

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

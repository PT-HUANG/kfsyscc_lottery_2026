"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

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
        // gl={{ pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1 }}
        camera={{ fov: 70, near: 0.01, far: 0, position: [5, 5, 5] }}
      >
        <color attach="background" args={["white"]} />
        <RotatingBox />
      </Canvas>
    </div>
  );
}

"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import Scene from "@/components/Scene";
import "./loading.css";

function RotatingBox() {
  const meshRef = useRef<Mesh>(null);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} scale={2}>
      <boxGeometry />
      <meshNormalMaterial />
    </mesh>
  );
}

function LoadingScene({ progress }: { progress: number }) {
  return (
    <div className="loading-container">
      <div className="loading-content">
        {/* 3D旋转方块 */}
        <div className="canvas-container">
          <Canvas camera={{ fov: 50, position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <RotatingBox />
          </Canvas>
        </div>

        {/* Loading文字 */}
        <div className="loading-text">
          <h2 className="loading-title">Loading Gacha Machine...</h2>
        </div>

        {/* 进度条 */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-text">{Math.round(progress)}%</div>
        </div>
      </div>
    </div>
  );
}

export default function GachaPage() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    // 模拟加载进度
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const newProgress = Math.min(prev + 3, 100);
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // 当进度到100%且Scene准备好后，隐藏loading
  useEffect(() => {
    if (progress >= 100 && sceneReady) {
      // 稍微延迟一下，让用户看到100%
      const timer = setTimeout(() => {
        setLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress, sceneReady]);

  const handleSceneReady = useCallback(() => {
    console.log("Scene ready!"); // 调试用
    setSceneReady(true);
  }, []);

  return (
    <>
      {/* Scene始终渲染，用z-index和opacity控制显示 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: loading ? 0 : 1,
          pointerEvents: loading ? "none" : "auto",
          transition: "opacity 1s ease",
          zIndex: 1,
        }}
      >
        <Scene onReadyAction={handleSceneReady} />
      </div>
      {/* Loading覆盖在上面 */}
      {loading && (
        <div style={{ position: "fixed", top: 0, left: 0, zIndex: 10 }}>
          <LoadingScene progress={progress} />
        </div>
      )}
    </>
  );
}

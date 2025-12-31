import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { useLotteryUIStore } from "@/stores/useLotteryUIStore";

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

export default function LoadingScene() {
  // Get state from store
  const { progress, setProgress, sceneReady, setLoading } = useLotteryUIStore();

  // 模擬加載進度
  useEffect(() => {
    const interval = setInterval(() => {
      const currentProgress = useLotteryUIStore.getState().progress;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setProgress(100);
      } else {
        const newProgress = Math.min(currentProgress + 3, 100);
        setProgress(newProgress);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [setProgress]);

  // 當進度到 100% 且 Scene 準備好後，隱藏 loading
  useEffect(() => {
    if (progress >= 100 && sceneReady) {
      // 稍微延遲一下，讓用戶看到 100%
      const timer = setTimeout(() => {
        setLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress, sceneReady, setLoading]);

  return (
    <div
      className="loading-container"
      style={{ position: "fixed", top: 0, left: 0, zIndex: 10 }}
    >
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

        {/* 3D模型授權資訊 */}
        <div className="text-center mt-8 text-base text-gray-400 max-w-2xl mx-auto px-4">
          <p>
            3D Model based on{" "}
            <a
              href="https://sketchfab.com/3d-models/gacha-machine-upload-c2ff648add1e4062bb16313ce40ab5e3"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              &quot;Gacha machine upload&quot;
            </a>{" "}
            by{" "}
            <a
              href="https://sketchfab.com/ChesterLin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              ChesterLin
            </a>
            , licensed under{" "}
            <a
              href="http://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              CC-BY-4.0
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

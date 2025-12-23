"use client";
import { useRef } from "react";
import { Text3D, Center } from "@react-three/drei";
import * as THREE from "three";

interface CoinProps {
  position?: [number, number, number];
  visible?: boolean;
  opacity?: number;
  autoRotate?: boolean;
}

export default function Coin({
  position = [0, 10, 0],
  visible = true,
  opacity = 1,
}: CoinProps) {
  const coinRef = useRef<THREE.Group>(null);

  if (!visible) return null;

  return (
    <group ref={coinRef} position={position}>
      {/* 金币整体组 - 金币本体和符号绑定在一起 */}
      <group position={[0, 0, 0]} scale={0.5}>
        {/* 金币主体（圆柱体） */}
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
          <meshStandardMaterial
            color="#FFD700"
            metalness={0.9}
            roughness={0.2}
            emissive="#FFA500"
            emissiveIntensity={0.2}
            transparent
            opacity={opacity}
          />
        </mesh>

        {/* $ 符号 - 正面 */}
        <Center position={[0, 0, 0.06]}>
          <Text3D
            font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
            size={0.5}
            height={0.05}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.01}
            bevelSize={0.01}
            bevelSegments={5}
          >
            $
            <meshStandardMaterial
              color="#FFFFFF"
              metalness={0.9}
              roughness={0.25}
              transparent
              opacity={opacity}
            />
          </Text3D>
        </Center>

        {/* $ 符号 - 背面 */}
        <Center position={[0, 0, -0.06]} rotation={[0, Math.PI, 0]}>
          <Text3D
            font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
            size={0.5}
            height={0.05}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.01}
            bevelSize={0.01}
            bevelSegments={5}
          >
            $
            <meshStandardMaterial
              color="#FFFFFF"
              metalness={0.9}
              roughness={0.25}
              transparent
              opacity={opacity}
            />
          </Text3D>
        </Center>
      </group>
    </group>
  );
}

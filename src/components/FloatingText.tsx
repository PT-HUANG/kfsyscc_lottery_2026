"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text3D } from "@react-three/drei";
import type { Mesh } from "three";

interface FloatingTextProps {
  text?: string;
  position?: [number, number, number];
  size?: number;
  color?: string;
  emissiveColor?: string;
  animationDelay?: number;
  floatAmplitude?: number;
  floatSpeed?: number;
}

export default function FloatingText({
  text = "KFSYSCC",
  position = [3.75, 8.25, -5],
  size = 1,
  color = "#ff1493",
  emissiveColor = "#ff69b4",
  animationDelay = 7.2,
  floatAmplitude = 0.2,
  floatSpeed = 1.5,
}: FloatingTextProps) {
  const textRef = useRef<Mesh>(null);
  const elapsedTime = useRef(0);
  const baseY = position[1]; // 使用传入的Y位置作为基准

  useFrame((_state, delta) => {
    elapsedTime.current += delta;

    // 等待camera动画完成后才开始漂浮
    if (textRef.current && elapsedTime.current > animationDelay) {
      const time = elapsedTime.current - animationDelay;
      // 使用sin函数计算Y轴偏移，实现上下漂浮
      const offsetY = Math.sin(time * floatSpeed) * floatAmplitude;
      textRef.current.position.y = baseY + offsetY;
    }
  });

  return (
    <Text3D
      ref={textRef}
      font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
      position={position}
      size={size}
      height={0.3}
      curveSegments={12}
      bevelEnabled
      bevelThickness={0.05}
      bevelSize={0.02}
      bevelOffset={0}
      bevelSegments={5}
    >
      {text}
      <meshStandardMaterial
        color={color}
        metalness={0.3}
        roughness={0.2}
        emissive={emissiveColor}
        emissiveIntensity={0.2}
      />
    </Text3D>
  );
}

"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";

export default function CameraAnimation() {
  const { camera } = useThree();
  const animationProgress = useRef(0);
  const elapsedTime = useRef(0); // 累积时间
  const delayTime = 3.5; // 开始前停留1.5秒
  const initialRadius = 20; // 初始半径（远）
  const targetRadius = 12; // 目标半径（近）
  const initialAngle = 0; // 初始角度
  const targetAngle = Math.PI * 2; // 目标角度（360度 = 2π）
  const initialHeight = 6; // 初始高度（俯视）
  const targetHeight = 2.5; // 目标高度（平视）

  useFrame((_state, delta) => {
    // 先累积时间，等待延迟
    if (elapsedTime.current < delayTime) {
      elapsedTime.current += delta;
      // 在延迟期间，设置初始位置
      camera.position.set(
        initialRadius * Math.sin(initialAngle),
        initialHeight,
        initialRadius * Math.cos(initialAngle)
      );
      camera.lookAt(0, 0, 0);
      return;
    }

    if (animationProgress.current < 1) {
      // 调整速度（约5秒完成一圈，更慢更流畅）
      animationProgress.current += delta * 0.25;

      if (animationProgress.current > 1) {
        animationProgress.current = 1;
      }

      // 使用 easeInOutQuart 缓动函数让开始和结束都更平滑
      const easeProgress =
        animationProgress.current < 0.5
          ? 8 * animationProgress.current * animationProgress.current * animationProgress.current * animationProgress.current
          : 1 - Math.pow(-2 * animationProgress.current + 2, 4) / 2;

      // 旋转使用 easeInOutQuad，让开始和结束都平滑
      const rotationEase =
        animationProgress.current < 0.5
          ? 2 * animationProgress.current * animationProgress.current
          : 1 - Math.pow(-2 * animationProgress.current + 2, 2) / 2;

      // 计算当前角度（旋转一圈，使用轻微缓动）
      const currentAngle = initialAngle + (targetAngle - initialAngle) * rotationEase;

      // 计算当前半径（从远到近，使用平滑缓动）
      const currentRadius = initialRadius + (targetRadius - initialRadius) * easeProgress;

      // 计算当前高度（从俯视到平视，使用平滑缓动）
      const currentHeight = initialHeight + (targetHeight - initialHeight) * easeProgress;

      // 使用圆周运动公式计算位置
      const newX = currentRadius * Math.sin(currentAngle);
      const newZ = currentRadius * Math.cos(currentAngle);
      const newY = currentHeight;

      // 使用 set 方法修改 camera 位置
      camera.position.set(newX, newY, newZ);
      camera.lookAt(0, 0, 0); // 始终看向中心（扭蛋机）
    }
  });

  return null;
}

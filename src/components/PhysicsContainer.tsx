import { CuboidCollider } from "@react-three/rapier";

// 定义 props 接口
interface PhysicsBoundsProps {
  size?: [number, number, number];
  wallThickness?: number;
  position?: [number, number, number];
}

// 默认值
const DEFAULT_SIZE: [number, number, number] = [3.5, 3.5, 3];
const DEFAULT_WALL_THICKNESS = 0.02;

// 创建一个看不见的物理边界形状，不再包含 RigidBody
// 它只提供碰撞体形状，必须被包裹在一个 RigidBody 内部
export function PhysicsBounds({
  size = DEFAULT_SIZE,
  wallThickness = DEFAULT_WALL_THICKNESS,
}: PhysicsBoundsProps) {
  const [w, h, d] = size;

  return (
    <>
      {/* 底部 */}
      <CuboidCollider
        args={[w / 2, wallThickness / 2, d / 2]}
        position={[0, -h / 2, 0]}
        friction={2.0}
        restitution={0.3}
      />
      {/* 顶部 */}
      <CuboidCollider
        args={[w / 2, wallThickness / 2, d / 2]}
        position={[0, h / 2, 0]}
        friction={2.0}
        restitution={0.3}
      />
      {/* 前墙 */}
      <CuboidCollider
        args={[w / 2, h / 2, wallThickness / 2]}
        position={[0, 0, d / 2]}
        friction={2.0}
        restitution={0.3}
      />
      {/* 后墙 */}
      <CuboidCollider
        args={[w / 2, h / 2, wallThickness / 2]}
        position={[0, 0, -d / 2]}
        friction={2.0}
        restitution={0.3}
      />
      {/* 左墙 */}
      <CuboidCollider
        args={[wallThickness / 2, h / 2, d / 2]}
        position={[-w / 2, 0, 0]}
        friction={2.0}
        restitution={0.3}
      />
      {/* 右墙 */}
      <CuboidCollider
        args={[wallThickness / 2, h / 2, d / 2]}
        position={[w / 2, 0, 0]}
        friction={2.0}
        restitution={0.3}
      />
    </>
  );
}

// 溜滑梯默認值
const DEFAULT_TRACK_SIZE: [number, number, number] = [0.5, 0.3, 3.75]; // 寬度、護欄高度、長度
const DEFAULT_TRACK_THICKNESS = 0.05;
const DEFAULT_TRACK_POSITION: [number, number, number] = [1.5, -4.5, 0];
const DEFAULT_TRACK_ANGLE = -0.1; // 傾斜角度（弧度）

interface GachaTrackProps extends PhysicsBoundsProps {
  angle?: number; // 傾斜角度
}

export function GachaTrack({
  size = DEFAULT_TRACK_SIZE,
  wallThickness = DEFAULT_TRACK_THICKNESS,
  position = DEFAULT_TRACK_POSITION,
  angle = DEFAULT_TRACK_ANGLE,
}: GachaTrackProps) {
  const [w, railHeight, trackLength] = size; // 寬度、護欄高度、軌道長度
  const [px, py, pz] = position;

  // 計算傾斜後的高度差
  const heightDiff = Math.sin(angle) * trackLength;
  const trackMidY = py - heightDiff / 2; // 軌道中心點的 Y 座標

  return (
    <>
      {/* 傾斜的滑道底部（從 z 負往 z 正傾斜）*/}
      <CuboidCollider
        args={[w / 2, wallThickness / 2, trackLength / 2]}
        position={[px, trackMidY, pz]}
        rotation={[-angle, 0, 0]} // 繞 X 軸旋轉，讓它從高到低
        friction={0.3} // 低摩擦力，讓球更容易滑動
        restitution={0.2}
      />

      {/* 左側護欄（跟隨傾斜角度）*/}
      <CuboidCollider
        args={[wallThickness / 2, railHeight / 2, trackLength / 2]}
        position={[px - w / 2, trackMidY + railHeight / 2, pz]}
        rotation={[-angle, 0, 0]}
        friction={0.5}
        restitution={0.2}
      />

      {/* 右側護欄（跟隨傾斜角度）*/}
      <CuboidCollider
        args={[wallThickness / 2, railHeight / 2, trackLength / 2]}
        position={[px + w / 2, trackMidY + railHeight / 2, pz]}
        rotation={[-angle, 0, 0]}
        friction={0.5}
        restitution={0.2}
      />

      {/* 出口擋板（z 軸正方向，低處）*/}
      <CuboidCollider
        args={[w / 2 - wallThickness , (railHeight + wallThickness) / 2, wallThickness / 2]}
        position={[px, py + (railHeight + wallThickness) / 2, pz + trackLength / 2]}
        friction={0.5}
        restitution={0.2}
      />
    </>
  );
}

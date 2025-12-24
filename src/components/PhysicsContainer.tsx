import { CuboidCollider } from "@react-three/rapier";

// 定义 props 接口
interface PhysicsBoundsProps {
  size?: [number, number, number];
  wallThickness?: number;
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

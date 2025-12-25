"use client";

import { forwardRef } from "react";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import { GACHA_COLORS, GACHA_BALL_PHYSICS } from "@/config/gachaConfig";

/**
 * 扭蛋球屬性
 */
export interface GachaBallProps {
  /**
   * 扭蛋球的位置 [x, y, z]
   */
  position: [number, number, number];
  /**
   * 扭蛋球的顏色（十六進制顏色代碼）
   * 如果不提供，將從預設顏色列表中選擇
   */
  color?: string;
  /**
   * 扭蛋球的索引，用於從預設顏色列表中選擇顏色
   */
  index?: number;
  /**
   * 球體半徑，默認為 0.25
   */
  radius?: number;
  /**
   * 物理屬性：恢復力（彈性），默認為 0.5
   */
  restitution?: number;
  /**
   * 物理屬性：摩擦力，默認為 1.0
   */
  friction?: number;
  /**
   * 物理屬性：質量，默認為 0.2
   */
  mass?: number;
  /**
   * 物理屬性：重力縮放，默認為 1
   */
  gravityScale?: number;
  /**
   * 物理屬性：線性阻尼，默認為 0.2
   */
  linearDamping?: number;
  /**
   * 物理屬性：角度阻尼，默認為 0.2
   */
  angularDamping?: number;
  /**
   * 材質屬性：金屬度，默認為 0.1
   */
  metalness?: number;
  /**
   * 材質屬性：粗糙度，默認為 0.1
   */
  roughness?: number;
}

/**
 * 扭蛋球元件
 *
 * 一個帶有物理效果的 3D 扭蛋球，可以自定義顏色、位置和物理屬性
 *
 * @example
 * ```tsx
 * // 使用預設顏色
 * <GachaBall position={[0, 5, 0]} index={0} />
 *
 * // 使用自定義顏色
 * <GachaBall position={[0, 5, 0]} color="#FF0000" />
 *
 * // 自定義物理屬性
 * <GachaBall
 *   position={[0, 5, 0]}
 *   color="#00FF00"
 *   mass={0.5}
 *   restitution={0.8}
 * />
 * ```
 */
const GachaBall = forwardRef<RapierRigidBody, GachaBallProps>(function GachaBall(
  {
    position,
    color,
    index = 0,
    radius = GACHA_BALL_PHYSICS.radius,
    restitution = GACHA_BALL_PHYSICS.restitution,
    friction = GACHA_BALL_PHYSICS.friction,
    mass = GACHA_BALL_PHYSICS.mass,
    gravityScale = GACHA_BALL_PHYSICS.gravityScale,
    linearDamping = GACHA_BALL_PHYSICS.linearDamping,
    angularDamping = GACHA_BALL_PHYSICS.angularDamping,
    metalness = 0.1,
    roughness = 0.1,
  },
  ref
) {
  // 如果沒有提供顏色，從預設顏色列表中選擇
  const ballColor = color ?? GACHA_COLORS[index % GACHA_COLORS.length];

  return (
    <RigidBody
      ref={ref}
      position={position}
      restitution={restitution}
      friction={friction}
      mass={mass}
      colliders="ball"
      type="dynamic"
      gravityScale={gravityScale}
      linearDamping={linearDamping}
      angularDamping={angularDamping}
    >
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[radius, GACHA_BALL_PHYSICS.segments, GACHA_BALL_PHYSICS.segments]} />
        <meshStandardMaterial
          color={ballColor}
          metalness={metalness}
          roughness={roughness}
        />
      </mesh>
    </RigidBody>
  );
});

export default GachaBall;

/**
 * 多個扭蛋球的容器元件
 */
export interface GachaBallsProps {
  /**
   * 扭蛋球的位置陣列
   */
  positions: [number, number, number][];
  /**
   * 自定義顏色陣列（可選）
   */
  colors?: string[];
  /**
   * 共用的物理屬性（可選）
   */
  physics?: Partial<Omit<GachaBallProps, "position" | "color" | "index">>;
}

/**
 * 多個扭蛋球的容器元件
 *
 * 用於一次性渲染多個扭蛋球
 *
 * @example
 * ```tsx
 * const positions: [number, number, number][] = [
 *   [0, 5, 0],
 *   [1, 5, 0],
 *   [2, 5, 0],
 * ];
 *
 * <GachaBalls positions={positions} />
 * ```
 */
export function GachaBalls({ positions, colors, physics = {} }: GachaBallsProps) {
  return (
    <>
      {positions.map((position, index) => (
        <GachaBall
          key={index}
          position={position}
          index={index}
          color={colors?.[index]}
          {...physics}
        />
      ))}
    </>
  );
}

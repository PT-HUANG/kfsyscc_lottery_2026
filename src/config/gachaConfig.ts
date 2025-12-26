import * as THREE from "three";

/**
 * 扭蛋顏色配置
 * 10 種不同的顏色可供選擇
 */
export const GACHA_COLORS = [
  "#FF6B6B", // 活力紅
  "#FFD93D", // 黃金亮黃
  "#6BCB77", // 清新綠
  "#4D96FF", // 明亮藍
  "#FF9F1C", // 橘色能量
  "#845EC2", // 紫色夢幻
  "#FF70A6", // 粉色可愛
  "#00C9A7", // 青綠活力
  "#F9F871", // 柔和亮黃
  "#FFAB76", // 甜橘
] as const;

/**
 * 扭蛋機配置
 */
export const GACHA_MACHINE_CONFIG = {
  // 物理邊界相對於模型的位置
  boundsPosition: [0.6, 0.45, -0.5] as [number, number, number],
  boundsSize: [0.3, 0.3, 0.3] as [number, number, number],
  modelScale: 12,
  // 模型位置調整以補償幾何中心的偏移
  modelPosition: [-6.6, -5.4, 6] as [number, number, number],
} as const;

/**
 * 金幣動畫配置
 */
export const COIN_CONFIG = {
  START_POSITION: new THREE.Vector3(-0.125, -2, 1.75),
  TARGET_POSITION: new THREE.Vector3(-0.125, -3.5, 1.75),
  DISAPPEAR_Y: -2.75,
  FALL_SPEED: 1.5,
  FADE_OUT_SPEED: 4.0,
  DELAY_BEFORE_SHAKE: 0.2,
} as const;

/**
 * 扭蛋機晃動動畫配置
 */
export const SHAKE_CONFIG = {
  DURATION: 3,
  ROTATION_Z_AMPLITUDE: 0.08, // 增加 Z 軸旋轉幅度 (原: 0.045)
  ROTATION_X_AMPLITUDE: 0.05, // 增加 X 軸旋轉幅度 (原: 0.03)
  POSITION_Y_AMPLITUDE: 0.08, // 增加 Y 軸位移幅度 (原: 0.06)
  EASE_DURATION: 0.5,
  FREQ_Z: 6,
  FREQ_X: 3,
  FREQ_Y: 4,
} as const;

/**
 * 扭蛋球物理屬性配置
 */
export const GACHA_BALL_PHYSICS = {
  radius: 0.4225, // 再增加 30% (原: 0.325)
  segments: 16,
  restitution: 0.5,
  friction: 1.0,
  mass: 0.2,
  gravityScale: 1,
  linearDamping: 0.2,
  angularDamping: 0.2,
  minDistance: 1.05625, // radius * 2.5
  margin: 0.507, // radius * 1.2
} as const;

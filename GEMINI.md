# Gemini Project Context: KFSYSCC Lottery 2026

這是一個專為春酒活動設計的 3D 扭蛋機抽獎系統。系統採用前後台分離架構，支援跨分頁同步控制。

## 🌐 語言偏好 (Language Preference)
- **強制要求**：在此專案中，與使用者的所有溝通、回覆、計劃說明**必須使用繁體中文**。

## 🏗️ 專案架構
本專案分為兩個主要部分，透過 `BroadcastChannel` 進行跨頁籤通訊：

1.  **前台顯示頁面 (`/gacha`)**：
    *   負責 3D 場景渲染（Three.js, React Three Fiber）。
    *   接收來自後台的抽獎指令並執行動畫。
    *   顯示中獎結果與即時中獎看板。
2.  **後台管理系統 (`/backstage`)**：
    *   負責抽獎邏輯控制（選擇分組、獎項、模式）。
    *   管理參與者名單、獎項設定與中獎紀錄。
    *   即時同步狀態（如動畫鎖定、背景調整）至前台。

## 🚀 技術棧
- **框架**：Next.js 15+ (App Router), React 19, TypeScript
- **3D 渲染**：Three.js, @react-three/fiber, @react-three/drei, @react-three/rapier (物理引擎)
- **狀態管理**：Zustand (搭配 Persist 中間件進行數據持久化)
- **UI 組件**：Tailwind CSS, shadcn/ui
- **通訊**：BroadcastChannel API, Storage Event API

## 📋 開發規範與慣例
- **數據同步**：使用 `useStorageSync` 鉤子確保 `localStorage` 的更改在所有分頁間即時同步。
- **抽獎流程**：
    1. 後台計算中獎者。
    2. 後台將中獎者與配置廣播至前台。
    3. 前台執行動畫後，雙方同步寫入中獎紀錄（具備去重機制）。
- **樣式**：遵循 Tailwind CSS 慣例，UI 組件優先使用 shadcn/ui。
- **持久化**：關鍵數據（名單、獎項、紀錄、背景配置）必須儲存在 Zustand 的 persist 中。

## 🛠️ 常用指令
- **啟動開發伺服器**：`pnpm dev`
- **專案建置**：`pnpm build`
- **啟動正式環境**：`pnpm start`
- **程式碼檢查**：`pnpm lint`

## 核心組件與 Hook
- `src/hooks/useLotteryRemote.ts`：發送抽獎指令與同步狀態（後台用）。
- `src/hooks/useLotteryReceiver.ts`：接收指令與同步狀態（前台/後台用）。
- `src/hooks/useStorageSync.ts`：監聽 Storage 事件以實現跨分頁數據重載。
- `src/stores/useLotteryDataStore.ts`：核心數據儲存（名單、獎項、紀錄）。
- `src/components/Scene.tsx`：主要的 3D 場景邏輯。

---
*此文件由 Gemini CLI 自動生成，作為未來對話的上下文參考。*

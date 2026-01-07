# KFSYSCC 3D 扭蛋機抽獎系統 2026

一個專為醫院春酒活動打造的互動式 3D 扭蛋機抽獎系統，結合精美的 3D 動畫與完整的抽獎管理功能。

![Next.js](https://img.shields.io/badge/Next.js-16.1.0-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.182.0-green)
![Zustand](https://img.shields.io/badge/Zustand-5.0.9-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 專案簡介

這是一個現代化的網頁抽獎應用，使用 3D 圖形技術打造沉浸式的扭蛋機體驗。透過流暢的動畫、直覺的操作介面，以及完整的資料管理功能，為春酒等活動提供專業且有趣的抽獎解決方案。

## 🎲 隨機抽取機制

本系統採用業界標準的 **Fisher-Yates Shuffle 演算法**，確保抽獎的公平性與隨機性。

### 核心演算法

#### Fisher-Yates Shuffle（洗牌演算法）
```
原理：從陣列末端開始，每次隨機選擇一個位置與當前位置交換

範例（5 位參與者）：
初始: [A, B, C, D, E]

第1輪: 從 0~4 隨機選一個（假設選到 2）
      [A, B, E, D, C]  ← C 和 E 交換

第2輪: 從 0~3 隨機選一個（假設選到 1）
      [A, D, E, B, C]  ← B 和 D 交換

第3輪: 從 0~2 隨機選一個（假設選到 0）
      [E, D, A, B, C]  ← A 和 E 交換

第4輪: 從 0~1 隨機選一個（假設選到 0）
      [D, E, A, B, C]  ← D 和 E 交換

結果: [D, E, A, B, C] ← 完全隨機打亂
```

#### 為什麼選擇 Fisher-Yates？

| 特性 | Fisher-Yates | 其他方法 |
|------|-------------|---------|
| **公平性** | ✅ 每人機率完全相等 | ⚠️ 可能有偏差 |
| **演算法複雜度** | ✅ O(n) 線性時間 | ❌ 可能 O(n²) |
| **無偏隨機** | ✅ 數學證明無偏 | ⚠️ 難以保證 |
| **記憶體使用** | ✅ 原地操作 | ❌ 可能需額外空間 |

### 抽獎流程

```
┌─────────────────────────────────────────────────────────┐
│  1️⃣ 參與者篩選                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  所有參與者                                       │  │
│  │    ↓                                             │  │
│  │  【分組過濾】選擇的分組（如「VIP組」）              │  │
│  │    ↓                                             │  │
│  │  【防重複中獎】排除已中獎者（可關閉）               │  │
│  │    ↓                                             │  │
│  │  可用參與者列表                                    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│  2️⃣ Fisher-Yates 洗牌                                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  for (i = n-1; i > 0; i--) {                     │  │
│  │    j = random(0, i)        // 隨機選擇位置        │  │
│  │    swap(array[i], array[j]) // 交換元素          │  │
│  │  }                                               │  │
│  │                                                  │  │
│  │  結果：完全隨機排列                               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│  3️⃣ 抽取中獎者                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  單人模式：取第 1 位                              │  │
│  │  多人模式：取前 N 位（N = 獎項數量）               │  │
│  │                                                  │  │
│  │  ✅ 每人中獎機率 = 1 / 可用參與者數               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 公平性保證

#### 1. 真實隨機數
```javascript
Math.random()  // 使用瀏覽器原生隨機數生成器
```
- 基於硬體熵源（時間、滑鼠移動、鍵盤輸入等）
- 符合統計學上的均勻分佈要求

#### 2. 防重複中獎機制
```
【開啟時】已中獎者 = 自動排除
【關閉時】已中獎者 = 可再次中獎

適用場景：
✅ 開啟 - 每人只能中一次（公平分配）
✅ 關閉 - 特殊活動（如買多送多）
```

#### 3. 分組隔離
```
VIP組（10人） + 一般員工組（100人）

範例1：「頭獎」限定 VIP組
  → 只有 VIP組 10人 參與抽獎
  → 一般員工無法中此獎

```

#### 4. 驗證機制
抽獎前自動檢查：
- ✅ 參與者名單是否已匯入
- ✅ 獎項是否已設定
- ✅ 可用參與者數量是否足夠
- ✅ 分組設定是否正確

### 數學證明

**每位參與者被抽中的機率完全相等**

假設有 N 位參與者，抽取 K 位中獎者：

```
P(第 i 位參與者被抽中) = K / N

範例：
- 100 位參與者
- 抽 5 位中獎者
- 每人中獎機率 = 5 / 100 = 5%

無論參與者排在名單的哪個位置，機率都是 5%
```

Fisher-Yates 演算法已被數學證明，能產生所有可能排列的機率完全相等：
```
每種排列出現的機率 = 1 / N!

範例（3 位參與者 A, B, C）：
- 可能排列：ABC, ACB, BAC, BCA, CAB, CBA（共 3! = 6 種）
- 每種排列機率 = 1/6 = 16.67%
```

### 透明公開

所有抽獎邏輯開源可檢視：
- 📁 `src/hooks/useLotteryLogic.ts` - 抽獎邏輯主程式（155-160 行）
- 📁 `src/stores/useLotteryDataStore.ts` - 資料儲存與管理
- 🔍 歡迎任何技術人員檢視程式碼，確保公平性

### 🎯 核心特色

- **🎨 精美 3D 動畫** - 真實感的扭蛋機晃動、金幣投入、扭蛋掉落等動畫效果
- **🎭 4 種主題風格** - Classic（經典金色）、Modern（現代科技）、Elegant（優雅黑金）、Pastel（柔和粉彩）
- **🖼️ 場景自訂** - 支援自訂背景圖片上傳（IndexedDB 存儲），即時調整位置與縮放
- **👥 分組抽獎** - 支援參與者分組（VIP組、一般員工等），獎項可限定特定分組
- **📊 完整資料管理** - 參與者、獎項、中獎紀錄一站式管理
- **📁 批次匯入** - 支援 TXT 檔案快速匯入參與者與獎項（支援多次上傳不同分組）
- **🎁 多獎項抽獎** - 可選擇獎項、單次抽一個或抽全部剩餘名額
- **🔒 防重複中獎** - 自動過濾已中獎者，確保公平性
- **💾 雙重備份機制** - 自動存 localStorage + 清除前自動下載 JSON 備份
- **📤 多格式匯出** - CSV 匯出中獎名單、JSON 完整備份（含參與者/獎項/紀錄）
- **🎬 跳過動畫選項** - 支援直接顯示結果，適合快速抽獎場景
- **🔄 跨分頁同步** - 前後台分離，即時同步抽獎狀態

## 🚀 技術棧

### 核心框架
- **[Next.js](https://nextjs.org)** 16.1.0 - React 全端框架，使用 App Router
- **[React](https://react.dev)** 19 - UI 框架
- **[TypeScript](https://www.typescriptlang.org)** 5 - 類型安全的 JavaScript

### 3D 圖形
- **[Three.js](https://threejs.org)** 0.182.0 - WebGL 3D 圖形庫
- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber)** 9.4.2 - React 的 Three.js 渲染器
- **[React Three Drei](https://github.com/pmndrs/drei)** 10.7.7 - R3F 實用工具集
- **[@react-three/rapier](https://github.com/pmndrs/react-three-rapier)** - 物理引擎

### UI 與樣式
- **[Tailwind CSS](https://tailwindcss.com)** 3.4.19 - 實用優先的 CSS 框架
- **[Shadcn UI](https://ui.shadcn.com)** - 基於 Radix UI 的組件庫
- **[Lucide React](https://lucide.dev)** - 圖標庫

### 狀態管理
- **[Zustand](https://zustand-demo.pmnd.rs)** 5.0.9 + Persist Middleware - 輕量級狀態管理與資料持久化

## ✨ 功能特性

### 🎰 抽獎系統

#### 參與者管理
- ✅ TXT 檔案批次上傳（格式：`姓名 員工編號 部門`）
- ✅ **分組功能** - 上傳時指定分組名稱（必填），支援多次上傳不同分組
- ✅ 手動新增/編輯/刪除參與者（分組為必填欄位）
- ✅ 參與者列表顯示（含總人數統計、分組標籤）
- ✅ 支援員工編號和部門資訊（選填）

#### 獎項管理
- ✅ TXT 檔案批次上傳（格式：`獎品名稱 數量`）
- ✅ **分組限制** - 可選擇獎項限定特定分組（如 VIP 專屬獎項）
- ✅ 手動新增/編輯/刪除獎項
- ✅ 獎項等級自動排序（按檔案順序）
- ✅ 剩餘名額即時顯示
- ✅ 自動驗證：新增獎項前必須先上傳參與者名單

#### 抽獎功能
- ✅ **三步驟抽獎流程**：
  1. **選擇分組** - 必選，決定參與抽獎的人員範圍
  2. **選擇獎項** - 根據分組自動過濾顯示可用獎項
  3. **選擇模式** - 單次抽一個 / 抽全部剩餘
- ✅ 智能過濾：
  - 獎項下拉選單只顯示「無限制」或「限定該分組」的獎項
  - 自動標示獎項適用範圍（🌐全部分組 / 🎯限定分組）
  - 獎項有分組限制時，自動鎖定對應分組
- ✅ 智能驗證：
  - 自動檢查是否有設定獎項
  - 自動檢查獎項是否已抽完
  - 自動檢查該分組是否有足夠的參與者
- ✅ 防重複中獎機制（自動跳過已中獎者）
- ✅ 真實隨機演算法（Fisher-Yates Shuffle）

#### 中獎紀錄
- ✅ **本輪中獎** - 頁面右上角顯示最新一輪的中獎者
  - 獎項名稱高亮顯示
  - 中獎人數統計
  - 姓名 + 員工編號清單
  - 支援逐筆揭露動畫（多人抽獎時每秒揭露一位）
- ✅ **完整歷史紀錄** - 管理後台查看所有中獎紀錄
  - 表格式顯示（序號、姓名、員工編號、獎品名稱）
  - CSV 匯出功能（UTF-8，支援中文）
  - JSON 完整備份（含參與者、獎項、統計資訊）
  - 清除紀錄前自動下載備份
  - 手動下載備份按鈕

### 🎨 主題系統

支援 4 種視覺主題，跨分頁即時同步：

| 主題 | 風格描述 | 主色調 | 適用場景 |
|------|---------|--------|---------|
| **Classic** | 經典金色 | 金黃色系 | 傳統喜慶活動、春酒尾牙 |
| **Modern** | 現代科技 | 藍色科技風 | 科技公司、創新活動 |
| **Elegant** | 優雅黑金 | 黑金配色 | 高端活動、VIP 場合 |
| **Pastel** | 柔和粉彩 | 粉嫩色系 | 溫馨活動、親子場合 |

**特色**：
- 使用 CSS Modules 實現主題隔離
- 透過 BroadcastChannel 跨分頁同步主題變更
- 主題設定自動儲存到 localStorage

### 🎬 3D 動畫系統

#### 完整抽獎流程動畫
1. **金幣投入** - 3D 金幣從投幣口掉落並淡出
2. **扭蛋機晃動** - 多軸旋轉（Z/X 軸）+ Y 軸位移，平滑漸入漸出
3. **扭蛋彈跳** - 機內扭蛋隨機彈跳與旋轉（物理模擬）
4. **扭蛋掉落** - 單顆扭蛋從出口滾出
5. **扭蛋浮起** - 扭蛋緩慢上浮，白光閃爍
6. **中獎揭露** - 左上角中獎看板逐筆顯示（每秒一位）
7. **顯示彈窗** - 所有中獎者揭露完畢後彈出 WinnerModal

**跳過動畫選項**：
- 啟用後直接顯示中獎結果，無需等待動畫
- 適用於快速抽獎或測試場景

#### 視覺效果
- ✅ **進階渲染**：
  - 黑色背景 + 動態霧效（增加深度感）
  - 即時陰影系統（directionalLight + spotLight）
  - ACES Filmic 色調映射（電影級色彩）
- ✅ **自訂背景**：
  - 支援 3D 場景背景圖片（3:2 比例自動適配）
  - 浮動面板即時調整背景位置（X/Y/Z）與縮放
  - 預設值一鍵重置
- ✅ 流暢相機動畫（環繞運鏡）
- ✅ HDR 環境照明（真實光影）
- ✅ 金幣金屬材質（自發光效果）
- ✅ 扭蛋多彩顏色（隨機）
- ✅ 加載進度動畫（旋轉方塊 + 進度條）

### 🔧 管理後台

統一的管理介面（點擊「管理」按鈕開啟），包含四個分頁：

1. **📋 參與者** - 上傳/管理參與者名單（支援分組）
2. **🎁 獎項** - 上傳/管理獎項設定（可設定分組限制）
3. **⚙️ 設定** - 抽獎統計資訊
4. **📊 紀錄** - 中獎紀錄查看與匯出

### 🎨 場景控制

- **背景按鈕** - 點擊開啟浮動背景設定面板
  - 即時調整背景圖片位置（水平/垂直/深度）
  - 即時調整背景圖片縮放大小
  - 支援自訂背景圖片（放置於 `/public/GachaBG.png`）

### 💾 資料持久化與備份

#### 自動持久化（localStorage）
- 使用 Zustand Persist Middleware
- 5 個獨立 Store 自動儲存：
  - `kfsyscc-lottery-storage` - 參與者、獎項、中獎紀錄、設定
  - `lottery-selection` - 選擇狀態（獎項、分組、模式）
  - `lottery-ui` - UI 面板狀態
  - `lottery-theme-storage` - 主題設定
  - `background-config` - 背景配置
- 重新整理頁面資料不遺失

#### 手動備份機制
- ✅ **CSV 匯出** - 匯出中獎名單（適合列印、整理）
- ✅ **JSON 完整備份** - 包含所有資料與統計資訊
  ```json
  {
    "exportDate": "2026-01-07T...",
    "version": "1.0",
    "data": {
      "winnerRecords": [...],
      "participants": [...],
      "prizes": [...]
    },
    "statistics": {
      "totalWinners": 100,
      "totalParticipants": 500,
      "totalPrizes": 10
    }
  }
  ```
- ✅ **自動備份** - 清除紀錄前自動下載 JSON 備份
- ✅ **手動備份** - 隨時點擊「下載備份 JSON」按鈕

#### 自訂背景圖片存儲（IndexedDB）
- 使用 IndexedDB 存儲自訂背景圖片（避免 localStorage 5MB 限制）
- 支援 PNG, JPG, JPEG, WebP 格式
- 最大檔案大小：10MB
- 自動計算長寬比，避免變形

### 🔄 跨頁籤狀態同步

一個創新的雙螢幕抽獎解決方案，讓控制與展示完美分離！

#### 核心概念
透過 `BroadcastChannel` 和 `localStorage` 實現多個瀏覽器頁籤之間的即時狀態同步，讓抽獎系統可以分離控制台與顯示畫面。

```
┌───────────┐           ┌───────────┐           ┌──────────┐
│ 後台控制頁 │ ←─────→  │  通訊層   │ ←─────→  │ 抽獎展示頁│
│(/backstage)│          │(Channel)  │          │ (/gacha) │
└───────────┘           └───────────┘           └──────────┘
     ↓                       ↓                       ↓
【操作控制】              【即時同步】              【畫面呈現】
 - 選擇獎項               - BroadcastChannel       - 動畫播放
 - 開始抽獎               - localStorage           - 顯示中獎
 - 重置狀態               - 雙向監聽               - 狀態響應
```

#### 使用場景
✨ **分離控制與展示** - 操作者與觀眾可用不同螢幕
✨ **即時同步** - 毫秒級響應，無延遲感
✨ **資料持久化** - 重新整理不遺失中獎紀錄
✨ **無需後端** - 純前端實現，部署簡單
✨ **離線可用** - 本地通訊不依賴網路

#### 實際應用
1. **大型活動** - 主持人用筆記型電腦操作，投影大螢幕給觀眾
2. **多螢幕展示** - 開啟多個展示頁籤，同時在不同螢幕顯示
3. **備援方案** - 展示頁籤意外關閉，重新開啟後自動恢復狀態

#### 技術架構

**通訊層**
```
BroadcastChannel（即時通訊）
     ↕
localStorage（持久化備份）
```

**資料流向**
```
後台操作 → 發送指令 → Channel 廣播 → 展示頁接收 → 觸發動畫
                          ↓
                    localStorage 備份
```

**核心組件**
- `lotteryChannel.ts` - BroadcastChannel 封裝
- `useLotteryRemote.ts` - 發送端 Hook（控制頁使用）
- `useLotteryReceiver.ts` - 接收端 Hook（展示頁使用）
- `useStorageSync.ts` - 持久化同步 Hook

#### 完整抽獎流程範例

```
時間 │ 後台控制頁(/backstage)         │ 展示頁面(/gacha)
─────┼──────────────────────────────┼─────────────────────────
T0   │ 使用者選擇「頭獎」             │ 待機中
T1   │ 點擊「開始抽獎」按鈕           │ 待機中
T2   │ 發送 {type:"start"} ────────→│ 接收指令
T3   │                              │ 動畫開始播放
T4   │                              │ 隨機演算法執行
T5   │                              │ 選出中獎者「王小明」
T6   │ ←────────────────────────────│ 發送 winner 事件
T7   │ 更新 winnerList               │ 動畫結束
     │ localStorage 備份             │
T8   │ 顯示「王小明」中獎             │ 顯示「王小明」中獎
```

#### 可靠性設計

**重新整理保護**
- 展示頁重新整理 → 從 localStorage 恢復狀態 → 中獎紀錄不遺失

**連線監控**
- BroadcastChannel 自動重連
- localStorage 作為備援，確保資料不遺失

**衝突處理**
- 單一控制端原則（建議只用一個控制頁）
- 多展示端無限制（可同時開啟多個展示頁籤）

#### 瀏覽器相容性

| 特性 | 支援狀態 | 備註 |
|------|---------|------|
| BroadcastChannel | 現代瀏覽器 | Chrome 54+, Edge 79+, Firefox 38+ |
| localStorage | 所有瀏覽器 | 作為備援方案 |
| 同源限制 | 是 | 必須在相同網域下 |

## 🛠️ 快速開始

### 環境要求
- Node.js 20+
- pnpm 8+

### 安裝與啟動

```bash
# 1. 安裝依賴
pnpm install

# 2. 啟動開發伺服器
pnpm dev

# 3. 開啟瀏覽器
# 訪問 http://localhost:3000/gacha
```

### 構建生產版本

```bash
# 構建
pnpm build

# 啟動生產伺服器
pnpm start
```

## 📖 使用指南

### 第一次使用

1. **準備參與者名單** - 建立 `VIP清單.txt` 和 `一般員工清單.txt`
   ```
   王小明 E001 資訊部
   陳大華 E002 人資部
   林美玲 E003 財務部
   ```

2. **準備獎項清單** - 建立 `獎品清單.txt`
   ```
   頭獎 iPad Pro 1
   二獎 AirPods Pro 2
   三獎 Apple Watch 3
   參加獎 小禮物 20
   ```

3. **匯入資料**
   - 點擊「管理」按鈕
   - 切換到「📋 參與者」頁籤：
     - 輸入分組名稱「VIP組」，上傳 VIP 清單
     - 輸入分組名稱「一般員工」，上傳一般員工清單
     - ⚠️ 分組為必填欄位，可多次上傳不同分組
   - 切換到「🎁 獎項」頁籤：
     - 上傳獎品清單
     - 可選擇性設定「限定分組」（如頭獎限定 VIP 組）

4. **開始抽獎**
   - 關閉管理彈窗
   - **1️⃣ 選擇分組**（必選，如「VIP組」）
   - **2️⃣ 選擇獎項**（自動過濾顯示該分組可用獎項）
   - **3️⃣ 選擇模式**（單次一個 / 全部剩餘）
   - 點擊「開始抽獎」

5. **自訂場景**（選用）
   - 點擊「背景」按鈕開啟設定面板
   - 調整背景圖片位置與縮放
   - 可替換 `/public/GachaBG.png` 為自己的背景圖片

6. **查看結果**
   - 右上角顯示本輪中獎者（含分組標籤）
   - 管理後台「📊 紀錄」可查看所有中獎紀錄
   - 點擊「匯出 CSV」下載中獎名單

### 檔案格式說明

#### 參與者名單 (.txt)
```
姓名 員工編號 部門
```
- 用空格或 Tab 分隔
- 員工編號和部門可省略
- **上傳時必須指定分組名稱**（如「VIP組」、「一般員工」）
- 可多次上傳不同的分組名單
- UTF-8 編碼

#### 獎項清單 (.txt)
```
獎品名稱 數量
```
- 最後一個欄位是數量
- 前面所有欄位為獎品名稱（可包含空格）
- 等級按檔案順序自動生成（第 1 行 = 等級 1）
- **上傳時可選擇限定分組**（選填，如限定「VIP組」才能抽）
- UTF-8 編碼

### 範例檔案

專案已包含範例檔案：
- `/public/sample-participants.txt` - 20 位範例員工
- `/public/sample-prizes.txt` - 8 種範例獎項

## 📁 專案結構

```
kfsyscc_lottery_2026/
├── public/                   # 靜態資源
│   ├── models/               # 3D 模型檔案（GLTF）
│   │   └── gacha_machine.glb
│   ├── *.png                 # 預設背景圖片（OfficeBG, GachaBG）
│   ├── Confetti.json         # Lottie 彩帶動畫
│   ├── sample-participants.txt
│   └── sample-prizes.txt
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # 根佈局（Geist 字體）
│   │   ├── page.tsx          # 首頁（啟動頁面）
│   │   ├── globals.css       # 全局樣式
│   │   ├── start.css         # 首頁動畫
│   │   ├── gacha/            # 前台抽獎頁面
│   │   │   ├── page.tsx
│   │   │   └── loading.css
│   │   └── backstage/        # 後台管理頁面
│   │       └── page.tsx
│   ├── components/           # React 組件（20+ 個）
│   │   ├── ui/               # shadcn/ui 基礎組件
│   │   │   ├── button.tsx
│   │   │   └── dialog.tsx
│   │   ├── Scene.tsx         # 3D 場景容器
│   │   ├── GachaMachine.tsx  # 扭蛋機 3D 模型
│   │   ├── GachaBall.tsx     # 扭蛋球（物理引擎）
│   │   ├── PhysicsContainer.tsx
│   │   ├── Coin.tsx          # 金幣動畫
│   │   ├── FloatingText.tsx
│   │   ├── CameraAnimation.tsx
│   │   ├── LoadingScene.tsx
│   │   ├── WinnerModal.tsx   # 中獎彈窗
│   │   ├── WinnerRecordBoard.tsx  # 中獎看板
│   │   ├── WinnerRecordsList.tsx  # 中獎列表（含備份功能）
│   │   ├── LotteryControlPanel.tsx
│   │   ├── LotterySettings.tsx
│   │   ├── ManagementModal.tsx
│   │   ├── ParticipantList.tsx
│   │   ├── ParticipantUpload.tsx
│   │   ├── PrizeList.tsx
│   │   ├── PrizeUpload.tsx
│   │   ├── ThemeSelector.tsx  # 主題選擇器
│   │   ├── DrawModeButton.tsx
│   │   └── FloatingBackgroundPanel.tsx
│   ├── stores/               # Zustand 狀態管理（5 個 Store）
│   │   ├── useLotteryDataStore.ts      # 抽獎數據
│   │   ├── useLotteryUIStore.ts        # UI 狀態
│   │   ├── useLotterySelectionStore.ts # 選擇狀態
│   │   ├── useThemeStore.ts            # 主題狀態
│   │   └── useBackgroundStore.ts       # 背景配置
│   ├── hooks/                # 自定義 Hooks（5 個）
│   │   ├── useLotteryLogic.ts    # 抽獎邏輯（Fisher-Yates）
│   │   ├── useLotteryRemote.ts   # 跨分頁發送
│   │   ├── useLotteryReceiver.ts # 跨分頁接收
│   │   ├── useStorageSync.ts     # localStorage 同步
│   │   └── useThemeSync.ts       # 主題同步
│   ├── utils/                # 工具函數
│   │   ├── lotteryChannel.ts  # BroadcastChannel（抽獎）
│   │   ├── themeChannel.ts    # BroadcastChannel（主題）
│   │   └── imageStorage.ts    # IndexedDB 圖片存儲
│   ├── types/
│   │   └── lottery.ts         # TypeScript 類型定義
│   ├── config/
│   │   └── gachaConfig.ts     # 扭蛋機參數配置
│   ├── lib/
│   │   └── utils.ts           # cn() 工具函數
│   └── styles/
│       └── themes/            # 主題樣式（4 種）
│           ├── classic.module.css
│           ├── modern.module.css
│           ├── elegant.module.css
│           └── pastel.module.css
├── next.config.ts             # Next.js 配置
├── tailwind.config.ts         # Tailwind CSS 配置
├── tsconfig.json              # TypeScript 配置
├── eslint.config.mjs          # ESLint 配置
├── package.json               # 依賴管理
├── pnpm-lock.yaml
└── CLAUDE.md                  # AI 輔助開發文檔
```

## 🏗️ 系統架構

### 整體架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                    使用者介面層 (UI Layer)                    │
├──────────────────────┬──────────────────────────────────────┤
│  首頁 (/)            │  前台 (/gacha)     │  後台 (/backstage)│
│  - 啟動頁面          │  - 3D 場景         │  - 控制面板       │
│                      │  - 中獎看板        │  - 主題選擇器     │
│                      │  - 接收指令        │  - 背景設定       │
└──────────────────────┴────────────────────┴──────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 狀態管理層 (State Layer)                      │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ LotteryData  │ Selection    │ UI           │ Theme / BG     │
│ - 參與者     │ - 選擇獎項   │ - Modal      │ - 主題設定     │
│ - 獎項       │ - 選擇分組   │ - Loading    │ - 背景配置     │
│ - 中獎紀錄   │ - 抽獎模式   │ - Panel      │                │
└──────────────┴──────────────┴──────────────┴────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   業務邏輯層 (Logic Layer)                    │
├──────────────────────┬──────────────────────────────────────┤
│  抽獎邏輯            │  通訊層                               │
│  - Fisher-Yates     │  - BroadcastChannel (即時)            │
│  - 分組篩選          │  - localStorage (持久化)              │
│  - 防重複中獎        │  - Remote / Receiver Hooks           │
└──────────────────────┴──────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   渲染層 (Render Layer)                       │
├──────────────────────┬──────────────────────────────────────┤
│  3D 渲染 (Three.js)  │  UI 渲染 (React)                      │
│  - 扭蛋機模型        │  - Tailwind CSS                       │
│  - 物理引擎          │  - shadcn/ui                          │
│  - 動畫系統          │  - CSS Modules                        │
└──────────────────────┴──────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   存儲層 (Storage Layer)                      │
├──────────────────────┬──────────────────────────────────────┤
│  localStorage        │  IndexedDB                            │
│  - 5 個 Store 資料   │  - 自訂背景圖片                       │
│  - 自動持久化        │  - 最大 10MB                          │
└──────────────────────┴──────────────────────────────────────┘
```

### 資料流向

#### 前台抽獎流程
```
後台操作 → 執行抽獎邏輯 → 批量寫入 Store → 發送 BroadcastChannel
                                              ↓
前台接收 → 立即寫入 Store → 啟動 3D 動畫 → 逐筆揭露中獎者
                                              ↓
                           所有揭露完成 → 彈出 WinnerModal
```

#### 狀態同步流程
```
任一分頁修改 Store
        ↓
Zustand Persist 自動寫入 localStorage
        ↓
觸發 storage 事件
        ↓
其他分頁監聽到事件 (useStorageSync)
        ↓
自動 rehydrate Store
        ↓
UI 自動更新
```

### 核心模組

| 模組 | 職責 | 主要檔案 |
|------|------|---------|
| **狀態管理** | 全域狀態、持久化 | `stores/*.ts` (5 個 Store) |
| **抽獎邏輯** | Fisher-Yates、驗證 | `hooks/useLotteryLogic.ts` |
| **跨分頁通訊** | 即時同步、指令傳遞 | `utils/*Channel.ts`, `hooks/use*Sync.ts` |
| **3D 渲染** | 場景、模型、動畫 | `components/Scene.tsx`, `components/Gacha*.tsx` |
| **UI 組件** | 控制面板、列表、彈窗 | `components/*.tsx` (20+ 個) |
| **主題系統** | 4 種風格切換 | `styles/themes/*.module.css` |
| **資料存儲** | localStorage + IndexedDB | `utils/imageStorage.ts` |

## 🎨 設計特色

### 技術亮點
- **🚀 效能優化**
  - Next.js 16 App Router + React 19
  - Three.js 0.182 WebGL 渲染
  - Zustand 輕量級狀態管理（5 個模組化 Store）
  - 物理引擎 Rapier 高效碰撞檢測
- **🎨 視覺系統**
  - 4 種主題風格 + CSS Modules 隔離
  - 自訂背景圖片上傳（IndexedDB 存儲）
  - HDR 環境照明 + 即時陰影
  - Lottie 動畫 + 流暢相機運鏡
- **🔄 跨分頁通訊**
  - BroadcastChannel 即時同步
  - localStorage 持久化備援
  - 5 個 Hooks 實現通訊層（Remote + Receiver + Sync）
- **💾 資料管理**
  - localStorage 自動持久化（Zustand Persist）
  - IndexedDB 圖片存儲（支援 10MB）
  - JSON 完整備份（含統計資訊）
  - CSV 匯出（UTF-8 BOM 中文支援）
- **🎯 抽獎演算法**
  - Fisher-Yates Shuffle（數學證明無偏）
  - 分組篩選 + 防重複中獎
  - 完整驗證機制
- **🛡️ 類型安全**
  - TypeScript 5.9.3 嚴格模式
  - 完整類型定義（Participant、Prize、WinnerRecord）
  - ESLint Next.js 官方配置

### UX 設計
- **直覺操作** - 獎項選擇、抽獎模式一目了然
- **即時反饋** - 剩餘名額、中獎人數即時更新
- **透明公開** - 管理介面可隨時查看，避免黑箱作業
- **錯誤預防** - 完整的驗證機制，避免操作錯誤
- **響應式設計** - 適配桌機、平板、手機（建議桌機使用）

## 🚢 部署

### Vercel（推薦）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/kfsyscc_lottery_2026)

### 手動部署

1. 構建專案：`pnpm build`
2. 部署 `.next` 目錄到伺服器
3. 執行：`pnpm start`

詳見 [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)

## 🔧 配置說明

### 動畫參數調整

編輯 `/src/config/gachaConfig.ts` 可調整：
- 金幣下落速度、淡出速度
- 扭蛋機晃動幅度與時間
- 扭蛋顏色配置（10 種顏色）
- 扭蛋球物理參數（彈性、摩擦力、半徑）

### 場景視覺效果調整

編輯 `/src/components/Scene.tsx` 可調整：

**霧效** (line 483):
```typescript
scene.fog = new THREE.Fog("#4a5568", 15, 45); // 顏色、起始距離、結束距離
```

**背景顏色** (line 485):
```typescript
scene.background = new THREE.Color("#000000"); // 黑色背景
```

**浮起動畫速度** (line 218):
```typescript
floatingProgress.current += delta * 0.8; // 數字越大越快
```

**浮起高度與距離** (lines 251-255):
```typescript
setFloatingBallPosition([
  startX - eased * 1.25,  // X 軸移動距離
  startY + eased * 3.5,   // 向上浮起高度
  startZ + eased * 7,     // Z 軸移動距離（往前）
]);
```

**白光強度** (line 260):
```typescript
const newOpacity = Math.min(0.8, flashOpacity + delta * 4); // 最大不透明度 0.8
```

### 背景圖片自訂

替換 `/public/GachaBG.png` 為您的背景圖片：
- 建議尺寸：1536 × 1024 (3:2 比例)
- 支援格式：PNG, JPG
- 透過「背景」按鈕即時調整位置與縮放

### 時間窗口設定

編輯 `/src/components/WinnerRecordBoard.tsx` 第 17 行：
```typescript
const timeWindow = 5000; // 5秒內視為同一輪（毫秒）
```

## 📚 API 參考

### useLotteryLogic Hook

```typescript
const {
  participants,      // 參與者列表（含 group 欄位）
  prizes,           // 獎項列表（含 allowedGroup 欄位）
  winnerRecords,    // 中獎紀錄（含 group 欄位）
  statistics,       // 統計資訊
  validateLottery,  // 驗證函數（支援 selectedGroup 參數）
  drawSingleWinner, // 抽取單人（支援 selectedGroup 參數）
  drawMultipleWinners, // 抽取多人（支援 selectedGroup 參數）
} = useLotteryLogic();

// 抽獎選項
interface DrawOptions {
  skipWinners?: boolean;      // 跳過已中獎者（預設 false）
  selectedGroup?: string;     // 篩選特定分組（選填）
}
```

### useAnimationStore

```typescript
const {
  isAnimating,      // 動畫播放狀態
  setIsAnimating,   // 設置動畫狀態
  participants,     // 參與者（持久化）
  prizes,          // 獎項（持久化）
  winnerRecords,   // 中獎紀錄（持久化）
  addWinnerRecord, // 新增中獎紀錄
  // ... 更多方法
} = useAnimationStore();
```

## 🐛 常見問題

### Q: 3D 場景載入很慢？
A: 扭蛋機模型較大（249k triangles），首次載入需要時間。建議：
- 使用現代瀏覽器（Chrome / Edge）
- 確保網路連線穩定
- 等待加載進度到 100%

### Q: 資料會遺失嗎？
A: 所有資料儲存在瀏覽器的 localStorage，只要不清除瀏覽器資料就不會遺失。建議定期匯出 CSV 備份。

### Q: 可以修改動畫速度嗎？
A: 可以！編輯 `/src/config/gachaConfig.ts` 調整各項動畫參數。

### Q: 支援手機嗎？
A: 支援，但建議使用桌機以獲得最佳體驗（3D 效能、螢幕大小）。

## 📝 開發規範

- 使用 TypeScript 進行類型檢查
- 遵循 ESLint 配置的代碼規範
- 組件使用 `"use client"` 標記客戶端組件
- 使用 Tailwind CSS 進行樣式設計
- 提交前執行 `pnpm lint` 檢查代碼

## 📝 更新日誌

### v26.01.07 (2026-01-07)
- ✅ 新增主題系統（4 種風格：Classic、Modern、Elegant、Pastel）
- ✅ 新增自訂背景圖片上傳功能（IndexedDB 存儲）
- ✅ 新增 JSON 完整備份功能（含統計資訊）
- ✅ 新增清除紀錄前自動下載備份
- ✅ 新增手動下載備份按鈕
- ✅ 新增跳過動畫選項
- ✅ 新增逐筆揭露中獎者動畫
- ✅ 新增抽獎輪次管理（drawSessionId）
- ✅ 優化跨分頁同步機制
- ✅ 優化中獎看板顯示邏輯
- ✅ 完善 TypeScript 類型定義
- ✅ 更新 README.md 文檔

### 未來規劃
- 🔄 整合 MongoDB Atlas 雲端資料庫（選用）
- 🔄 支援匯入 JSON 備份恢復資料
- 🔄 支援自訂音效
- 🔄 支援多語言（英文、日文）
- 🔄 PWA 離線支援

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

建議的貢獻方向：
- 🐛 回報 Bug 或改進建議
- 📖 改善文檔說明
- 🎨 新增主題風格
- 🌐 多語言支援
- ⚡ 效能優化

## 📄 授權

本專案採用 MIT 授權。

## 🙏 致謝

- [PMNDRS](https://pmnd.rs/) - React Three Fiber 生態系統
- [Vercel](https://vercel.com) - Next.js 框架
- [Shadcn](https://ui.shadcn.com) - UI 組件庫

### 3D 模型授權

本專案使用的 Gacha machine 3D 模型基於 [ChesterLin](https://sketchfab.com/ChesterLin) 的作品 "[Gacha machine upload](https://sketchfab.com/3d-models/gacha-machine-upload-c2ff648add1e4062bb16313ce40ab5e3)"，依據 [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/) 許可證授權使用。

---

**🎰 立即開始使用，為您的活動增添科技感與趣味性！**

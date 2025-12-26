# KFSYSCC 3D 扭蛋機抽獎系統 2026

一個專為醫院春酒活動打造的互動式 3D 扭蛋機抽獎系統，結合精美的 3D 動畫與完整的抽獎管理功能。

![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.182-green)

## 📋 專案簡介

這是一個現代化的網頁抽獎應用，使用 3D 圖形技術打造沉浸式的扭蛋機體驗。透過流暢的動畫、直覺的操作介面，以及完整的資料管理功能，為春酒等活動提供專業且有趣的抽獎解決方案。

### 🎯 核心特色

- **🎨 精美 3D 動畫** - 真實感的扭蛋機晃動、金幣投入、扭蛋掉落等動畫效果
- **🎭 場景自訂** - 黑色背景、動態霧效、陰影系統，可自訂背景圖片位置與縮放
- **👥 分組抽獎** - 支援參與者分組（VIP組、一般員工等），獎項可限定特定分組
- **📊 完整資料管理** - 參與者、獎項、中獎紀錄一站式管理
- **📁 批次匯入** - 支援 TXT 檔案快速匯入參與者與獎項（支援多次上傳不同分組）
- **🎁 多獎項抽獎** - 可選擇獎項、單次抽一個或抽全部剩餘名額
- **🔒 防重複中獎** - 自動過濾已中獎者，確保公平性
- **💾 資料持久化** - 自動儲存，重新整理也不會遺失資料
- **📤 CSV 匯出** - 一鍵匯出中獎名單，方便後續整理

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
- ✅ **完整歷史紀錄** - 管理後台查看所有中獎紀錄
  - 表格式顯示（序號、姓名、員工編號、獎品名稱）
  - CSV 匯出功能（UTF-8，支援中文）
  - 清除紀錄功能

### 🎬 3D 動畫系統

#### 完整抽獎流程動畫
1. **金幣投入** - 3D 金幣從投幣口掉落並淡出
2. **扭蛋機晃動** - 多軸旋轉（Z/X 軸）+ Y 軸位移，平滑漸入漸出
3. **扭蛋彈跳** - 機內扭蛋隨機彈跳與旋轉（物理模擬）
4. **扭蛋掉落** - 單顆扭蛋從出口滾出
5. **扭蛋浮起** - 扭蛋緩慢上浮，白光閃爍
6. **顯示中獎者** - 彈窗顯示中獎者資訊

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

### 💾 資料持久化

- 使用 Zustand Persist Middleware + localStorage
- 自動儲存：
  - 參與者名單
  - 獎項設定
  - 中獎紀錄
- 重新整理頁面資料不遺失

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
├── public/
│   ├── models/              # 3D 模型檔案
│   ├── GachaBG.png          # 背景圖片（可自訂替換）
│   ├── sample-participants.txt
│   └── sample-prizes.txt
├── src/
│   ├── app/
│   │   ├── gacha/           # 抽獎頁面
│   │   │   ├── page.tsx     # 主頁面（含 UI 控制、分組選擇）
│   │   │   └── loading.css  # 加載動畫樣式
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Scene.tsx        # 3D 場景主組件（含背景、霧效、陰影）
│   │   ├── GachaMachine.tsx # 扭蛋機模型
│   │   ├── GachaBall.tsx    # 扭蛋球（物理）
│   │   ├── Coin.tsx         # 3D 金幣
│   │   ├── CameraAnimation.tsx
│   │   ├── FloatingText.tsx
│   │   ├── WinnerModal.tsx  # 中獎彈窗（支援單人/多人）
│   │   ├── WinnerRecordBoard.tsx # 本輪中獎顯示（含分組）
│   │   ├── ManagementModal.tsx   # 管理後台彈窗
│   │   ├── ParticipantUpload.tsx # 參與者上傳（含分組輸入）
│   │   ├── ParticipantList.tsx   # 參與者列表（顯示分組）
│   │   ├── PrizeUpload.tsx       # 獎項上傳（可設定分組限制）
│   │   ├── PrizeList.tsx         # 獎項列表（顯示分組限制）
│   │   ├── WinnerRecordsList.tsx # 中獎紀錄列表
│   │   ├── FloatingBackgroundPanel.tsx # 浮動背景設定面板
│   │   └── ui/              # Shadcn UI 組件
│   ├── hooks/
│   │   └── useLotteryLogic.ts # 抽獎邏輯 Hook（支援分組篩選）
│   ├── stores/
│   │   └── useAnimationStore.ts # Zustand Store（含持久化、分組資料）
│   └── config/
│       └── gachaConfig.ts   # 動畫配置參數
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🎨 設計特色

### 技術亮點
- **React Compiler** - 自動優化效能，支援複雜動畫流暢運行
- **物理引擎整合** - 使用 @react-three/rapier 實現真實的扭蛋彈跳效果
- **模組化設計** - 組件獨立可復用，易於維護擴展
- **TypeScript 全覆蓋** - 完整的類型定義，降低錯誤率
- **狀態管理最佳實踐** - Zustand + Persist，簡潔高效

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

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

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

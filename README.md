# KFSYSCC 抽獎系統 2026

一個基於 Next.js 和 Three.js 構建的互動式 3D 扭蛋機抽獎系統。

## 📋 專案簡介

本專案是一個現代化的網頁抽獎應用，使用 3D 圖形技術打造沉浸式的扭蛋機體驗。透過流暢的相機動畫和精美的 3D 模型，為用戶提供獨特的抽獎互動體驗。

## 🚀 技術棧

### 核心框架
- **[Next.js](https://nextjs.org)** 16.1.0 - React 全端框架，使用 App Router
- **[React](https://react.dev)** 19 - UI 框架
- **[TypeScript](https://www.typescriptlang.org)** 5 - 類型安全的 JavaScript

### 3D 圖形
- **[Three.js](https://threejs.org)** 0.182.0 - WebGL 3D 圖形庫
- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber)** 9.4.2 - React 的 Three.js 渲染器
- **[React Three Drei](https://github.com/pmndrs/drei)** 10.7.7 - React Three Fiber 實用工具集

### UI 與樣式
- **[Tailwind CSS](https://tailwindcss.com)** 3.4.19 - 實用優先的 CSS 框架
- **[Tailwind CSS Animate](https://github.com/jamiebuilds/tailwindcss-animate)** 1.0.7 - Tailwind 動畫插件
- **[Radix UI](https://www.radix-ui.com)** - 無樣式的 UI 組件庫
- **[Lucide React](https://lucide.dev)** - 圖標庫
- **[clsx](https://github.com/lukeed/clsx)** + **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - 條件式 className 工具

### 狀態管理
- **[Zustand](https://zustand-demo.pmnd.rs)** 5.0.9 - 輕量級狀態管理

### 開發工具
- **[React Compiler](https://react.dev/learn/react-compiler)** - 自動化 React 性能優化
- **[ESLint](https://eslint.org)** 9 - 程式碼檢查工具
- **pnpm** - 快速、高效的套件管理器

## ✨ 功能特性

### 已實現功能
- ✅ **3D 扭蛋機模型** - 使用 GLTF 格式的精美 3D 模型
- ✅ **流暢相機動畫** - 開場環繞動畫，展示扭蛋機全貌
- ✅ **3D 漂浮文字** - 動態的 3D 文字特效
- ✅ **加載進度系統** - 帶進度條的優雅加載畫面
- ✅ **軌道控制器** - 自由旋轉和縮放 3D 場景
- ✅ **HDR 環境照明** - 真實感的光影效果
- ✅ **響應式設計** - 適配各種屏幕尺寸

### 組件架構
```
src/
├── app/
│   ├── gacha/              # 扭蛋機頁面
│   │   ├── page.tsx        # 頁面主組件（含加載邏輯）
│   │   └── loading.css     # 加載動畫樣式
│   ├── layout.tsx          # 根佈局
│   ├── page.tsx            # 首頁
│   └── globals.css         # 全局樣式
└── components/
    ├── Scene.tsx           # 3D 場景主組件
    ├── CameraAnimation.tsx # 相機動畫組件
    └── FloatingText.tsx    # 3D 漂浮文字組件
```

## 🛠️ 開發指南

### 環境要求
- Node.js 20+
- pnpm 8+

### 安裝依賴

```bash
pnpm install
```

### 啟動開發伺服器

```bash
pnpm dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000) 查看結果。

你可以通過編輯 `src/app/page.tsx` 來修改首頁，文件保存後頁面會自動更新。

### 構建生產版本

```bash
pnpm build
```

### 啟動生產伺服器

```bash
pnpm start
```

### 程式碼檢查

```bash
pnpm lint
```

## 📁 專案結構說明

### 路由架構
- `/` - 起始頁面
- `/gacha` - 扭蛋機主頁面（3D 場景）

### 核心組件

#### Scene.tsx
3D 場景的主要容器，負責：
- Canvas 配置（相機、渲染器設置）
- 環境光照設置（HDR 環境貼圖、補充光源）
- GLTF 模型加載
- 軌道控制器集成

#### CameraAnimation.tsx
相機動畫控制組件，特性：
- 延遲啟動（3.5 秒）
- 環繞運動（360° 旋轉）
- 距離過渡（從遠到近）
- 高度變化（從俯視到平視）
- 平滑緩動函數（easeInOutQuart / easeInOutQuad）

#### FloatingText.tsx
3D 文字組件，支援：
- 自定義文字內容
- 可配置位置、大小、顏色
- 上下漂浮動畫
- 延遲啟動（等待相機動畫完成）

## 🎨 設計特色

- **沉浸式體驗** - 開場動畫引導用戶進入 3D 世界
- **流暢動畫** - 使用緩動函數確保動畫自然平滑
- **真實光影** - HDR 環境照明配合定向光源，呈現真實感
- **性能優化** - React Compiler 自動優化渲染性能
- **模組化設計** - 組件獨立可復用，易於維護擴展

## 📚 相關資源

- [Next.js 文檔](https://nextjs.org/docs) - Next.js 功能和 API
- [React Three Fiber 文檔](https://docs.pmnd.rs/react-three-fiber) - R3F 使用指南
- [Three.js 文檔](https://threejs.org/docs) - Three.js API 參考
- [Tailwind CSS 文檔](https://tailwindcss.com/docs) - 樣式工具類參考

## 🚢 部署

推薦使用 [Vercel](https://vercel.com) 部署 Next.js 應用：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/kfsyscc_lottery_2026)

詳細部署文檔請參考 [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)。

## 📝 開發規範

- 使用 TypeScript 進行類型檢查
- 遵循 ESLint 配置的代碼規範
- 組件使用 `"use client"` 標記客戶端組件
- 使用 Tailwind CSS 進行樣式設計
- 3D 資源（模型、紋理）放置於 `public/models/` 目錄

## 🔧 配置文件

- `next.config.ts` - Next.js 配置（已啟用 React Compiler）
- `tsconfig.json` - TypeScript 配置（路徑別名 `@/*`）
- `tailwind.config.ts` - Tailwind CSS 配置
- `eslint.config.mjs` - ESLint 規則配置

## 📄 授權

本專案採用 MIT 授權。

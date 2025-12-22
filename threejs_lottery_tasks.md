# Three.js 3D 抽獎球機專案任務清單

## 在測試的時候要考量瀏覽器版本的問題

## 一、專案初始化

- [x] 初始化 Next.js 16 專案（App Router）
- [x] 安裝 TypeScript
- [x] 安裝 React Three Fiber 與 Drei
- [x] 安裝 Tailwind CSS 與 Shadcn UI
- [x] 安裝 Zustand 狀態管理
- [x] 建立 Git 倉庫與初始提交
- [x] 確認 Node.js 版本 >= 20

## 二、3D 抽獎球機基礎場景

- [ ] 建立 LotteryScene.tsx
- [ ] 加入基本場景（Scene / Camera / Light）
- [ ] 加入透明球體作為抽獎機外殼
- [ ] 加入多顆小球作為員工代表
- [ ] 實作小球漂浮/亂跳動畫（Fake Physics）
- [ ] 加入環境光與陰影

## 三、狀態管理

- [ ] 設計 LotteryPhase 狀態機（idle / shuffling / focusing / revealing / done）
- [ ] 使用 Zustand 建立 store（phase / winner / startDraw / resetDraw）
- [ ] 將場景動畫與 store 狀態連動

## 四、抽獎流程與動畫

- [ ] 點擊開始抽獎 → phase: shuffling
- [ ] 呼叫 API 決定 winner
- [ ] 小球亂跳動畫中，逐漸聚焦中獎球
- [ ] 中獎球放大、突顯
- [ ] 顯示中獎者姓名與部門
- [ ] phase 切換至 done

## 五、API 串接

- [ ] 設計 `/api/draw` 路由
- [ ] 回傳中獎者資料（id / name / department）
- [ ] 前端抽獎流程整合 API
- [ ] 處理錯誤情況（API 失敗 / 重試）

## 六、UI / 控制面板

- [ ] 設計開始抽獎按鈕
- [ ] 設計重播 / 下一輪按鈕
- [ ] 設計抽獎中 / 已完成狀態提示
- [ ] 行動裝置適配

## 七、音效與特效（加分）

- [ ] 加入抽獎音效（按鈕 / 小球移動 / 中獎）
- [ ] 加入光影效果（Spotlight / Bloom）
- [ ] 小球破裂 / 翻轉動畫
- [ ] 可選煙霧 / 粒子效果

## 八、測試與部署

- [ ] 測試多瀏覽器兼容性（Chrome / Edge / Safari）
- [ ] 測試多設備兼容性（桌機 / 平板 / 手機）
- [ ] 修正動畫延遲與效能問題
- [ ] 部署至內網或可現場展示的環境
- [ ] 撰寫操作手冊（主持人使用）

## 九、額外加分項目

- [ ] 記錄抽獎歷史（log）
- [ ] 防止重複中獎
- [ ] 匯出 CSV / Excel
- [ ] UI 美化（品牌色 / 春酒主題）

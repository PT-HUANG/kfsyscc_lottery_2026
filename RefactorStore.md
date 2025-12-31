# 状态管理重构计划

> 本文档记录了项目的状态管理优化方案，专注于消除 Props Drilling 和按功能分类建立 Zustand Stores

**更新日期**：2025-12-29

---

## 📋 目录

1. [问题分析](#问题分析)
2. [解决方案](#解决方案)
3. [详细实施计划](#详细实施计划)
4. [预期效果](#预期效果)
5. [实施指南](#实施指南)

---

## 问题分析

### 当前最严重的问题

1. **LotteryControlPanel 过度的 Props 传递** ⚠️⚠️⚠️
   - 接收 15+ 个 props
   - 导致组件难以维护和复用
   - 违反单一职责原则

2. **useAnimationStore 职责混乱** ⚠️⚠️
   - 混合了 UI 状态、业务逻辑、数据管理
   - 所有状态被一起持久化（不合理）
   - 订阅者过多，性能问题

3. **背景配置状态分散** ⚠️
   - 在 GachaPage 中管理
   - 通过 props 传递给多个组件

### Props 传递树状图

```
GachaPage
├─ Scene (7 props)
│  ├── onReadyAction
│  ├── selectedPrizeId
│  ├── drawCount
│  ├── selectedGroup
│  ├── backgroundConfig
│  ├── imageRefreshKey
│  └── selectedBackground
│
├─ LotteryControlPanel (15 props) ⚠️ 严重 Props Drilling
│  ├── prizes
│  ├── selectedPrizeId
│  ├── onPrizeIdChange
│  ├── availableGroups
│  ├── selectedGroup
│  ├── onGroupChange
│  ├── drawMode
│  ├── onDrawModeChange
│  ├── getPrizeRemainingSlots
│  ├── filteredPrizes
│  ├── onStartLottery
│  ├── onOpenManagement
│  ├── onToggleBackground
│  ├── isAnimating
│  └── showBgPanel
│
└─ FloatingBackgroundPanel (6 props)
   ├── config
   ├── onChange
   ├── onClose
   ├── onImageUpload
   ├── selectedBackground
   └── onBackgroundChange
```

---

## 解决方案

### 4 个功能分类的 Zustand Stores

#### Store 1: useLotteryUIStore
**职责**：UI 状态管理（模态框、加载状态）

**状态**：
- `showManagement` - 管理面板显示状态
- `showBgPanel` - 背景面板显示状态
- `loading` - 全局加载状态
- `progress` - 加载进度
- `sceneReady` - 场景准备完成状态

**使用场景**：
- GachaPage 管理 UI 显示/隐藏
- 不需要持久化

---

#### Store 2: useLotterySelectionStore
**职责**：抽奖选择状态（奖项、分组、模式）

**状态**：
- `selectedPrizeId` - 当前选中的奖项 ID
- `selectedGroup` - 当前选中的分组
- `drawMode` - 抽奖模式（single | all）

**使用场景**：
- GachaPage、LotteryControlPanel、Scene 共享
- 需要持久化（保存用户选择）

---

#### Store 3: useLotteryDataStore
**职责**：数据管理（参与者、奖项、中奖记录）

**状态**：
- `participants` - 参与者列表
- `prizes` - 奖项列表
- `winnerRecords` - 中奖记录
- `isAnimating` - 抽奖动画进行中
- `showWinnerModal` - 中奖弹窗显示
- `skipWinners` - 防重复中奖设置

**使用场景**：
- 管理后台、抽奖流程共享数据
- 需要持久化到 localStorage

---

#### Store 4: useBackgroundStore
**职责**：背景配置管理

**状态**：
- `config` - 背景位置和缩放配置
- `selectedBackground` - 选中的背景图片
- `imageRefreshKey` - 图片刷新键

**使用场景**：
- Scene、FloatingBackgroundPanel 共享
- 需要持久化（保存用户配置）

---

## 详细实施计划

### Phase 1: 创建新的 Stores（1 小时）

#### 1.1 创建 useLotteryUIStore

**文件**：`src/stores/useLotteryUIStore.ts`

```typescript
import { create } from 'zustand';

interface LotteryUIStore {
  showManagement: boolean;
  openManagement: () => void;
  closeManagement: () => void;

  showBgPanel: boolean;
  openBgPanel: () => void;
  closeBgPanel: () => void;
  toggleBgPanel: () => void;

  loading: boolean;
  setLoading: (loading: boolean) => void;

  progress: number;
  setProgress: (progress: number) => void;

  sceneReady: boolean;
  setSceneReady: (ready: boolean) => void;
}

export const useLotteryUIStore = create<LotteryUIStore>((set) => ({
  showManagement: false,
  openManagement: () => set({ showManagement: true }),
  closeManagement: () => set({ showManagement: false }),

  showBgPanel: false,
  openBgPanel: () => set({ showBgPanel: true }),
  closeBgPanel: () => set({ showBgPanel: false }),
  toggleBgPanel: () => set((state) => ({ showBgPanel: !state.showBgPanel })),

  loading: true,
  setLoading: (loading) => set({ loading }),

  progress: 0,
  setProgress: (progress) => set({ progress }),

  sceneReady: false,
  setSceneReady: (ready) => set({ sceneReady: ready }),
}));
```

---

#### 1.2 创建 useLotterySelectionStore

**文件**：`src/stores/useLotterySelectionStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LotterySelectionStore {
  selectedPrizeId: string;
  setSelectedPrizeId: (id: string) => void;

  selectedGroup: string;
  setSelectedGroup: (group: string) => void;

  drawMode: 'single' | 'all';
  setDrawMode: (mode: 'single' | 'all') => void;

  reset: () => void;
}

export const useLotterySelectionStore = create<LotterySelectionStore>()(
  persist(
    (set) => ({
      selectedPrizeId: '',
      setSelectedPrizeId: (id) => set({ selectedPrizeId: id }),

      selectedGroup: '',
      setSelectedGroup: (group) => set({ selectedGroup: group }),

      drawMode: 'all',
      setDrawMode: (mode) => set({ drawMode: mode }),

      reset: () => set({
        selectedPrizeId: '',
        selectedGroup: '',
        drawMode: 'all',
      }),
    }),
    {
      name: 'lottery-selection',
    }
  )
);
```

---

#### 1.3 创建 useBackgroundStore

**文件**：`src/stores/useBackgroundStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BackgroundConfig {
  positionX: number;
  positionY: number;
  positionZ: number;
  scale: number;
}

interface BackgroundStore {
  config: BackgroundConfig;
  updateConfig: (config: Partial<BackgroundConfig>) => void;
  resetConfig: () => void;

  selectedBackground: string;
  setSelectedBackground: (name: string) => void;

  imageRefreshKey: number;
  refreshImage: () => void;
}

const DEFAULT_CONFIG: BackgroundConfig = {
  positionX: 11,
  positionY: -1,
  positionZ: -67,
  scale: 150,
};

export const useBackgroundStore = create<BackgroundStore>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      updateConfig: (partial) =>
        set((state) => ({
          config: { ...state.config, ...partial }
        })),
      resetConfig: () => set({ config: DEFAULT_CONFIG }),

      selectedBackground: 'OfficeBG',
      setSelectedBackground: (name) => set({ selectedBackground: name }),

      imageRefreshKey: 0,
      refreshImage: () =>
        set((state) => ({
          imageRefreshKey: state.imageRefreshKey + 1
        })),
    }),
    {
      name: 'background-config',
    }
  )
);
```

---

#### 1.4 重构 useLotteryDataStore

**文件**：`src/stores/useLotteryDataStore.ts`

将现有的 `useAnimationStore` 重命名并重构为 `useLotteryDataStore`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 从现有的 useAnimationStore 迁移类型定义
interface Participant {
  id: string;
  name: string;
  group: string;
}

interface Prize {
  id: string;
  name: string;
  level: number;
  quantity: number;
  allowedGroup?: string;
}

interface WinnerRecord {
  recordId: string;
  participantName: string;
  prize: string;
  timestamp: number;
}

interface LotteryDataStore {
  participants: Participant[];
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (id: string) => void;
  clearParticipants: () => void;

  prizes: Prize[];
  setPrizes: (prizes: Prize[]) => void;
  addPrize: (prize: Prize) => void;
  updatePrize: (id: string, prize: Partial<Prize>) => void;
  removePrize: (id: string) => void;
  clearPrizes: () => void;

  winnerRecords: WinnerRecord[];
  addWinnerRecord: (record: Omit<WinnerRecord, 'timestamp' | 'recordId'>) => void;
  clearWinnerRecords: () => void;

  isAnimating: boolean;
  setIsAnimating: (animating: boolean) => void;

  showWinnerModal: boolean;
  setShowWinnerModal: (show: boolean) => void;

  skipWinners: boolean;
  setSkipWinners: (skip: boolean) => void;
}

export const useLotteryDataStore = create<LotteryDataStore>()(
  persist(
    (set) => ({
      // 从现有的 useAnimationStore 迁移逻辑
      participants: [],
      setParticipants: (participants) => set({ participants }),
      addParticipant: (participant) =>
        set((state) => ({
          participants: [...state.participants, participant],
        })),
      removeParticipant: (id) =>
        set((state) => ({
          participants: state.participants.filter((p) => p.id !== id),
        })),
      clearParticipants: () => set({ participants: [] }),

      prizes: [],
      setPrizes: (prizes) => set({ prizes }),
      addPrize: (prize) =>
        set((state) => ({
          prizes: [...state.prizes, prize],
        })),
      updatePrize: (id, updatedPrize) =>
        set((state) => ({
          prizes: state.prizes.map((p) =>
            p.id === id ? { ...p, ...updatedPrize } : p
          ),
        })),
      removePrize: (id) =>
        set((state) => ({
          prizes: state.prizes.filter((p) => p.id !== id),
        })),
      clearPrizes: () => set({ prizes: [] }),

      winnerRecords: [],
      addWinnerRecord: (record) =>
        set((state) => ({
          winnerRecords: [
            ...state.winnerRecords,
            {
              ...record,
              recordId: `record-${Date.now()}`,
              timestamp: Date.now(),
            },
          ],
        })),
      clearWinnerRecords: () => set({ winnerRecords: [] }),

      isAnimating: false,
      setIsAnimating: (animating) => set({ isAnimating: animating }),

      showWinnerModal: false,
      setShowWinnerModal: (show) => set({ showWinnerModal: show }),

      skipWinners: false,
      setSkipWinners: (skip) => set({ skipWinners: skip }),
    }),
    {
      name: 'lottery-data',
    }
  )
);
```

---

### Phase 2: 重构 GachaPage（30 分钟）

#### 重构前

```typescript
export default function GachaPage() {
  // 12 个本地状态
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [showBgPanel, setShowBgPanel] = useState(false);
  const [bgConfig, setBgConfig] = useState({
    positionX: 11,
    positionY: -1,
    positionZ: -67,
    scale: 150,
  });
  const [imageRefreshKey, setImageRefreshKey] = useState(0);
  const [selectedBackground, setSelectedBackground] = useState("OfficeBG");
  const [selectedPrizeId, setSelectedPrizeId] = useState<string>("");
  const [drawMode, setDrawMode] = useState<"single" | "all">("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  // ... 其他逻辑
}
```

#### 重构后

```typescript
import { useLotteryUIStore } from '@/stores/useLotteryUIStore';
import { useLotterySelectionStore } from '@/stores/useLotterySelectionStore';
import { useBackgroundStore } from '@/stores/useBackgroundStore';
import { useLotteryDataStore } from '@/stores/useLotteryDataStore';

export default function GachaPage() {
  // 0 个本地状态，全部使用 Zustand

  // UI 状态
  const { loading, progress, sceneReady, showManagement, showBgPanel } =
    useLotteryUIStore();

  // 抽奖选择
  const { selectedPrizeId, selectedGroup, drawMode } =
    useLotterySelectionStore();

  // 背景配置
  const { config: bgConfig, selectedBackground, imageRefreshKey } =
    useBackgroundStore();

  // 数据和动画
  const { isAnimating, showWinnerModal } = useLotteryDataStore();

  // ... 其他逻辑保持不变
}
```

**改进**：
- ✅ 移除 12 个本地状态
- ✅ 使用 4 个 Zustand stores
- ✅ 代码更清晰，易于理解

---

### Phase 3: 重构 LotteryControlPanel（30 分钟）

#### 重构前

```typescript
// GachaPage 中
<LotteryControlPanel
  prizes={prizes}
  selectedPrizeId={selectedPrizeId}
  onPrizeIdChange={setSelectedPrizeId}
  availableGroups={availableGroups}
  selectedGroup={selectedGroup}
  onGroupChange={setSelectedGroup}
  drawMode={drawMode}
  onDrawModeChange={setDrawMode}
  getPrizeRemainingSlots={getPrizeRemainingSlots}
  filteredPrizes={filteredPrizes}
  onStartLottery={handleStartLottery}
  onOpenManagement={() => setShowManagement(true)}
  onToggleBackground={() => setShowBgPanel(!showBgPanel)}
  isAnimating={isAnimating}
  showBgPanel={showBgPanel}
/>
```

#### 重构后

```typescript
// GachaPage 中 - 无需传递 props
<LotteryControlPanel />

// LotteryControlPanel.tsx 中
import { useLotterySelectionStore } from '@/stores/useLotterySelectionStore';
import { useLotteryDataStore } from '@/stores/useLotteryDataStore';
import { useLotteryUIStore } from '@/stores/useLotteryUIStore';
import { useLotteryLogic } from '@/hooks/useLotteryLogic';

export default function LotteryControlPanel() {
  // 直接从 store 获取
  const {
    selectedPrizeId,
    setSelectedPrizeId,
    selectedGroup,
    setSelectedGroup,
    drawMode,
    setDrawMode,
  } = useLotterySelectionStore();

  const { prizes, isAnimating } = useLotteryDataStore();
  const { openManagement, toggleBgPanel, showBgPanel } = useLotteryUIStore();

  // 使用 useLotteryLogic 获取其他数据
  const { validateLottery, participants } = useLotteryLogic();

  // ... 业务逻辑保持不变
}
```

**改进**：
- ✅ Props 从 15 个减少到 0 个
- ✅ 组件独立，易于测试
- ✅ 无需从父组件接收 callback

---

### Phase 4: 重构 Scene 组件（15 分钟）

#### 重构前

```typescript
<Scene
  onReadyAction={handleSceneReady}
  selectedPrizeId={selectedPrizeId}
  drawCount={drawCount}
  selectedGroup={selectedGroup}
  backgroundConfig={bgConfig}
  imageRefreshKey={imageRefreshKey}
  selectedBackground={selectedBackground}
/>
```

#### 重构后

```typescript
// GachaPage 中
<Scene onReadyAction={handleSceneReady} />

// Scene.tsx 中
import { useLotterySelectionStore } from '@/stores/useLotterySelectionStore';
import { useBackgroundStore } from '@/stores/useBackgroundStore';
import { useLotteryDataStore } from '@/stores/useLotteryDataStore';

export default function Scene({ onReadyAction }: { onReadyAction?: () => void }) {
  const { selectedPrizeId, selectedGroup, drawMode } = useLotterySelectionStore();
  const { config, selectedBackground, imageRefreshKey } = useBackgroundStore();
  const { prizes } = useLotteryDataStore();

  // 计算 drawCount
  const drawCount = useMemo(() => {
    if (!selectedPrizeId) return 1;
    const prize = prizes.find((p) => p.id === selectedPrizeId);
    if (!prize) return 1;

    const remaining = getPrizeRemainingSlots(prize.id);
    return drawMode === 'all' ? remaining : 1;
  }, [selectedPrizeId, drawMode, prizes]);

  // ... 其他逻辑保持不变
}
```

**改进**：
- ✅ Props 从 7 个减少到 1 个
- ✅ 背景配置直接从 store 获取

---

### Phase 5: 重构 FloatingBackgroundPanel（15 分钟）

#### 重构前

```typescript
<FloatingBackgroundPanel
  config={bgConfig}
  onChange={setBgConfig}
  onClose={() => setShowBgPanel(false)}
  onImageUpload={handleImageUpload}
  selectedBackground={selectedBackground}
  onBackgroundChange={setSelectedBackground}
/>
```

#### 重构后

```typescript
// GachaPage 中 - 无需传递 props
<FloatingBackgroundPanel />

// FloatingBackgroundPanel.tsx 中
import { useBackgroundStore } from '@/stores/useBackgroundStore';
import { useLotteryUIStore } from '@/stores/useLotteryUIStore';

export default function FloatingBackgroundPanel() {
  const {
    config,
    updateConfig,
    selectedBackground,
    setSelectedBackground,
    refreshImage,
  } = useBackgroundStore();

  const { closeBgPanel } = useLotteryUIStore();

  const handleChange = (key: keyof BackgroundConfig, value: number) => {
    updateConfig({ [key]: value });
  };

  const handleImageUpload = async () => {
    // ... upload logic
    refreshImage();
  };

  // ... 其他逻辑保持不变
}
```

**改进**：
- ✅ Props 从 6 个减少到 0 个
- ✅ 配置管理更集中

---

### Phase 6: 更新其他组件（15 分钟）

更新以下组件使用新的 store：
- `ManagementModal` - 使用 `useLotteryUIStore`
- `ParticipantUpload` - 使用 `useLotteryDataStore`
- `PrizeList` - 使用 `useLotteryDataStore`
- `WinnerRecordBoard` - 使用 `useLotteryDataStore`

---

### Phase 7: 清理和测试（30 分钟）

1. **删除或重命名旧的 useAnimationStore**
   - 将 `src/stores/useAnimationStore.ts` 重命名为 `useAnimationStore.backup.ts`
   - 或创建兼容层 wrapper

2. **更新所有导入路径**
   - 全局搜索 `useAnimationStore` 并替换为对应的新 store

3. **测试所有功能**
   - 抽奖流程
   - 管理后台
   - 背景配置
   - 中奖记录

4. **验证持久化正常工作**
   - 检查 localStorage
   - 验证数据恢复

---

## 预期效果

### Props 数量对比

| 组件 | 重构前 | 重构后 | 改善 |
|------|--------|--------|------|
| LotteryControlPanel | 15 props | 0 props | ✅ -15 (-100%) |
| Scene | 7 props | 1 prop | ✅ -6 (-86%) |
| FloatingBackgroundPanel | 6 props | 0 props | ✅ -6 (-100%) |
| **总计** | **28 props** | **1 prop** | **✅ -27 (-96%)** |

### 代码改善

- ✅ **消除 props drilling** - 组件间不再需要层层传递状态
- ✅ **组件职责更清晰** - 每个组件只关心自己需要的状态
- ✅ **状态管理集中化** - 按功能分类，易于查找和修改
- ✅ **易于测试和维护** - 组件独立，可单独测试
- ✅ **性能优化** - 选择性订阅，减少不必要的重渲染

### 文件结构

```
src/stores/
├── useLotteryUIStore.ts          # UI 状态
├── useLotterySelectionStore.ts   # 抽奖选择
├── useLotteryDataStore.ts        # 数据管理（重构后的 useAnimationStore）
└── useBackgroundStore.ts         # 背景配置
```

---

## 实施指南

### 关键文件清单

#### 需要创建的文件
- ✨ `src/stores/useLotteryUIStore.ts` (新)
- ✨ `src/stores/useLotterySelectionStore.ts` (新)
- ✨ `src/stores/useBackgroundStore.ts` (新)
- 🔧 `src/stores/useLotteryDataStore.ts` (重构)

#### 需要修改的文件
- 📝 `src/app/gacha/page.tsx` (移除本地状态)
- 📝 `src/components/LotteryControlPanel.tsx` (移除 props)
- 📝 `src/components/Scene.tsx` (移除 props)
- 📝 `src/components/FloatingBackgroundPanel.tsx` (移除 props)
- 📝 `src/components/ManagementModal.tsx` (更新 store 导入)
- 📝 其他使用 `useAnimationStore` 的组件

#### 需要删除/重命名的文件
- ❌ `src/stores/useAnimationStore.ts` → 重命名为 `useLotteryDataStore.ts`

---

### 风险控制

#### 低风险 ✅
- 创建新的 stores（不影响现有功能）
- 逐步迁移组件（可以并存）

#### 中风险 ⚠️
- 重构 `useAnimationStore`（需要仔细迁移持久化逻辑）

#### 缓解措施
- 保持旧的 `useAnimationStore` 作为 wrapper（兼容期）
- 充分测试每个 Phase
- 使用 Git 分支管理
- 每个 Phase 提交一次代码

---

### 实施时间估计

| Phase | 任务 | 时间 |
|-------|------|------|
| Phase 1 | 创建新 Stores | 1 小时 |
| Phase 2 | 重构 GachaPage | 30 分钟 |
| Phase 3 | 重构 LotteryControlPanel | 30 分钟 |
| Phase 4 | 重构 Scene | 15 分钟 |
| Phase 5 | 重构 FloatingBackgroundPanel | 15 分钟 |
| Phase 6 | 更新其他组件 | 15 分钟 |
| Phase 7 | 清理和测试 | 30 分钟 |
| **总计** | | **约 3 小时** |

---

### 测试清单

完成每个 Phase 后，请检查：

- [ ] 抽奖流程正常工作
- [ ] 管理后台可以添加/删除参与者和奖项
- [ ] 背景配置可以保存和恢复
- [ ] 中奖记录正确显示
- [ ] 页面刷新后状态恢复正常
- [ ] 没有 TypeScript 错误
- [ ] 没有 console 错误

---

## 下一步行动

1. **创建 Git 分支**
   ```bash
   git checkout -b refactor/state-management
   ```

2. **按顺序执行 Phase 1-7**
   - 每完成一个 Phase，提交一次代码
   - 运行测试确保功能正常

3. **完成后合并到主分支**
   ```bash
   git checkout main
   git merge refactor/state-management
   ```

---

**准备好开始了吗？建议从 Phase 1 开始！**

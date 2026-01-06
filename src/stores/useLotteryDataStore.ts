import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WinnerRecord {
  id: string; // 參與者 ID
  recordId: string; // 中獎紀錄唯一 ID
  name: string;
  employeeId?: string; // 員工編號
  department?: string; // 部門
  group: string; // 分組（必填）
  prizeId?: string; // 獎項 ID（新版使用，優先）
  prize: string; // 獎項名稱（舊版兼容/備份顯示）
  color: string;
  timestamp: number;
  drawSessionId?: string; // 抽獎輪次 ID（用於區分不同輪的抽獎）
}

export interface Participant {
  id: string;
  name: string;
  employeeId?: string;
  department?: string;
  group: string; // 分組（必填，如：VIP組、一般員工）
}

export interface Prize {
  id: string;
  name: string;
  level: number;
  quantity: number;
  group: string; // 所屬分組（必填）
  isDeleted?: boolean; // 軟刪除標記（不會真正刪除數據）
}

interface LotteryDataStore {
  // Animation states (not persisted)
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;
  toggleAnimation: () => void;

  // Winner announcement state (not persisted)
  isAnnouncingResults: boolean;
  setIsAnnouncingResults: (value: boolean) => void;

  // Winner modal state (not persisted)
  showWinnerModal: boolean;
  setShowWinnerModal: (value: boolean) => void;

  // Draw session state (not persisted)
  currentDrawSessionId: string;
  startNewDrawSession: () => void;
  setCurrentDrawSessionId: (id: string) => void;

  // Lottery settings (persisted)
  skipWinners: boolean; // 是否跳過已中獎者（防重複中獎）
  setSkipWinners: (value: boolean) => void;
  skipAnimation: boolean; // 是否跳過抽獎動畫（直接顯示結果）
  setSkipAnimation: (value: boolean) => void;

  // Winner records (persisted)
  winnerRecords: WinnerRecord[];
  addWinnerRecord: (record: Omit<WinnerRecord, "recordId" | "timestamp" | "drawSessionId"> & Partial<Pick<WinnerRecord, "recordId" | "timestamp" | "drawSessionId">>) => void;
  clearWinnerRecords: () => void;

  // Participants (persisted)
  participants: Participant[];
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (id: string) => void;
  clearParticipants: () => void;

  // Prizes (persisted)
  prizes: Prize[];
  setPrizes: (prizes: Prize[]) => void;
  addPrize: (prize: Prize) => void;
  updatePrize: (id: string, prize: Partial<Prize>) => void;
  removePrize: (id: string) => void;
  clearPrizes: () => void;
}

export const useLotteryDataStore = create<LotteryDataStore>()(
  persist(
    (set) => ({
      // Animation states
      isAnimating: false,
      setIsAnimating: (value) => set({ isAnimating: value }),
      toggleAnimation: () =>
        set((state) => ({ isAnimating: !state.isAnimating })),

      // Winner announcement state
      isAnnouncingResults: false,
      setIsAnnouncingResults: (value) => set({ isAnnouncingResults: value }),

      // Winner modal state
      showWinnerModal: false,
      setShowWinnerModal: (value) => set({ showWinnerModal: value }),

      // Draw session state
      currentDrawSessionId: "",
      startNewDrawSession: () => set({
        currentDrawSessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      }),
      setCurrentDrawSessionId: (id) => set({ currentDrawSessionId: id }),

      // Lottery settings
      skipWinners: true, // 預設啟用防重複中獎
      setSkipWinners: (value) => set({ skipWinners: value }),
      skipAnimation: false, // 預設顯示抽獎動畫
      setSkipAnimation: (value) => set({ skipAnimation: value }),

      // Winner records
      winnerRecords: [],
      addWinnerRecord: (record) =>
        set((state) => {
           const recordId = record.recordId || `${record.id}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
           
           // Check for duplicates by recordId
           if (state.winnerRecords.some(r => r.recordId === recordId)) {
             return state;
           }
           
           return {
            winnerRecords: [
              // 🎯 新記錄插入到陣列開頭（從上方顯示）
              {
                ...record,
                recordId: recordId,
                timestamp: record.timestamp || Date.now(),
                drawSessionId: record.drawSessionId || state.currentDrawSessionId,
              },
              ...state.winnerRecords,
            ],
          };
        }),
      clearWinnerRecords: () => set({ winnerRecords: [] }),

      // Participants
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

      // Prizes
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
          prizes: state.prizes.map((p) =>
            p.id === id ? { ...p, isDeleted: true } : p
          ),
        })),
      clearPrizes: () => set({ prizes: [] }),
    }),
    {
      name: "kfsyscc-lottery-storage", // localStorage key (保持與舊版本相容)
      storage: createJSONStorage(() => localStorage),
      // Only persist data states, not animation/modal states
      partialize: (state) => ({
        skipWinners: state.skipWinners,
        skipAnimation: state.skipAnimation,
        winnerRecords: state.winnerRecords,
        participants: state.participants,
        prizes: state.prizes,
      }),
    }
  )
);

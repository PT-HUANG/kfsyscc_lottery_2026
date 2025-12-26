import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WinnerRecord {
  id: string; // 參與者 ID
  recordId: string; // 中獎紀錄唯一 ID
  name: string;
  employeeId?: string; // 員工編號
  department?: string; // 部門
  group: string; // 分組（必填）
  prize: string;
  color: string;
  timestamp: number;
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
  description?: string;
  allowedGroup?: string; // 限定分組（僅該分組可抽，未設定則所有人可抽）
}

interface AnimationStore {
  // 動畫狀態（不持久化）
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;
  toggleAnimation: () => void;

  // 中獎彈窗狀態（不持久化）
  showWinnerModal: boolean;
  setShowWinnerModal: (value: boolean) => void;

  // 抽獎設定（持久化）
  skipWinners: boolean; // 是否跳過已中獎者（防重複中獎）
  setSkipWinners: (value: boolean) => void;

  // 中獎紀錄（持久化）
  winnerRecords: WinnerRecord[];
  addWinnerRecord: (record: Omit<WinnerRecord, "timestamp" | "recordId">) => void;
  clearWinnerRecords: () => void;

  // 參與者名單（持久化）
  participants: Participant[];
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (id: string) => void;
  clearParticipants: () => void;

  // 獎項設定（持久化）
  prizes: Prize[];
  setPrizes: (prizes: Prize[]) => void;
  addPrize: (prize: Prize) => void;
  updatePrize: (id: string, prize: Partial<Prize>) => void;
  removePrize: (id: string) => void;
  clearPrizes: () => void;
}

export const useAnimationStore = create<AnimationStore>()(
  persist(
    (set) => ({
      // 動畫狀態
      isAnimating: false,
      setIsAnimating: (value) => set({ isAnimating: value }),
      toggleAnimation: () =>
        set((state) => ({ isAnimating: !state.isAnimating })),

      // 中獎彈窗狀態
      showWinnerModal: false,
      setShowWinnerModal: (value) => set({ showWinnerModal: value }),

      // 抽獎設定
      skipWinners: true, // 預設啟用防重複中獎
      setSkipWinners: (value) => set({ skipWinners: value }),

      // 中獎紀錄
      winnerRecords: [],
      addWinnerRecord: (record) =>
        set((state) => ({
          winnerRecords: [
            ...state.winnerRecords,
            {
              ...record,
              recordId: `${record.id}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
              timestamp: Date.now()
            },
          ],
        })),
      clearWinnerRecords: () => set({ winnerRecords: [] }),

      // 參與者名單
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

      // 獎項設定
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
    }),
    {
      name: "kfsyscc-lottery-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // 只持久化需要保存的狀態，動畫狀態不持久化
      partialize: (state) => ({
        skipWinners: state.skipWinners,
        winnerRecords: state.winnerRecords,
        participants: state.participants,
        prizes: state.prizes,
      }),
    }
  )
);

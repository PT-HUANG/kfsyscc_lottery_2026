import { useCallback, useMemo } from "react";
import {
  useLotteryDataStore,
  type Participant,
} from "@/stores/useLotteryDataStore";

export interface LotteryOptions {
  skipWinners?: boolean; // 是否跳過已中獎者
  prizeId?: string; // 獎項 ID
  selectedGroup?: string; // 選擇的分組（如果有，則只有該分組的參與者可以抽獎）
}

export interface LotteryResult {
  winner: Participant | null;
  error?: string;
}

/**
 * 抽獎邏輯 Hook
 * 提供防重複中獎、參與者過濾等功能
 */
export function useLotteryLogic() {
  const participants = useLotteryDataStore((state) => state.participants);
  const winnerRecords = useLotteryDataStore((state) => state.winnerRecords);
  const prizes = useLotteryDataStore((state) => state.prizes);

  /**
   * 獲取已中獎者的參與者 ID 列表
   */
  const winnerParticipantIds = useMemo(() => {
    return new Set(winnerRecords.map((record) => record.id));
  }, [winnerRecords]);

  /**
   * 獲取可用的參與者列表（根據選項過濾）
   */
  const getAvailableParticipants = useCallback(
    (options: LotteryOptions = {}): Participant[] => {
      let available = [...participants];

      // 如果啟用跳過已中獎者，過濾掉已中獎的參與者
      if (options.skipWinners) {
        available = available.filter((p) => !winnerParticipantIds.has(p.id));
      }

      // 如果選擇了特定分組，只保留該分組的參與者
      if (options.selectedGroup) {
        available = available.filter((p) => p.group === options.selectedGroup);
      }

      return available;
    },
    [participants, winnerParticipantIds]
  );

  /**
   * 驗證是否有足夠的參與者可抽獎
   */
  const validateLottery = useCallback(
    (
      requiredCount: number,
      options: LotteryOptions = {}
    ): {
      valid: boolean;
      availableCount: number;
      error?: string;
    } => {
      const available = getAvailableParticipants(options);
      const availableCount = available.length;

      if (participants.length === 0) {
        return {
          valid: false,
          availableCount: 0,
          error: "尚未匯入參與者名單",
        };
      }

      if (availableCount === 0) {
        const errorMsg = options.selectedGroup
          ? `分組「${options.selectedGroup}」的參與者都已中獎\n如果要繼續抽獎請關閉後台「 防重複中獎 」按鈕`
          : "所有參與者都已中獎，無可用名單";
        return {
          valid: false,
          availableCount: 0,
          error: errorMsg,
        };
      }

      if (availableCount < requiredCount) {
        return {
          valid: false,
          availableCount,
          error: `可用參與者不足：需要 ${requiredCount} 人，但只剩 ${availableCount} 人`,
        };
      }

      return {
        valid: true,
        availableCount,
      };
    },
    [participants, getAvailableParticipants]
  );

  /**
   * 執行抽獎（抽取單一中獎者）
   */
  const drawSingleWinner = useCallback(
    (options: LotteryOptions = {}): LotteryResult => {
      const validation = validateLottery(1, options);

      if (!validation.valid) {
        return {
          winner: null,
          error: validation.error,
        };
      }

      const available = getAvailableParticipants(options);

      // 隨機選擇一位參與者
      const randomIndex = Math.floor(Math.random() * available.length);
      const winner = available[randomIndex];

      return {
        winner,
      };
    },
    [validateLottery, getAvailableParticipants]
  );

  /**
   * 執行抽獎（抽取多位中獎者）
   */
  const drawMultipleWinners = useCallback(
    (
      count: number,
      options: LotteryOptions = {}
    ): {
      winners: Participant[];
      error?: string;
    } => {
      const validation = validateLottery(count, options);

      if (!validation.valid) {
        return {
          winners: [],
          error: validation.error,
        };
      }

      const available = getAvailableParticipants(options);

      // 使用 Fisher-Yates 演算法隨機抽取 n 位參與者
      const shuffled = [...available];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      const winners = shuffled.slice(0, count);

      return {
        winners,
      };
    },
    [validateLottery, getAvailableParticipants]
  );

  /**
   * 根據獎項抽獎
   */
  const drawByPrize = useCallback(
    (
      prizeId: string,
      options: Omit<LotteryOptions, "prizeId"> = {}
    ): {
      winners: Participant[];
      prizeName: string;
      error?: string;
    } => {
      const prize = prizes.find((p) => p.id === prizeId);

      if (!prize) {
        return {
          winners: [],
          prizeName: "",
          error: "找不到指定的獎項",
        };
      }

      // 使用獎品的分組設定（group 現在是必填）
      const finalOptions = { ...options, prizeId };
      if (prize.group) {
        finalOptions.selectedGroup = prize.group;
      }

      const result = drawMultipleWinners(prize.quantity, finalOptions);

      // 如果因為分組限制導致參與者不足，提供更詳細的錯誤訊息
      if (result.error && prize.group) {
        result.error = `此獎項限定「${prize.group}」分組。${result.error}`;
      }

      return {
        ...result,
        prizeName: prize.name,
      };
    },
    [prizes, drawMultipleWinners]
  );

  /**
   * 獲取統計資訊
   */
  const statistics = useMemo(() => {
    const totalParticipants = participants.length;
    const totalWinners = winnerParticipantIds.size;
    const availableParticipants = totalParticipants - totalWinners;
    const totalPrizeSlots = prizes.reduce((sum, p) => sum + p.quantity, 0);

    return {
      totalParticipants,
      totalWinners,
      availableParticipants,
      totalPrizeSlots,
      allDrawn: availableParticipants === 0 && totalParticipants > 0,
    };
  }, [participants, winnerParticipantIds, prizes]);

  return {
    // 資料
    participants,
    winnerRecords,
    prizes,
    statistics,

    // 函數
    getAvailableParticipants,
    validateLottery,
    drawSingleWinner,
    drawMultipleWinners,
    drawByPrize,
  };
}

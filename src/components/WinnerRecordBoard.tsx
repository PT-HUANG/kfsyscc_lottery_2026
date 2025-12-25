"use client";

import { useAnimationStore } from "@/stores/useAnimationStore";
import { useMemo } from "react";

export default function WinnerRecordBoard() {
  const winnerRecords = useAnimationStore((state) => state.winnerRecords);

  // 只顯示最近一輪抽獎的中獎者
  const latestRoundRecords = useMemo(() => {
    if (winnerRecords.length === 0) return [];

    // 找出最新的時間戳
    const latestTimestamp = Math.max(...winnerRecords.map((r) => r.timestamp));

    // 找出與最新時間戳相近的所有紀錄（5秒內視為同一輪）
    const timeWindow = 5000; // 5秒
    return winnerRecords.filter(
      (record) => latestTimestamp - record.timestamp < timeWindow
    );
  }, [winnerRecords]);

  if (latestRoundRecords.length === 0) {
    return null;
  }

  // 取得獎項名稱（假設同一輪都是同一個獎項）
  const currentPrize = latestRoundRecords[0]?.prize || "";

  return (
    <div className="w-[20vw] min-w-[280px] max-h-[60vh] overflow-y-auto bg-white/95 rounded-xl p-4 shadow-lg backdrop-blur-sm">
      {/* 標題 */}
      <div className="mb-3 border-b-2 border-gray-200 pb-2">
        <h3 className="text-lg font-bold text-gray-800">🏆 本輪中獎</h3>
        <div className="text-sm text-purple-600 font-semibold mt-1">
          {currentPrize}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          共 {latestRoundRecords.length} 位中獎者
        </div>
      </div>

      {/* 記錄列表 */}
      <div className="flex flex-col gap-2">
        {latestRoundRecords.map((record, index) => (
          <div
            key={`${record.id}-${record.timestamp}`}
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 transition-all hover:shadow-md border border-purple-100"
          >
            {/* 序號和姓名 */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-purple-600">
                #{index + 1}
              </span>
              <div className="flex-1 text-base font-bold text-gray-800 flex justify-between max-w-[200px]">
                  <span className="pr-2">{record.name}</span>
                  <span>員編：{record.employeeId}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

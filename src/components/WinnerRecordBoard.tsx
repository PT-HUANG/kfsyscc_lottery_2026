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
    <div className="overflow-y-auto bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 rounded-lg p-4 shadow-[0_8px_30px_rgba(168,85,247,0.2)] backdrop-blur-sm border-2 border-amber-400">
      {/* 標題 */}
      <div className="mb-3 border-b-2 border-amber-300 pb-2">
        <h3 className="text-lg font-bold text-amber-900">本輪中獎</h3>
        <div className="text-sm text-amber-800 font-semibold mt-1">
          {currentPrize}
        </div>
        <div className="text-xs text-amber-700 mt-1">
          共 {latestRoundRecords.length} 位中獎者
        </div>
      </div>

      {/* 記錄列表 */}
      <div className="flex flex-col gap-2">
        {latestRoundRecords.map((record, index) => (
          <div
            key={`${record.id}-${record.timestamp}`}
            className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg p-3 transition-all hover:shadow-md border border-amber-300"
          >
            {/* 序號和姓名 */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-amber-700">
                #{index + 1}
              </span>
              <div className="flex-1 text-base font-bold text-gray-800 flex justify-between max-w-[200px]">
                <span className="px-2">{record.name}</span>
                <>
                  <span className="hidden xl:inline">
                    員編：{record.employeeId}
                  </span>
                  <span className="xl:hidden">{record.employeeId}</span>
                </>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

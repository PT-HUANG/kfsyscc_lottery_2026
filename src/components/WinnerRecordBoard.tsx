"use client";

import { useAnimationStore } from "@/stores/useAnimationStore";

export default function WinnerRecordBoard() {
  const winnerRecords = useAnimationStore((state) => state.winnerRecords);

  if (winnerRecords.length === 0) {
    return null;
  }

  return (
    <div className="w-[20vw] min-w-[280px] max-h-[80vh] overflow-y-auto bg-white/95 rounded-xl p-4 shadow-lg backdrop-blur-sm">
      {/* 標題 */}
      <h3 className="text-lg font-bold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">
        🏆 中獎記錄
      </h3>

      {/* 記錄列表 */}
      <div className="flex flex-col gap-2">
        {winnerRecords.map((record, index) => (
          <div
            key={record.timestamp}
            className="bg-gray-50 rounded-lg p-3 transition-all hover:bg-gray-100"
          >
            {/* 序號和姓名 */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-bold text-gray-600">
                #{winnerRecords.length - index}
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {record.name}
              </span>
            </div>

            {/* 獎項 */}
            <div className="text-xs text-gray-600 mb-1">
              {record.prize}
            </div>

            {/* 編號和時間 */}
            <div className="text-[10px] text-gray-400">
              {record.id} • {new Date(record.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useLotteryDataStore } from "@/stores/useLotteryDataStore";
import { useMemo } from "react";

export default function WinnerRecordBoard() {
  const winnerRecords = useLotteryDataStore((state) => state.winnerRecords);
  const prizes = useLotteryDataStore((state) => state.prizes);
  const currentDrawSessionId = useLotteryDataStore(
    (state) => state.currentDrawSessionId
  );

  // 🎯 只顯示本輪中獎者（根據 drawSessionId 過濾）
  const latestRoundRecords = useMemo(() => {
    if (!currentDrawSessionId) return [];
    return winnerRecords.filter(
      (record) => record.drawSessionId === currentDrawSessionId
    );
  }, [winnerRecords, currentDrawSessionId]);

  // 🎯 取得最新時間戳，判斷記錄是否為新加入的
  const latestTimestamp = useMemo(() => {
    if (latestRoundRecords.length === 0) return 0;
    return Math.max(...latestRoundRecords.map((r) => r.timestamp));
  }, [latestRoundRecords]);

  const isRecordNew = (timestamp: number) => {
    // 與最新記錄的時間差小於 800ms 視為新記錄
    return latestTimestamp - timestamp < 800;
  };

  if (latestRoundRecords.length === 0) {
    return null;
  }

  // 取得獎項名稱和分組（假設同一輪都是同一個獎項和分組）
  const firstRecord = latestRoundRecords[0];
  const prize = firstRecord?.prizeId
    ? prizes.find((p) => p.id === firstRecord.prizeId)
    : null;
  const currentPrize = prize?.name || firstRecord?.prize || "";
  const currentGroup = firstRecord?.group || "";

  return (
    <>
      {/* 🎨 CSS 動畫定義 */}
      <style jsx>{`
        @keyframes fadeInSlideLeft {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-entry {
          animation: fadeInSlideLeft 0.5s ease-out forwards;
        }
        .highlight-new {
          box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.4);
        }
        @keyframes shine-sweep {
          0% {
            background-position: 150% center;
          }
          100% {
            background-position: -150% center;
          }
        }
        .shine-effect {
          background: linear-gradient(
            135deg,
            #dc2626 0%,
            #dc2626 40%,
            #ffffff 50%,
            #dc2626 60%,
            #dc2626 100%
          );
          background-size: 300% 100%;
          animation: shine-sweep 6s linear infinite;
        }

        /* 滾動條樣式 */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.6);
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.8);
        }
      `}</style>

      <div className="max-h-[97vh] overflow-y-auto bg-yellow-50 rounded-xl p-5 shadow-[0_8px_30px_rgba(230,57,70,0.25)] backdrop-blur-sm border-2 border-amber-400">
        {/* 標題區域 - 重新設計 */}
        <div className="mb-5 pb-4 border-b border-orange-300/50 bg-gradient-to-b from-orange-100/40 to-transparent -mx-5 -mt-5 px-5 pt-5 rounded-t-xl">
          {/* 次要標題 */}
          <div className="text-xl font-bold text-orange-700 m-1 pb-2">
            本輪中獎
          </div>

          {/* 獎項名稱 - 主視覺焦點 */}
          <div className="flex justify-center">
            <h2 className="w-[80%] text-center text-2xl font-black text-white mb-4 tracking-tight px-6 py-3 rounded-lg inline-block shine-effect shadow-lg">
              {currentPrize}
            </h2>
          </div>

          {/* 輔助資訊列 - 統一收納 */}
          <div className="flex flex-wrap items-center gap-3 text-lg">
            {currentGroup && (
              <div className="inline-flex items-center gap-2">
                <span className="text-orange-700 font-medium">組別</span>
                <div className="px-4 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-base text-amber-900 font-semibold rounded border border-amber-300 shadow-sm">
                  {currentGroup}
                </div>
              </div>
            )}
            <div className="inline-flex items-center gap-1.5 text-orange-700">
              <span className="font-medium">共</span>
              <span className="font-bold text-red-700">
                {latestRoundRecords.length}
              </span>
              <span className="font-medium">位中獎</span>
            </div>
          </div>
        </div>

        {/* 記錄列表 - 去邊框化設計 */}
        <div className="flex flex-col gap-2.5">
          {latestRoundRecords.map((record, index) => {
            const isNew = isRecordNew(record.timestamp);
            return (
              <div
                key={record.recordId}
                className={`border-2 border-orange-300 bg-gradient-to-r from-orange-50 via-yellow-50 to-amber-50 backdrop-blur-sm rounded-lg p-3 transition-all duration-300 hover:shadow-md hover:scale-[1.01] shadow-sm ${
                  isNew ? "animate-entry" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* 序號 - 細線條圓圈 */}
                  <div className="flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">
                        {String(latestRoundRecords.length - index).padStart(
                          2,
                          "0"
                        )}
                      </span>
                    </div>
                  </div>

                  {/* 中獎者資訊 */}
                  <div className="flex-1 min-w-0">
                    {/* 姓名 */}
                    <div className="text-base font-bold text-red-900 mb-1 truncate">
                      {record.name}
                    </div>

                    {/* 標籤 - 低飽和度設計 */}
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {record.employeeId && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-amber-800 rounded font-medium border border-yellow-300">
                          員編：{record.employeeId}
                        </span>
                      )}
                      {record.department && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-amber-800 rounded font-medium border border-yellow-300">
                          {record.department}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部淡出效果提示 */}
        <div className="h-4 bg-gradient-to-t from-orange-50 to-transparent -mx-5 -mb-5 mt-2 rounded-b-xl pointer-events-none" />
      </div>
    </>
  );
}

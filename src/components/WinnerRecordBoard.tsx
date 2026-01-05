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

      <div className="max-h-[93vh] overflow-y-auto custom-scrollbar bg-yellow-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-[0_8px_30px_rgba(230,57,70,0.25)] backdrop-blur-sm border-2 border-amber-400">
        {/* 標題區域 - 重新設計 */}
        <div className="mb-3 sm:mb-4 lg:mb-5 pb-3 sm:pb-4 border-b border-orange-300/50 bg-gradient-to-b from-orange-100/40 to-transparent -mx-3 sm:-mx-4 lg:-mx-5 -mt-3 sm:-mt-4 lg:-mt-5 px-3 sm:px-4 lg:px-5 pt-3 sm:pt-4 lg:pt-5 rounded-t-lg sm:rounded-t-xl">
          {/* 次要標題 */}
          <div className="text-base sm:text-lg lg:text-xl font-bold text-orange-700 m-1 pb-1.5 sm:pb-2">
            本輪中獎
          </div>

          {/* 獎項名稱 - 主視覺焦點 */}
          <div className="flex justify-center">
            <h2 className="w-[90%] sm:w-[85%] xl:w-[90%] text-center text-lg sm:text-xl lg:text-2xl font-black text-white mb-3 sm:mb-4 tracking-tight px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg inline-block shine-effect shadow-lg">
              {currentPrize}
            </h2>
          </div>

          {/* 輔助資訊列 - 統一收納 */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 lg:gap-3 text-sm sm:text-base lg:text-lg">
            {currentGroup && (
              <div className="inline-flex items-center gap-1.5 sm:gap-2">
                <span className="text-orange-700 font-medium">組別</span>
                <div className="px-2.5 sm:px-3 lg:px-4 py-0.5 sm:py-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-xs sm:text-sm lg:text-base text-amber-900 font-semibold rounded border border-amber-300 shadow-sm">
                  {currentGroup}
                </div>
              </div>
            )}
            <div className="inline-flex items-center gap-1 sm:gap-1.5 text-orange-700">
              <span className="font-medium">共</span>
              <span className="font-bold text-red-700">
                {latestRoundRecords.length}
              </span>
              <span className="font-medium">位中獎</span>
            </div>
          </div>
        </div>

        {/* 記錄列表 - 去邊框化設計 */}
        <div className="flex flex-col gap-2 sm:gap-2.5">
          {latestRoundRecords.map((record, index) => {
            const isNew = isRecordNew(record.timestamp);
            return (
              <div
                key={record.recordId}
                className={`border-2 border-orange-300 bg-gradient-to-r from-orange-50 via-yellow-50 to-amber-50 backdrop-blur-sm rounded-lg p-2.5 sm:p-3 transition-all duration-300 hover:shadow-md hover:scale-[1.01] shadow-sm ${
                  isNew ? "animate-entry" : ""
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
                  {/* 序號 - 細線條圓圈 */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-xs sm:text-sm">
                        {String(latestRoundRecords.length - index).padStart(
                          2,
                          "0"
                        )}
                      </span>
                    </div>
                  </div>

                  {/* 中獎者資訊 */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1 sm:gap-1.5">
                    {/* 姓名 */}
                    <div className="text-sm sm:text-base lg:text-lg font-bold text-red-900 truncate">
                      {record.name}
                    </div>

                    {/* 標籤 - 低飽和度設計 */}
                    <div className="flex flex-wrap gap-1 sm:gap-1.5 text-xs lg:text-base">
                      {record.employeeId && (
                        <span className="px-1.5 sm:px-2 py-0.5 bg-yellow-100 text-amber-800 rounded font-medium border border-yellow-300">
                          {record.employeeId}
                        </span>
                      )}
                      {record.department && (
                        <span className="px-1.5 sm:px-2 py-0.5 bg-yellow-100 text-amber-800 rounded font-medium border border-yellow-300">
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
      </div>
    </>
  );
}

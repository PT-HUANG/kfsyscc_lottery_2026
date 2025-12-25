"use client";

import { useState } from "react";
import { useLotteryLogic } from "@/hooks/useLotteryLogic";

export default function LotterySettings() {
  const {
    statistics,
    validateLottery,
    drawSingleWinner,
    prizes,
  } = useLotteryLogic();

  const [skipWinners, setSkipWinners] = useState(true);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestDraw = () => {
    const result = drawSingleWinner({ skipWinners });

    if (result.error) {
      setTestResult(`❌ ${result.error}`);
    } else if (result.winner) {
      setTestResult(
        `✅ 抽到：${result.winner.name} (ID: ${result.winner.id})`
      );
    } else {
      setTestResult("❌ 抽獎失敗");
    }

    // 3秒後清除測試結果
    setTimeout(() => setTestResult(null), 3000);
  };

  const handleValidate = (count: number) => {
    const validation = validateLottery(count, { skipWinners });

    if (validation.valid) {
      alert(`✅ 驗證通過！\n可用參與者：${validation.availableCount} 人`);
    } else {
      alert(`❌ 驗證失敗\n${validation.error}`);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 統計資訊 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 mb-1">總參與者</div>
          <div className="text-2xl font-bold text-blue-700">
            {statistics.totalParticipants}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 mb-1">已中獎</div>
          <div className="text-2xl font-bold text-green-700">
            {statistics.totalWinners}
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600 mb-1">可抽獎</div>
          <div className="text-2xl font-bold text-purple-700">
            {statistics.availableParticipants}
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-sm text-orange-600 mb-1">總獎項名額</div>
          <div className="text-2xl font-bold text-orange-700">
            {statistics.totalPrizeSlots}
          </div>
        </div>
      </div>

      {/* 抽獎設定 */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
        <h4 className="font-semibold text-gray-800">抽獎規則設定</h4>

        {/* 防重複中獎開關 */}
        <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
          <div>
            <div className="font-medium text-gray-800">
              防重複中獎
            </div>
            <div className="text-sm text-gray-500">
              啟用後，已中獎者不會再被抽中
            </div>
          </div>
          <button
            onClick={() => setSkipWinners(!skipWinners)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${skipWinners ? "bg-blue-500" : "bg-gray-300"}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${skipWinners ? "translate-x-6" : "translate-x-1"}
              `}
            />
          </button>
        </div>

        {/* 狀態提示 */}
        {statistics.allDrawn && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-start gap-2">
              <span className="text-yellow-500">⚠️</span>
              <div className="text-sm text-yellow-800">
                所有參與者都已中獎！請匯入新的參與者或清除中獎紀錄後再繼續抽獎。
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 測試抽獎 */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
        <h4 className="font-semibold text-gray-800">測試抽獎功能</h4>

        <div className="flex gap-2">
          <button
            onClick={handleTestDraw}
            disabled={statistics.totalParticipants === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            🎲 測試抽獎 (單人)
          </button>

          <button
            onClick={() => handleValidate(1)}
            disabled={statistics.totalParticipants === 0}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            ✓ 驗證 1 人
          </button>

          <button
            onClick={() => handleValidate(10)}
            disabled={statistics.totalParticipants === 0}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            ✓ 驗證 10 人
          </button>
        </div>

        {testResult && (
          <div className="p-3 bg-white border border-gray-200 rounded">
            <div className="text-sm font-medium">{testResult}</div>
          </div>
        )}
      </div>

      {/* 獎項抽獎驗證 */}
      {prizes.length > 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
          <h4 className="font-semibold text-gray-800">依獎項驗證</h4>

          <div className="space-y-2">
            {prizes
              .sort((a, b) => a.level - b.level)
              .map((prize) => {
                const validation = validateLottery(prize.quantity, {
                  skipWinners,
                });
                const isValid = validation.valid;

                return (
                  <div
                    key={prize.id}
                    className={`p-3 rounded border ${
                      isValid
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-800">
                          {prize.name}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          (需要 {prize.quantity} 人)
                        </span>
                      </div>
                      <div className="text-right">
                        {isValid ? (
                          <span className="text-green-600 text-sm">
                            ✓ 可抽獎
                          </span>
                        ) : (
                          <span className="text-red-600 text-sm">
                            ✗ {validation.error}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

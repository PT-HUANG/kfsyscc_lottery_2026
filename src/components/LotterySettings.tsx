"use client";

import { useState } from "react";
import { useLotteryLogic } from "@/hooks/useLotteryLogic";
import { useLotteryDataStore } from "@/stores/useLotteryDataStore";

export default function LotterySettings() {
  const {
    statistics,
    validateLottery,
    drawSingleWinner,
    drawMultipleWinners,
    prizes,
    getAvailableParticipants,
  } = useLotteryLogic();

  // 使用全域狀態，而不是本地狀態
  const skipWinners = useLotteryDataStore((state) => state.skipWinners);
  const setSkipWinners = useLotteryDataStore((state) => state.setSkipWinners);
  const participants = useLotteryDataStore((state) => state.participants);

  const [testResult, setTestResult] = useState<string | null>(null);
  const [testMode, setTestMode] = useState<"single" | "multiple">("single"); // 測試模式
  const [testCount, setTestCount] = useState<number>(1); // 測試人數（多人模式）
  const [selectedTestGroup, setSelectedTestGroup] = useState<string>(""); // 測試用分組選擇

  // 獲取所有可用的分組（去重並排序）
  const availableGroups = Array.from(
    new Set(participants.map((p) => p.group))
  ).sort();

  const handleTestDraw = () => {
    // 建立抽獎選項，包含分組
    const lotteryOptions = {
      skipWinners,
      selectedGroup: selectedTestGroup || undefined, // 空字串轉為 undefined
    };

    if (testMode === "single") {
      // 單人測試
      const result = drawSingleWinner(lotteryOptions);

      if (result.error) {
        setTestResult(`❌ 失敗：${result.error}`);
      } else if (result.winner) {
        setTestResult(
          `✅ 抽到：${result.winner.name}${
            result.winner.employeeId
              ? ` (員編：${result.winner.employeeId})`
              : ` (ID: ${result.winner.id})`
          }\n分組：${result.winner.group}`
        );
      } else {
        setTestResult("❌ 抽獎失敗");
      }
    } else {
      // 多人測試 - 實際執行抽獎並顯示員工資訊
      const result = drawMultipleWinners(testCount, lotteryOptions);

      if (result.error) {
        setTestResult(`❌ 失敗：${result.error}`);
      } else if (result.winners && result.winners.length > 0) {
        const winnersList = result.winners
          .map(
            (winner, index) =>
              `${index + 1}. ${winner.name}${
                winner.employeeId
                  ? ` (員編：${winner.employeeId})`
                  : ` (ID: ${winner.id})`
              } [${winner.group}]`
          )
          .join("\n");
        setTestResult(
          `✅ 成功抽取 ${result.winners.length} 人：\n\n${winnersList}`
        );
      } else {
        setTestResult("❌ 抽獎失敗");
      }
    }

    // 5秒後清除測試結果（多人模式資訊較多，需要更長時間閱讀）
    setTimeout(() => setTestResult(null), 5000);
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
            <div className="font-medium text-gray-800">防重複中獎</div>
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
        {statistics.allDrawn && skipWinners && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-start gap-2">
              <span className="text-yellow-500">⚠️</span>
              <div className="text-sm text-yellow-800">
                所有參與者都已中獎！請匯入新的參與者或關閉防重複中獎按鈕
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 測試抽獎 */}
      {availableGroups.length > 0 && (
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg space-y-4">
          <h4 className="font-bold text-blue-900 flex items-center gap-2">
            抽獎功能測試
          </h4>

          {/* 測試執行區 */}
          <div className="bg-white p-4 rounded-lg border border-blue-200 space-y-4">
            {/* 步驟 1: 選擇分組 */}
            <div className="space-y-2">
              <label
                htmlFor="testGroup"
                className="block text-sm font-medium text-blue-900"
              >
                步驟 1：選擇分組 <span className="text-red-500">*</span>
              </label>
              <select
                id="testGroup"
                value={selectedTestGroup}
                onChange={(e) => setSelectedTestGroup(e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                <option value="">請選擇分組</option>
                {availableGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
              {selectedTestGroup && (
                <p className="text-xs text-blue-700">
                  已選擇：
                  <span className="font-semibold">{selectedTestGroup}</span> ｜
                  可用人數：
                  <span className="font-semibold text-blue-800">
                    {
                      getAvailableParticipants({
                        skipWinners,
                        selectedGroup: selectedTestGroup,
                      }).length
                    }
                  </span>{" "}
                  人
                </p>
              )}
            </div>
            {/* 步驟 2: 模式選擇 */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-blue-900">
                步驟 2：選擇測試模式
              </div>
              <div className="flex gap-3 pb-3 border-b border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="testMode"
                    value="single"
                    checked={testMode === "single"}
                    onChange={(e) =>
                      setTestMode(e.target.value as "single" | "multiple")
                    }
                    className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    單人（隨機抽出一位中獎者）
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="testMode"
                    value="multiple"
                    checked={testMode === "multiple"}
                    onChange={(e) =>
                      setTestMode(e.target.value as "single" | "multiple")
                    }
                    className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    多人（一次抽出多位中獎者）
                  </span>
                </label>
              </div>
            </div>

            {/* 步驟 3: 執行測試 */}
            <div className="space-y-4">
              {testMode === "single" ? (
                // 單人模式
                <>
                  <div className="text-sm font-medium text-blue-900">
                    步驟 3：開始測試
                  </div>
                  <p className="text-sm text-gray-600">
                    從所選分組中快速抽取 1 位參與者，確認抽獎功能正常運作
                  </p>
                  <button
                    onClick={handleTestDraw}
                    disabled={
                      !selectedTestGroup || statistics.totalParticipants === 0
                    }
                    className="w-[200px] px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
                    title={!selectedTestGroup ? "請先選擇分組" : "開始測試抽獎"}
                  >
                    開始測試抽獎
                  </button>
                </>
              ) : (
                // 多人模式
                <>
                  <div className="text-sm font-medium text-blue-900">
                    步驟 3：設定人數並測試
                  </div>
                  <p className="text-sm text-gray-600">
                    從所選分組中測試抽取多位參與者，實際執行抽獎並顯示員工資訊
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      測試人數：
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={testCount}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        setTestCount(Math.max(1, Math.min(100, value)));
                      }}
                      disabled={
                        !selectedTestGroup || statistics.totalParticipants === 0
                      }
                      className="w-13 pl-3 p-1 border-2 border-gray-300 rounded-lg text-center font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm text-gray-600">人（1-100）</span>
                  </div>
                  <button
                    onClick={handleTestDraw}
                    disabled={
                      !selectedTestGroup || statistics.totalParticipants === 0
                    }
                    className="w-[200px] px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
                    title={!selectedTestGroup ? "請先選擇分組" : "開始測試抽獎"}
                  >
                    開始測試抽獎
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 測試結果 */}
          {testResult && (
            <div className="p-3 bg-white border-2 border-blue-300 rounded-lg shadow-sm">
              <div className="text-sm font-medium text-gray-800 whitespace-pre-line">
                {testResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 獎項抽獎驗證 */}
      {prizes.length > 0 && (
        <div className="p-4 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 border border-amber-300 rounded-lg space-y-4">
          <h4 className="font-semibold text-amber-900">依獎項驗證</h4>

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
                        ? "bg-gradient-to-br from-yellow-100 to-amber-100 border-amber-300"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-amber-900">
                          {prize.name}
                        </span>
                        <span className="ml-2 text-sm text-amber-800">
                          (需要 {prize.quantity} 人)
                        </span>
                      </div>
                      <div className="text-right">
                        {isValid ? (
                          <span className="text-amber-900 text-sm">可抽獎</span>
                        ) : (
                          <span className="text-red-600 text-sm">
                            {validation.error}
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

"use client";

import { useLotteryDataStore } from "@/stores/useLotteryDataStore";

export default function WinnerRecordsList() {
  const winnerRecords = useLotteryDataStore((state) => state.winnerRecords);
  const prizes = useLotteryDataStore((state) => state.prizes);
  const clearWinnerRecords = useLotteryDataStore(
    (state) => state.clearWinnerRecords
  );

  // 獲取獎品名稱（優先通過 prizeId 查找，如果找不到則使用備份名稱）
  const getPrizeName = (record: typeof winnerRecords[0]) => {
    if (record.prizeId) {
      const prize = prizes.find((p) => p.id === record.prizeId);
      if (prize) return prize.name;
    }
    return record.prize; // 備份顯示
  };

  const handleClearAll = () => {
    if (winnerRecords.length === 0) return;

    if (
      confirm(
        `確定要清除所有 ${winnerRecords.length} 筆中獎紀錄嗎？此操作無法復原。`
      )
    ) {
      clearWinnerRecords();
    }
  };

  const handleExportCSV = () => {
    if (winnerRecords.length === 0) {
      alert("目前沒有中獎紀錄可以匯出");
      return;
    }

    // 建立 CSV 內容
    const headers = ["序號", "姓名", "員工編號", "獎品名稱"];
    const rows = winnerRecords.map((record, index) => [
      index + 1,
      record.name,
      record.employeeId || "",
      getPrizeName(record),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // 加入 BOM 以支援中文
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    // 下載檔案
    const link = document.createElement("a");
    link.href = url;
    link.download = `中獎名單_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // 按時間倒序排列（最新的在前）
  const sortedRecords = [...winnerRecords].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  return (
    <div className="w-full space-y-4">
      {/* 標題與操作按鈕 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-amber-900">
          中獎紀錄
          <span className="ml-2 text-sm font-normal text-amber-700">
            (共 {winnerRecords.length} 筆)
          </span>
        </h3>
        <div className="flex gap-2">
          {winnerRecords.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                匯出 CSV
              </button>
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                清除全部
              </button>
            </>
          )}
        </div>
      </div>

      {/* 中獎紀錄列表 */}
      {winnerRecords.length === 0 ? (
        <div className="text-center py-12 text-amber-700">
          <div>尚無中獎紀錄</div>
          <div className="text-sm mt-1">開始抽獎後將顯示在這裡</div>
        </div>
      ) : (
        <div className="border border-amber-300 rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-br from-yellow-100 to-amber-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-amber-900">
                    #
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-amber-900">
                    姓名
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-amber-900">
                    員工編號
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-amber-900">
                    獎品名稱
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.map((record, index) => (
                  <tr
                    key={`${record.id}-${record.timestamp}`}
                    className="border-t border-amber-200 hover:bg-amber-50 transition-colors"
                  >
                    <td className="px-4 py-2 text-sm text-amber-800">
                      {winnerRecords.length - index}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-amber-900">
                      {record.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-amber-800 font-mono">
                      {record.employeeId || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-amber-900">
                      {getPrizeName(record)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

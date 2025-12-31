"use client";

import { useState } from "react";
import { useLotteryDataStore, type Prize } from "@/stores/useLotteryDataStore";

export default function PrizeList() {
  const prizes = useLotteryDataStore((state) => state.prizes);
  const addPrize = useLotteryDataStore((state) => state.addPrize);
  const updatePrize = useLotteryDataStore((state) => state.updatePrize);
  const removePrize = useLotteryDataStore((state) => state.removePrize);
  const clearPrizes = useLotteryDataStore((state) => state.clearPrizes);
  const participants = useLotteryDataStore((state) => state.participants);
  const winnerRecords = useLotteryDataStore((state) => state.winnerRecords);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 獲取所有可用的分組（去重，group 現在是必填）
  const availableGroups = Array.from(
    new Set(participants.map((p) => p.group))
  ).sort();

  // 表單狀態
  const [formData, setFormData] = useState({
    name: "",
    level: 1,
    quantity: 1,
    group: "", // 必填分組
  });

  const resetForm = () => {
    setFormData({
      name: "",
      level: 1,
      quantity: 1,
      group: "",
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("請輸入獎項名稱");
      return;
    }

    if (formData.quantity < 1) {
      alert("中獎人數必須大於 0");
      return;
    }

    if (!formData.group.trim()) {
      alert("請選擇分組");
      return;
    }

    if (editingId) {
      // 檢查是否有人已經中獎
      const currentPrize = prizes.find((p) => p.id === editingId);
      if (currentPrize) {
        const winnersCount = winnerRecords.filter((record) => {
          // 如果記錄有 prizeId，只通過 ID 匹配（嚴格匹配）
          if (record.prizeId) {
            return record.prizeId === editingId;
          }
          // 舊記錄（沒有 prizeId），通過名稱匹配（向後兼容）
          return record.prize === currentPrize.name;
        }).length;

        if (formData.quantity < winnersCount) {
          alert(
            `無法設定此數量！\n\n此獎項已有 ${winnersCount} 人中獎，數量不能少於 ${winnersCount} 個。\n\n如需減少數量，請先到「紀錄」分頁清除部分中獎紀錄。`
          );
          return;
        }
      }

      // 更新現有獎項
      updatePrize(editingId, {
        name: formData.name.trim(),
        level: formData.level,
        quantity: formData.quantity,
        group: formData.group.trim(),
      });
    } else {
      // 新增獎項
      addPrize({
        id: `prize-${Date.now()}`,
        name: formData.name.trim(),
        level: formData.level,
        quantity: formData.quantity,
        group: formData.group.trim(),
      });
    }

    resetForm();
  };

  const handleEdit = (prize: Prize) => {
    setFormData({
      name: prize.name,
      level: prize.level,
      quantity: prize.quantity,
      group: prize.group,
    });
    setEditingId(prize.id);
    setShowAddForm(false); // 編輯時不顯示頂部表單
  };

  const handleClearAll = () => {
    if (prizes.length === 0) return;

    if (confirm(`確定要清除所有 ${prizes.length} 個獎項嗎？此操作無法復原。`)) {
      clearPrizes();
    }
  };

  // 處理新增獎項按鈕點擊
  const handleAddPrizeClick = () => {
    // 檢查是否有參與者清單
    if (participants.length === 0) {
      alert("請先上傳參與者名單！\n\n必須先有參與者清單才能新增獎項。");
      return;
    }

    resetForm();
    setShowAddForm(!showAddForm);
  };

  // 計算總中獎人數
  const totalWinners = prizes.reduce((sum, prize) => sum + prize.quantity, 0);

  // 按等級排序獎項（過濾已刪除的）
  const sortedPrizes = [...prizes]
    .filter((p) => !p.isDeleted)
    .sort((a, b) => a.level - b.level);

  return (
    <div className="w-full space-y-4">
      {/* 提示訊息：需要先上傳參與者 */}
      {participants.length === 0 && (
        <div className="p-4 bg-gradient-to-br from-yellow-100 to-amber-100 border border-amber-300 rounded-lg">
          <div>
            <div className="font-medium text-amber-900">提示</div>
            <div className="text-sm text-amber-800">
              請先到「參與者」分頁上傳參與者名單，才能新增或上傳獎項。
            </div>
          </div>
        </div>
      )}

      {/* 標題與統計 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-amber-900">
          獎項列表
          <span className="ml-2 text-sm font-normal text-amber-700">
            ({prizes.length} 個獎項，共 {totalWinners} 個名額)
          </span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleAddPrizeClick}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              participants.length === 0
                ? "bg-blue-200 text-blue-700 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            title={participants.length === 0 ? "請先上傳參與者名單" : "新增獎項"}
          >
            {showAddForm ? "取消" : "+ 新增獎項"}
          </button>
          {prizes.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              清除全部
            </button>
          )}
        </div>
      </div>

      {/* 新增表單（只在新增時顯示在頂部） */}
      {showAddForm && !editingId && (
        <div className="p-4 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 border-2 border-amber-400 rounded-lg space-y-3">
          <div className="text-sm font-medium text-amber-900 mb-2">
            新增獎項
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">
              獎項名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例如：頭獎 - iPhone 15 Pro"
              className="w-full px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                獎項等級 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="text-xs text-amber-700 mt-1">
                數字越小越優先抽取
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                中獎人數 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">
              所屬分組 <span className="text-red-500">*</span>
            </label>
            {availableGroups.length > 0 ? (
              <select
                value={formData.group}
                onChange={(e) =>
                  setFormData({ ...formData, group: e.target.value })
                }
                className="w-full px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">請選擇分組</option>
                {availableGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.group}
                onChange={(e) =>
                  setFormData({ ...formData, group: e.target.value })
                }
                placeholder="請輸入分組名稱（需先上傳分組參與者）"
                className="w-full px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            )}
            <div className="text-xs text-amber-700 mt-1">
              必填，此獎項只有指定分組的參與者可以抽取
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
            >
              {editingId ? "更新" : "新增"}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-amber-100 text-amber-900 rounded hover:bg-amber-200 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 獎項列表 */}
      {prizes.length === 0 ? (
        <div className="text-center py-12 text-amber-700">
          <div>尚未設定獎項</div>
          <div className="text-sm mt-1">請點擊上方按鈕新增獎項</div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedPrizes.map((prize) => (
            <div key={prize.id}>
              {editingId === prize.id ? (
                // 編輯模式：顯示編輯表單
                <div className="p-4 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 border-2 border-amber-500 rounded-lg space-y-3 shadow-lg">
                  <div className="text-sm font-medium text-amber-900 mb-2">
                    編輯獎項
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-1">
                      獎項名稱 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="例如：頭獎 - iPhone 15 Pro"
                      className="w-full px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-amber-900 mb-1">
                        獎項等級 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.level}
                        onChange={(e) =>
                          setFormData({ ...formData, level: parseInt(e.target.value) || 1 })
                        }
                        className="w-full px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <div className="text-xs text-amber-700 mt-1">
                        數字越小越優先抽取
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-amber-900 mb-1">
                        中獎人數 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                        }
                        className="w-full px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-1">
                      所屬分組 <span className="text-red-500">*</span>
                    </label>
                    {availableGroups.length > 0 ? (
                      <select
                        value={formData.group}
                        onChange={(e) =>
                          setFormData({ ...formData, group: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">請選擇分組</option>
                        {availableGroups.map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData.group}
                        onChange={(e) =>
                          setFormData({ ...formData, group: e.target.value })
                        }
                        placeholder="請輸入分組名稱（需先上傳分組參與者）"
                        className="w-full px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    )}
                    <div className="text-xs text-amber-700 mt-1">
                      必填，此獎項只有指定分組的參與者可以抽取
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmit}
                      className="flex-1 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
                    >
                      更新
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 bg-amber-100 text-amber-900 rounded hover:bg-amber-200 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                // 顯示模式：顯示獎項資訊
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border border-amber-300 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-xs font-medium rounded border border-amber-400">
                          等級 {prize.level}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded border border-blue-200">
                          {prize.group}
                        </span>
                        <h4 className="font-semibold text-amber-900">
                          {prize.name}
                        </h4>
                      </div>
                      <div className="mt-2 text-sm text-amber-800">
                        <span className="font-medium">中獎人數：</span>
                        {prize.quantity} 人
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(prize)}
                        className="text-amber-600 hover:text-amber-800 text-sm transition-colors font-medium"
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`確定要刪除「${prize.name}」嗎？`)) {
                            removePrize(prize.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 text-sm transition-colors font-medium"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

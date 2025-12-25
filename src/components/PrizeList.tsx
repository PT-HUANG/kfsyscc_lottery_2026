"use client";

import { useState } from "react";
import { useAnimationStore, type Prize } from "@/stores/useAnimationStore";

export default function PrizeList() {
  const prizes = useAnimationStore((state) => state.prizes);
  const addPrize = useAnimationStore((state) => state.addPrize);
  const updatePrize = useAnimationStore((state) => state.updatePrize);
  const removePrize = useAnimationStore((state) => state.removePrize);
  const clearPrizes = useAnimationStore((state) => state.clearPrizes);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 表單狀態
  const [formData, setFormData] = useState({
    name: "",
    level: 1,
    quantity: 1,
    description: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      level: 1,
      quantity: 1,
      description: "",
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

    if (editingId) {
      // 更新現有獎項
      updatePrize(editingId, {
        name: formData.name.trim(),
        level: formData.level,
        quantity: formData.quantity,
        description: formData.description.trim() || undefined,
      });
    } else {
      // 新增獎項
      addPrize({
        id: `prize-${Date.now()}`,
        name: formData.name.trim(),
        level: formData.level,
        quantity: formData.quantity,
        description: formData.description.trim() || undefined,
      });
    }

    resetForm();
  };

  const handleEdit = (prize: Prize) => {
    setFormData({
      name: prize.name,
      level: prize.level,
      quantity: prize.quantity,
      description: prize.description || "",
    });
    setEditingId(prize.id);
    setShowAddForm(true);
  };

  const handleClearAll = () => {
    if (prizes.length === 0) return;

    if (confirm(`確定要清除所有 ${prizes.length} 個獎項嗎？此操作無法復原。`)) {
      clearPrizes();
    }
  };

  // 計算總中獎人數
  const totalWinners = prizes.reduce((sum, prize) => sum + prize.quantity, 0);

  // 按等級排序獎項
  const sortedPrizes = [...prizes].sort((a, b) => a.level - b.level);

  return (
    <div className="w-full space-y-4">
      {/* 標題與統計 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          獎項列表
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({prizes.length} 個獎項，共 {totalWinners} 個名額)
          </span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(!showAddForm);
            }}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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

      {/* 新增/編輯表單 */}
      {showAddForm && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-2">
            {editingId ? "編輯獎項" : "新增獎項"}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              獎項名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例如：頭獎 - iPhone 15 Pro"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                獎項等級 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1">
                數字越小越優先抽取
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                中獎人數 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              獎項描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="選填，例如：市值 NT$45,000"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {editingId ? "更新" : "新增"}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 獎項列表 */}
      {prizes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">🏆</div>
          <div>尚未設定獎項</div>
          <div className="text-sm mt-1">請點擊上方按鈕新增獎項</div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedPrizes.map((prize, index) => (
            <div
              key={prize.id}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      等級 {prize.level}
                    </span>
                    <h4 className="font-semibold text-gray-800">
                      {prize.name}
                    </h4>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">中獎人數：</span>
                    {prize.quantity} 人
                  </div>
                  {prize.description && (
                    <div className="mt-1 text-sm text-gray-500">
                      {prize.description}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(prize)}
                    className="text-blue-500 hover:text-blue-700 text-sm transition-colors"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`確定要刪除「${prize.name}」嗎？`)) {
                        removePrize(prize.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-sm transition-colors"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

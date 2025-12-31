"use client";

import { useState } from "react";
import { useLotteryDataStore } from "@/stores/useLotteryDataStore";

export default function ParticipantList() {
  const participants = useLotteryDataStore((state) => state.participants);
  const removeParticipant = useLotteryDataStore((state) => state.removeParticipant);
  const clearParticipants = useLotteryDataStore((state) => state.clearParticipants);
  const addParticipant = useLotteryDataStore((state) => state.addParticipant);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmployeeId, setNewEmployeeId] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newGroup, setNewGroup] = useState("");

  const handleAddParticipant = () => {
    if (!newName.trim()) {
      alert("請輸入姓名");
      return;
    }

    if (!newEmployeeId.trim()) {
      alert("請輸入員工編號");
      return;
    }

    if (!newDepartment.trim()) {
      alert("請輸入部門");
      return;
    }

    if (!newGroup.trim()) {
      alert("請輸入分組");
      return;
    }

    addParticipant({
      id: `participant-${Date.now()}`,
      name: newName.trim(),
      employeeId: newEmployeeId.trim(),
      department: newDepartment.trim(),
      group: newGroup.trim(),
    });

    // 清空表單
    setNewName("");
    setNewEmployeeId("");
    setNewDepartment("");
    setNewGroup("");
    setShowAddForm(false);
  };

  const handleClearAll = () => {
    if (participants.length === 0) return;

    if (confirm(`確定要清除所有 ${participants.length} 位參與者嗎？此操作無法復原。`)) {
      clearParticipants();
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* 標題與統計 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-amber-900">
          參與者名單
          <span className="ml-2 text-sm font-normal text-amber-700">
            ({participants.length} 人)
          </span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {showAddForm ? "取消" : "+ 新增參與者"}
          </button>
          {participants.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              清除全部
            </button>
          )}
        </div>
      </div>

      {/* 新增表單 */}
      {showAddForm && (
        <div className="p-4 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 border border-amber-300 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="請輸入姓名"
              className="w-full px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                員工編號 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newEmployeeId}
                onChange={(e) => setNewEmployeeId(e.target.value)}
                placeholder="請輸入員工編號"
                className="w-full px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                部門 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="請輸入部門"
                className="w-full px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                分組 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                placeholder="必填"
                className="w-full px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>
          <button
            onClick={handleAddParticipant}
            className="w-full px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
          >
            新增
          </button>
        </div>
      )}

      {/* 參與者列表 */}
      {participants.length === 0 ? (
        <div className="text-center py-12 text-amber-700">
          <div>尚未新增參與者</div>
          <div className="text-sm mt-1">請上傳 TXT 檔案或手動新增</div>
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
                    部門
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-amber-900">
                    分組
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-amber-900">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant, index) => (
                  <tr
                    key={participant.id}
                    className="border-t border-amber-200 hover:bg-amber-50 transition-colors"
                  >
                    <td className="px-4 py-2 text-sm text-amber-800">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-amber-900">
                      {participant.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-amber-800">
                      {participant.employeeId || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-amber-800">
                      {participant.department || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-xs font-medium rounded border border-amber-300">
                        {participant.group}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`確定要刪除「${participant.name}」嗎？`)) {
                            removeParticipant(participant.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 text-sm transition-colors"
                      >
                        刪除
                      </button>
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

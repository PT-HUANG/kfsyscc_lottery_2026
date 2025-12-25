"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ParticipantUpload from "@/components/ParticipantUpload";
import ParticipantList from "@/components/ParticipantList";
import PrizeUpload from "@/components/PrizeUpload";
import PrizeList from "@/components/PrizeList";
import WinnerRecordsList from "@/components/WinnerRecordsList";
import LotterySettings from "@/components/LotterySettings";

interface ManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManagementModal({
  isOpen,
  onClose,
}: ManagementModalProps) {
  const [activeTab, setActiveTab] = useState<
    "participants" | "prizes" | "settings" | "records"
  >("participants");

  const tabs = [
    { id: "participants" as const, label: "📋 參與者", icon: "👥" },
    { id: "prizes" as const, label: "🎁 獎項", icon: "🏆" },
    { id: "settings" as const, label: "⚙️ 設定", icon: "📊" },
    { id: "records" as const, label: "📊 紀錄", icon: "📜" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            🎰 抽獎管理後台
          </DialogTitle>
          <DialogDescription>
            管理參與者名單、獎項設定與中獎紀錄
          </DialogDescription>
        </DialogHeader>

        {/* 分頁導航 */}
        <div className="flex gap-2 border-b border-gray-200 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-t-lg font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 內容區域 */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "participants" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  上傳參與者名單
                </h3>
                <ParticipantUpload />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  參與者列表
                </h3>
                <ParticipantList />
              </div>
            </div>
          )}

          {activeTab === "prizes" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  上傳獎項清單
                </h3>
                <PrizeUpload />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  獎項列表
                </h3>
                <PrizeList />
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                抽獎設定與統計
              </h3>
              <LotterySettings />
            </div>
          )}

          {activeTab === "records" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                中獎紀錄
              </h3>
              <WinnerRecordsList />
            </div>
          )}
        </div>

        {/* 底部操作按鈕 */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            關閉
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

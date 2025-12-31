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
    { id: "participants" as const, label: "參與者" },
    { id: "prizes" as const, label: "獎項" },
    { id: "settings" as const, label: "設定" },
    { id: "records" as const, label: "紀錄" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-900">
            抽獎管理後台
          </DialogTitle>
          <DialogDescription className="text-amber-700">
            管理參與者名單、獎項設定與中獎紀錄
          </DialogDescription>
        </DialogHeader>

        {/* 分頁導航 */}
        <div className="flex border-b-2 border-amber-500">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 px-4 py-3 rounded-t-lg font-bold transition-all duration-200
                ${
                  activeTab === tab.id
                    ? "bg-amber-500 text-white shadow-[0_-2px_8px_rgba(217,119,6,0.3)]"
                    : "bg-gradient-to-b from-amber-100 to-amber-50 text-amber-900 hover:from-amber-200 hover:to-amber-100 shadow-sm border border-amber-300 border-b-0"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 內容區域 */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "participants" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-amber-900 mb-4">
                  上傳參與者名單
                </h3>
                <ParticipantUpload />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900 mb-4">
                  參與者列表
                </h3>
                <ParticipantList />
              </div>
            </div>
          )}

          {activeTab === "prizes" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-amber-900 mb-4">
                  上傳獎項清單
                </h3>
                <PrizeUpload />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900 mb-4">
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
              <h3 className="text-lg font-semibold text-amber-900 mb-4">
                中獎紀錄
              </h3>
              <WinnerRecordsList />
            </div>
          )}
        </div>

        {/* 底部操作按鈕 */}
        <div className="flex justify-end gap-2 pt-4 border-t-2 border-amber-300">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            關閉
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

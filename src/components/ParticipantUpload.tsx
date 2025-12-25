"use client";

import { useCallback, useState } from "react";
import { useAnimationStore, type Participant } from "@/stores/useAnimationStore";

interface ParticipantUploadProps {
  onUploadComplete?: (count: number) => void;
}

export default function ParticipantUpload({ onUploadComplete }: ParticipantUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const setParticipants = useAnimationStore((state) => state.setParticipants);
  const participants = useAnimationStore((state) => state.participants);

  const parseTextFile = useCallback(
    async (file: File): Promise<Participant[]> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            if (!text) {
              reject(new Error("檔案內容為空"));
              return;
            }

            // 解析每行，過濾空行
            const lines = text
              .split("\n")
              .map((line) => line.trim())
              .filter((line) => line.length > 0);

            if (lines.length === 0) {
              reject(new Error("檔案中沒有有效的參與者資料"));
              return;
            }

            // 將每行轉換為 Participant 物件
            // 支援兩種格式：
            // 1. 只有姓名：「張三」
            // 2. 完整格式：「張三 A001 資訊部」（用空格或 tab 分隔）
            const newParticipants: Participant[] = lines.map((line, index) => {
              // 使用 \s+ 分隔（支援空格和 tab）
              const parts = line.split(/\s+/);

              const name = parts[0] || "";
              const employeeId = parts[1] || undefined;
              const department = parts[2] || undefined;

              // 如果有超過3個欄位，將第3個之後的都當作部門名稱的一部分
              const fullDepartment = parts.length > 3
                ? parts.slice(2).join(" ")
                : department;

              return {
                id: `participant-${Date.now()}-${index}`,
                name,
                employeeId,
                department: fullDepartment,
              };
            });

            resolve(newParticipants);
          } catch (err) {
            reject(err);
          }
        };

        reader.onerror = () => {
          reject(new Error("讀取檔案時發生錯誤"));
        };

        reader.readAsText(file, "UTF-8");
      });
    },
    []
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      setError(null);
      setIsProcessing(true);

      try {
        // 驗證檔案類型
        if (!file.name.endsWith(".txt")) {
          throw new Error("請上傳 .txt 格式的檔案");
        }

        // 驗證檔案大小 (限制 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("檔案大小不能超過 5MB");
        }

        // 解析檔案
        const newParticipants = await parseTextFile(file);

        // 更新 store
        setParticipants(newParticipants);

        // 呼叫回調
        if (onUploadComplete) {
          onUploadComplete(newParticipants.length);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "上傳檔案時發生未知錯誤";
        setError(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    },
    [parseTextFile, setParticipants, onUploadComplete]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  return (
    <div className="w-full space-y-4">
      {/* 拖放上傳區域 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8
          transition-colors duration-200
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}
          ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-blue-400"}
        `}
      >
        <input
          type="file"
          accept=".txt"
          onChange={handleInputChange}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="text-center space-y-2">
          <div className="text-4xl">📄</div>
          <div className="text-lg font-medium text-gray-700">
            {isProcessing ? "處理中..." : "上傳參與者名單"}
          </div>
          <div className="text-sm text-gray-500">
            拖放 .txt 檔案到這裡，或點擊選擇檔案
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div>格式：每行一位參與者，UTF-8 編碼</div>
            <div className="font-mono bg-gray-100 px-2 py-1 rounded inline-block">
              姓名 員工編號 部門
            </div>
            <div className="text-gray-500">（用空格或 Tab 分隔，員工編號和部門可省略）</div>
          </div>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-red-500 text-lg">⚠️</span>
            <div>
              <div className="font-medium text-red-800">上傳失敗</div>
              <div className="text-sm text-red-600">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* 成功訊息 */}
      {!error && participants.length > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-green-500 text-lg">✓</span>
            <div>
              <div className="font-medium text-green-800">上傳成功</div>
              <div className="text-sm text-green-600">
                已載入 {participants.length} 位參與者
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

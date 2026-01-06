"use client";

import { useCallback, useState } from "react";
import {
  useLotteryDataStore,
  type Participant,
} from "@/stores/useLotteryDataStore";

interface ParticipantUploadProps {
  onUploadComplete?: (count: number) => void;
}

export default function ParticipantUpload({
  onUploadComplete,
}: ParticipantUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [groupName, setGroupName] = useState<string>(""); // 分組名稱

  const setParticipants = useLotteryDataStore((state) => state.setParticipants);
  const participants = useLotteryDataStore((state) => state.participants);

  const parseTextFile = useCallback(
    async (file: File, group: string): Promise<Participant[]> => {
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
              const fullDepartment =
                parts.length > 3 ? parts.slice(2).join(" ") : department;

              return {
                id: `participant-${Date.now()}-${index}`,
                name,
                employeeId,
                department: fullDepartment,
                group, // 設定分組（必填）
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
        // 驗證分組名稱（必填）
        const trimmedGroup = groupName.trim();
        if (!trimmedGroup) {
          throw new Error("請輸入分組名稱！分組為必填欄位。");
        }

        // 驗證檔案類型
        if (!file.name.endsWith(".txt")) {
          throw new Error("請上傳 .txt 格式的檔案");
        }

        // 驗證檔案大小 (限制 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("檔案大小不能超過 5MB");
        }

        // 解析檔案（傳入分組名稱）
        const newParticipants = await parseTextFile(file, trimmedGroup);

        // 追加到現有參與者列表（而非替換）
        setParticipants([...participants, ...newParticipants]);

        // 呼叫回調
        if (onUploadComplete) {
          onUploadComplete(newParticipants.length);
        }

        // 清空分組名稱輸入框
        setGroupName("");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "上傳檔案時發生未知錯誤";
        setError(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    },
    [parseTextFile, setParticipants, onUploadComplete, groupName, participants]
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
      if (!groupName) {
        alert("請先輸入組別名稱再進行上傳")
        return
      }
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload, groupName]
  );

  return (
    <div className="w-full space-y-4">
      {/* 分組名稱輸入框 */}
      <div className="space-y-2">
        <label
          htmlFor="groupName"
          className="block text-sm font-medium text-amber-900"
        >
          分組名稱 <span className="text-red-500">*</span>
        </label>
        <input
          id="groupName"
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="例如：一般員工、值班人員、資深員工"
          disabled={isProcessing}
          className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
        <p className="text-xs font-bold text-red-600">
          上傳的參與者將自動標記為此分組
        </p>
      </div>

      {/* 拖放上傳區域 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8
          transition-colors duration-200
          ${
            isProcessing || !groupName.trim()
              ? "border-amber-300 bg-amber-100 opacity-60 cursor-not-allowed"
              : isDragging
              ? "border-amber-500 bg-amber-50"
              : "border-amber-300 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 cursor-pointer hover:border-amber-400"
          }
        `}
      >
        <input
          type="file"
          accept=".txt"
          onChange={handleInputChange}
          disabled={isProcessing || !groupName.trim()}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="text-center space-y-2">
          <div className="text-lg font-medium text-amber-900">
            {isProcessing ? "處理中..." : "上傳參與者名單"}
          </div>
          <div className="text-sm text-amber-800">
            拖放 .txt 檔案到這裡，或點擊選擇檔案
          </div>
          <div className="text-xs text-amber-700 space-y-1">
            <div>格式：每行一位參與者，UTF-8 編碼</div>
            <div className="font-mono bg-amber-100 px-2 py-1 rounded inline-block">
              姓名 員工編號 部門
            </div>
            <div className="text-amber-700">
              （用空格或 Tab 分隔，員工編號和部門可省略）
            </div>
            <div className="text-amber-900 font-medium mt-2">
              支援多次上傳不同分組的名單
            </div>
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
              <div className="font-medium text-green-700">上傳成功</div>
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

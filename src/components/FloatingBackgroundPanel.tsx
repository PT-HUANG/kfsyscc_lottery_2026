"use client";

import { useRef, useState, useEffect } from "react";
import {
  saveBackgroundImage,
  deleteBackgroundImage,
  getBackgroundImage,
} from "@/utils/imageStorage";
import { useBackgroundStore } from "@/stores/useBackgroundStore";
import { useLotteryUIStore } from "@/stores/useLotteryUIStore";

export default function FloatingBackgroundPanel() {
  // Get data from stores
  const {
    config,
    updateConfig,
    resetConfig,
    selectedBackground,
    setSelectedBackground,
    refreshImage,
  } = useBackgroundStore();

  const { closeBgPanel } = useLotteryUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [hasCustomImage, setHasCustomImage] = useState(false);

  // 檢查是否有自定義圖片
  useEffect(() => {
    async function checkCustomImage() {
      try {
        const customImage = await getBackgroundImage();
        setHasCustomImage(!!customImage);
      } catch (error) {
        console.error(error);
        setHasCustomImage(false);
      }
    }
    checkCustomImage();
  }, []);

  const handleChange = (key: keyof typeof config, value: number) => {
    updateConfig({ [key]: value });
  };

  // 处理文件上傳
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await saveBackgroundImage(file);
      setHasCustomImage(true); // 標記有自定義圖片
      alert("背景圖片上傳成功！");
      // 刷新圖片
      refreshImage();
    } catch (error) {
      alert(`上傳失敗：${error instanceof Error ? error.message : "未知錯誤"}`);
    } finally {
      setUploading(false);
      // 清空 input 以允许重复上傳同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 删除自定义背景
  const handleDeleteImage = async () => {
    if (!confirm("確定要刪除您上傳的圖片，恢復預設背景嗎？")) {
      return;
    }

    try {
      await deleteBackgroundImage();
      setHasCustomImage(false); // 標記沒有自定義圖片
      alert("恢復預設背景圖片");
      // 刷新圖片
      refreshImage();
    } catch (error) {
      alert(`刪除失敗：${error instanceof Error ? error.message : "未知錯誤"}`);
    }
  };

  return (
    <div className="max-h-[38vh] overflow-y-auto bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 rounded-xl shadow-[0_8px_30px_rgba(168,85,247,0.2)] border-2 border-amber-400">
      {/* 標題列 */}
      <div className="px-4 pr-2 py-3 flex items-center justify-between sticky top-0 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 z-10">
        <div className="flex items-center gap-2 flex-1">
          <span className="font-bold text-sm text-amber-900">背景設定</span>
        </div>
      </div>

      {/* 控制面板 */}
      <div className="p-4 flex flex-col gap-1">
        {/* 預設背景選擇 */}
        <div>
          <label
            className={`block text-xs font-semibold mb-1.5 ${
              hasCustomImage ? "text-gray-400" : "text-amber-900"
            }`}
          >
            選擇主題
            {hasCustomImage && (
              <span className="ml-2 text-[11px] font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                使用中：自定義主題
              </span>
            )}
          </label>
          <select
            value={selectedBackground}
            onChange={(e) => setSelectedBackground(e.target.value)}
            disabled={hasCustomImage}
            className={`w-full px-3 py-2 ${
              hasCustomImage ? "bg-gray-100" : "bg-white"
            } border-2 border-amber-300 rounded-lg text-xs font-medium ${
              hasCustomImage ? "text-gray-400 cursor-not-allowed" : "text-amber-900 cursor-pointer"
            } outline-none focus:ring-2 focus:ring-amber-400 transition-all ${
              hasCustomImage ? "opacity-60" : ""
            }`}
          >
            <option value="OfficeBG">派對主題佈景</option>
            <option value="GachaBG">馬到成功-2026</option>
          </select>
        </div>

        <div className="border-t border-amber-300 pt-3 mt-1" />

        {/* 圖片上傳区域 */}
        <div className="mb-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`flex-1 px-3 py-2 ${
                uploading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
              } text-white border-none rounded-lg ${
                uploading ? "cursor-not-allowed" : "cursor-pointer"
              } text-xs font-semibold transition-colors`}
            >
              {uploading ? "上傳中..." : "上傳圖片"}
            </button>

            <button
              onClick={handleDeleteImage}
              disabled={uploading}
              className={`flex-1 px-3 py-2 ${
                uploading ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
              } text-white border-none rounded-lg ${
                uploading ? "cursor-not-allowed" : "cursor-pointer"
              } text-xs font-semibold transition-colors`}
            >
              恢復預設
            </button>
          </div>

          <p className="text-[11px] text-amber-700 mt-1.5 leading-snug">
            支持 PNG、JPG、WebP 格式，最大 10MB
          </p>
        </div>

        <div className="border-t border-amber-300 pt-3 mt-2" />

        {/* Position X */}
        <div>
          <label className="block text-xs font-semibold text-amber-900 mb-1">
            水平 (X): <span className="text-blue-600">{config.positionX}</span>
          </label>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            value={config.positionX}
            onChange={(e) =>
              handleChange("positionX", parseFloat(e.target.value))
            }
            className="w-full h-1.5 rounded cursor-pointer accent-blue-500"
          />
        </div>

        {/* Position Y */}
        <div>
          <label className="block text-xs font-semibold text-amber-900 mb-1">
            垂直 (Y): <span className="text-blue-600">{config.positionY}</span>
          </label>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            value={config.positionY}
            onChange={(e) =>
              handleChange("positionY", parseFloat(e.target.value))
            }
            className="w-full h-1.5 rounded cursor-pointer accent-blue-500"
          />
        </div>

        {/* Position Z */}
        <div>
          <label className="block text-xs font-semibold text-amber-900 mb-1">
            深度 (Z): <span className="text-blue-600">{config.positionZ}</span>
          </label>
          <input
            type="range"
            min="-200"
            max="0"
            step="1"
            value={config.positionZ}
            onChange={(e) =>
              handleChange("positionZ", parseFloat(e.target.value))
            }
            className="w-full h-1.5 rounded cursor-pointer accent-blue-500"
          />
        </div>

        {/* Scale */}
        <div>
          <label className="block text-xs font-semibold text-amber-900 mb-1">
            大小: <span className="text-blue-600">{config.scale}</span>
          </label>
          <input
            type="range"
            min="50"
            max="300"
            step="5"
            value={config.scale}
            onChange={(e) => handleChange("scale", parseFloat(e.target.value))}
            className="w-full h-1.5 rounded cursor-pointer accent-blue-500"
          />
        </div>

        {/* Reset Button */}
        <button
          onClick={resetConfig}
          className="mt-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white border-none rounded-lg cursor-pointer text-xs font-semibold transition-colors"
        >
          重置
        </button>
      </div>
    </div>
  );
}

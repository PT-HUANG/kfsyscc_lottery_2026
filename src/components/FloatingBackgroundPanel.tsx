"use client";

import { useRef, useState, useEffect } from "react";
import {
  saveBackgroundImage,
  deleteBackgroundImage,
  getBackgroundImage,
} from "@/utils/imageStorage";
import { useBackgroundStore } from "@/stores/useBackgroundStore";
import { Button } from "@/components/ui/button";

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
    <div className="max-h-[70vh] xl:max-h-[70vh] overflow-y-auto bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 rounded-lg shadow-[0_8px_30px_rgba(168,85,247,0.2)] border-2 border-amber-400">
      {/* 控制面板 */}
      <div className="p-5 flex flex-col gap-2">
        {/* 預設背景選擇 */}
        <div>
          <label
            className={`block text-base font-bold mb-2 ${
              hasCustomImage ? "text-gray-400" : "text-amber-900"
            }`}
          >
            選擇主題
            {hasCustomImage && (
              <span className="ml-2 text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded border border-emerald-300">
                使用中：自定義圖片
              </span>
            )}
          </label>
          <select
            value={selectedBackground}
            onChange={(e) => setSelectedBackground(e.target.value)}
            disabled={hasCustomImage}
            className={`w-full px-3 py-2.5 ${
              hasCustomImage ? "bg-gray-100" : "bg-amber-100"
            } border-2 border-amber-300 rounded-lg text-sm font-medium ${
              hasCustomImage ? "text-gray-400 cursor-not-allowed" : "text-amber-900 cursor-pointer"
            } outline-none focus:ring-2 focus:ring-amber-400 transition-all ${
              hasCustomImage ? "opacity-60" : "hover:border-amber-400"
            }`}
          >
            <option value="OfficeBG">派對主題佈景</option>
            <option value="GachaBG">馬到成功-2026</option>
          </select>
        </div>

        <div className="border-t border-amber-300/50 mt-1" />

        {/* 圖片上傳区域 */}
        <div>
          <label className="block text-base font-bold text-amber-900 mb-2">
            自定義背景
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex gap-2.5">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-1 text-base font-bold py-6 rounded-lg bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              {uploading ? "上傳中..." : "上傳圖片"}
            </Button>

            <Button
              onClick={handleDeleteImage}
              disabled={uploading}
              className="flex-1 text-base font-bold py-6 rounded-lg bg-red-500 hover:bg-red-600 text-white border-0 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              恢復預設
            </Button>
          </div>

          <p className="text-xs text-amber-700 mt-2 font-medium opacity-80">
            支持 PNG、JPG、WebP 格式，最大 10MB
          </p>
        </div>

        <div className="border-t border-amber-300/50 mt-1" />

        {/* 控制項 */}
        <div className="flex flex-col gap-3">
          {/* Position X */}
          <div>
            <label className="block text-sm font-bold text-amber-900 mb-0.5">
              水平位移 (X): <span className="text-blue-600 font-black">{config.positionX}</span>
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
              className="w-full h-2 rounded-lg cursor-pointer accent-blue-500 bg-amber-200/50"
            />
          </div>

          {/* Position Y */}
          <div>
            <label className="block text-sm font-bold text-amber-900 mb-0.5">
              垂直位移 (Y): <span className="text-blue-600 font-black">{config.positionY}</span>
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
              className="w-full h-2 rounded-lg cursor-pointer accent-blue-500 bg-amber-200/50"
            />
          </div>

          {/* Position Z */}
          <div>
            <label className="block text-sm font-bold text-amber-900 mb-0.5">
              深度位移 (Z): <span className="text-blue-600 font-black">{config.positionZ}</span>
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
              className="w-full h-2 rounded-lg cursor-pointer accent-blue-500 bg-amber-200/50"
            />
          </div>

          {/* Scale */}
          <div>
            <label className="block text-sm font-bold text-amber-900 mb-0.5">
              背景縮放: <span className="text-blue-600 font-black">{config.scale}</span>
            </label>
            <input
              type="range"
              min="50"
              max="300"
              step="5"
              value={config.scale}
              onChange={(e) => handleChange("scale", parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg cursor-pointer accent-blue-500 bg-amber-200/50"
            />
          </div>
        </div>

        {/* Reset Button */}
        <Button
          onClick={resetConfig}
          className="mt-2 w-full text-base font-bold py-6 rounded-lg bg-amber-600 hover:bg-amber-700 text-white border-0 shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200"
        >
          重置數值
        </Button>
      </div>
    </div>
  );
}

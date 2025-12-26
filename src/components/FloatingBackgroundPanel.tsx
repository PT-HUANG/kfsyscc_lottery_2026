"use client";

import { useRef, useState } from "react";
import {
  saveBackgroundImage,
  deleteBackgroundImage,
} from "@/utils/imageStorage";

export interface BackgroundConfig {
  positionX: number;
  positionY: number;
  positionZ: number;
  scale: number;
}

interface FloatingBackgroundPanelProps {
  config: BackgroundConfig;
  onChange: (config: BackgroundConfig) => void;
  onClose: () => void;
  onImageUpload?: () => void; // 上傳圖片后的回调
}

export default function FloatingBackgroundPanel({
  config,
  onChange,
  onClose,
  onImageUpload,
}: FloatingBackgroundPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (key: keyof BackgroundConfig, value: number) => {
    onChange({ ...config, [key]: value });
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
      alert("背景圖片上傳成功！");
      // 通知父组件刷新圖片
      if (onImageUpload) {
        onImageUpload();
      }
    } catch (error) {
      alert(
        `上傳失敗：${error instanceof Error ? error.message : "未知錯誤"}`
      );
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
      alert("恢復預設背景圖片");
      // 通知父组件刷新圖片
      if (onImageUpload) {
        onImageUpload();
      }
    } catch (error) {
      alert(
        `刪除失敗：${error instanceof Error ? error.message : "未知錯誤"}`
      );
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        zIndex: 50,
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        transition: "all 0.3s ease",
        maxWidth: "320px",
      }}
    >
      {/* 標題列 */}
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flex: 1,
          }}
        >
          <span style={{ fontSize: "18px" }}>🎨</span>
          <span style={{ fontWeight: "600", fontSize: "14px" }}>背景設定</span>
        </div>
        <button
          onClick={onClose}
          style={{
            marginLeft: "8px",
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            padding: "0",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6b7280",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#374151";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6b7280";
          }}
        >
          ×
        </button>
      </div>

      {/* 控制面板 */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* 圖片上傳区域 */}
          <div style={{ marginBottom: "8px" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: uploading ? "#9ca3af" : "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: uploading ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!uploading) e.currentTarget.style.background = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  if (!uploading) e.currentTarget.style.background = "#3b82f6";
                }}
              >
                {uploading ? "上傳中..." : "上傳圖片"}
              </button>

              <button
                onClick={handleDeleteImage}
                disabled={uploading}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: uploading ? "#9ca3af" : "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: uploading ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!uploading) e.currentTarget.style.background = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  if (!uploading) e.currentTarget.style.background = "#ef4444";
                }}
              >
                恢復預設
              </button>
            </div>

            <p style={{
              fontSize: "11px",
              color: "#6b7280",
              marginTop: "6px",
              lineHeight: "1.4"
            }}>
              支持 PNG、JPG、WebP 格式，最大 10MB
            </p>
          </div>

          <div style={{
            borderTop: "1px solid #e5e7eb",
            paddingTop: "12px",
            marginTop: "4px"
          }} />

          {/* Position X */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              水平 (X): <span style={{ color: "#3b82f6" }}>{config.positionX}</span>
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
              style={{
                width: "100%",
                height: "6px",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            />
          </div>

          {/* Position Y */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              垂直 (Y): <span style={{ color: "#3b82f6" }}>{config.positionY}</span>
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
              style={{
                width: "100%",
                height: "6px",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            />
          </div>

          {/* Position Z */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              深度 (Z): <span style={{ color: "#3b82f6" }}>{config.positionZ}</span>
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
              style={{
                width: "100%",
                height: "6px",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            />
          </div>

          {/* Scale */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              大小: <span style={{ color: "#3b82f6" }}>{config.scale}</span>
            </label>
            <input
              type="range"
              min="50"
              max="300"
              step="5"
              value={config.scale}
              onChange={(e) => handleChange("scale", parseFloat(e.target.value))}
              style={{
                width: "100%",
                height: "6px",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={() =>
              onChange({
                positionX: 11,
                positionY: -1,
                positionZ: -67,
                scale: 150,
              })
            }
            style={{
              marginTop: "8px",
              padding: "8px 12px",
              background: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#4b5563";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#6b7280";
            }}
          >
            重置
          </button>
        </div>
    </div>
  );
}

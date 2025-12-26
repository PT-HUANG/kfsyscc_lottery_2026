"use client";

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
}

export default function FloatingBackgroundPanel({
  config,
  onChange,
  onClose,
}: FloatingBackgroundPanelProps) {
  const handleChange = (key: keyof BackgroundConfig, value: number) => {
    onChange({ ...config, [key]: value });
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

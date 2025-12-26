"use client";

interface BackgroundConfig {
  positionX: number;
  positionY: number;
  positionZ: number;
  scale: number;
}

interface BackgroundSettingsProps {
  config: BackgroundConfig;
  onChange: (config: BackgroundConfig) => void;
}

export type { BackgroundConfig };

export default function BackgroundSettings({
  config,
  onChange,
}: BackgroundSettingsProps) {
  const handleChange = (key: keyof BackgroundConfig, value: number) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Position X */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          水平位置 (X): <span className="font-mono text-blue-600">{config.positionX}</span>
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
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>← 左</span>
          <span>右 →</span>
        </div>
      </div>

      {/* Position Y */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          垂直位置 (Y): <span className="font-mono text-blue-600">{config.positionY}</span>
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
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>↓ 下</span>
          <span>上 ↑</span>
        </div>
      </div>

      {/* Position Z */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          深度位置 (Z): <span className="font-mono text-blue-600">{config.positionZ}</span>
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
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>← 後</span>
          <span>前 →</span>
        </div>
      </div>

      {/* Scale */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          縮放大小: <span className="font-mono text-blue-600">{config.scale}</span>
        </label>
        <input
          type="range"
          min="50"
          max="300"
          step="5"
          value={config.scale}
          onChange={(e) => handleChange("scale", parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>小</span>
          <span>大</span>
        </div>
      </div>

      {/* 說明 */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <div className="font-semibold mb-2">💡 調整說明</div>
          <ul className="space-y-1 text-xs">
            <li>• <strong>水平/垂直位置</strong>：調整背景圖片在畫面中的位置</li>
            <li>• <strong>深度位置</strong>：控制背景距離鏡頭的遠近（建議保持負值）</li>
            <li>• <strong>縮放大小</strong>：調整背景圖片的顯示大小</li>
          </ul>
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <button
          onClick={() =>
            onChange({
              positionX: 4,
              positionY: 20,
              positionZ: -60,
              scale: 150,
            })
          }
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          重置為預設值
        </button>
      </div>
    </div>
  );
}

import { ReactNode } from "react";

interface DrawModeButtonProps {
  isSelected: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

export default function DrawModeButton({
  isSelected,
  disabled = false,
  onClick,
  children,
}: DrawModeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 px-3 py-2 rounded-lg text-base font-bold shadow-md relative border-[3px] text-white transition-opacity duration-200 ${
        isSelected
          ? "shadow-[0_4px_14px_rgba(168,85,247,0.9),0_0_25px_rgba(217,70,239,0.7)] opacity-100"
          : "opacity-50 hover:opacity-100 hover:shadow-lg"
      } `}
      style={
        isSelected
          ? {
              background: `
                linear-gradient(#a855f7, #a855f7) padding-box,
                conic-gradient(
                  from calc(var(--border-angle, 0deg)),
                  #a855f7 0%,
                  #d946ef 3%,
                  #e879f9 6%,
                  #f0abfc 9%,
                  #fae8ff 12%,
                  #a855f7 16%,
                  #a855f7 50%,
                  #d946ef 53%,
                  #e879f9 56%,
                  #f0abfc 59%,
                  #fae8ff 62%,
                  #a855f7 66%,
                  #a855f7 100%
                ) border-box
              `,
              border: "3px solid transparent",
              animation: "border-rotate 2.8s linear infinite",
            }
          : {
              background: "#a855f7",
              border: "3px solid transparent",
            }
      }
    >
      {isSelected && (
        <style>{`
          @property --border-angle {
            syntax: "<angle>";
            initial-value: 0deg;
            inherits: false;
          }
          @keyframes border-rotate {
            from { --border-angle: 0deg; }
            to { --border-angle: 360deg; }
          }
        `}</style>
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

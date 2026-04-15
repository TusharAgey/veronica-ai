import { X, Moon, Sparkles } from "lucide-react";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "dark" | "midnight";
  setTheme: (theme: "dark" | "midnight") => void;
  // Accept blur props
  blurValue: number;
  setBlurValue: (val: number) => void;
}

export default function Settings({
  isOpen,
  onClose,
  theme,
  setTheme,
  blurValue,
  setBlurValue,
}: SettingsProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-80 backdrop-blur-3xl saturate-[180%] bg-black/20 border-l border-white/[0.08] shadow-2xl rounded-l-3xl z-50 p-6 flex flex-col transition-transform">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-semibold text-white">Configuration</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-3 bg-black/40 p-4 rounded-2xl border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
            <span className="text-sm font-medium text-white/80 mb-1">
              Spatial Environment
            </span>
            <div className="flex relative bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setTheme("dark")}
                className={`relative flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all z-10 ${theme === "dark" ? "text-white" : "text-white/40 hover:text-white/60"}`}
              >
                <Sparkles size={14} /> Studio
              </button>
              <button
                onClick={() => setTheme("midnight")}
                className={`relative flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all z-10 ${theme === "midnight" ? "text-white" : "text-white/40 hover:text-white/60"}`}
              >
                <Moon size={14} /> Obsidian
              </button>
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-indigo-500/80 border border-indigo-400/50 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-transform duration-300 ease-out ${theme === "midnight" ? "translate-x-[calc(100%+4px)]" : "translate-x-0"}`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 bg-black/40 p-4 rounded-2xl border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-medium text-white/80">
                Smoke Transparency
              </span>
              <span className="text-xs font-mono text-white/40">
                {blurValue}px
              </span>
            </div>
            <div className="relative w-full h-10 bg-black/40 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.1)] border border-black/50 rounded-full px-4 flex items-center">
              <input
                type="range"
                min="0"
                max="64"
                step="1"
                value={blurValue}
                onChange={(e) => setBlurValue(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

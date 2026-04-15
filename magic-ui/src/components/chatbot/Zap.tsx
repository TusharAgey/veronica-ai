import { Zap } from "lucide-react";

export function ZapBackdrop() {
  return (
    <div className="flex-1 flex items-center justify-center pointer-events-none opacity-20">
      <Zap
        size={300}
        className="text-white drop-shadow-[0_0_100px_rgba(255,255,255,0.5)]"
      />
    </div>
  );
}

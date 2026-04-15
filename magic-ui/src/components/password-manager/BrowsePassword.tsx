import { MagicCard } from "../ui/MagicCard";
import { GlassInput, GlassSelect } from "../ui/GlassInput";

export function BrowsePassword() {
  return (
    <MagicCard className="p-8 flex-1">
      <h2 className="text-xl font-semibold text-white mb-6">Browse Password</h2>
      <div className="space-y-5">
        <GlassSelect>
          <option className="bg-[#0f0f1a]">Select account...</option>
          {/* Add more mapped options here later */}
        </GlassSelect>

        <GlassInput type="password" placeholder="Session Password" />

        <button className="w-full py-4 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white font-medium shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)]">
          Show Details
        </button>
      </div>
    </MagicCard>
  );
}

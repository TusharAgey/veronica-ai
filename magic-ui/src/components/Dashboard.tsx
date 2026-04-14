import { LayoutDashboard, Lock, Zap } from "lucide-react";
import { MagicCard } from "../components/ui/MagicCard"; // Adjust path if needed

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
      {/* AI Bots List */}
      <MagicCard className="col-span-2 p-8 h-64 border-indigo-500/30">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-semibold text-white">AI Bots</h2>
          <Zap className="text-indigo-400" />
        </div>
        <ul className="space-y-3 text-white/70">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>{" "}
            Space Pirate
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400"></span>{" "}
            Code Bot
          </li>
        </ul>
      </MagicCard>

      {/* Right side stats */}
      <div className="flex flex-col gap-6">
        <MagicCard className="p-6 flex flex-col items-center justify-center flex-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-4">
            <LayoutDashboard size={24} className="text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Tuesday</h3>
          <p className="text-white/50 text-sm">4/14/2026</p>
        </MagicCard>

        <MagicCard className="p-6 flex flex-col items-center justify-center flex-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4">
            <Lock size={24} className="text-emerald-400" />
          </div>
          <h3 className="text-3xl font-bold text-white">60</h3>
          <p className="text-white/50 text-sm">Saved Passwords</p>
        </MagicCard>
      </div>
    </div>
  );
}

import { LayoutDashboard, Lock, Zap } from "lucide-react";
import { MagicCard } from "./ui/MagicCard";
import { useGetAccountsQuery } from "../services/api";

export default function Dashboard() {
  const { data: accounts = [] } = useGetAccountsQuery();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
      {/* AI Bots List */}
      <MagicCard className="col-span-2 p-8 h-64 border-indigo-500/30">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-semibold text-white">AI Bots</h2>
          <Zap className="text-indigo-400" />
        </div>
        <ul className="space-y-4 text-white/80">
          <li className="flex items-center gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]"></span>
            Space Pirate
          </li>
          <li className="flex items-center gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.8)]"></span>
            Code Bot
          </li>
        </ul>
      </MagicCard>

      <div className="flex flex-col gap-6">
        <MagicCard className="p-6 flex flex-col items-center justify-center flex-1">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4 shadow-[inset_0_2px_10px_rgba(99,102,241,0.2)]">
            <LayoutDashboard size={28} className="text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            {new Date().toLocaleDateString("en-US", { weekday: "long" })}
          </h3>
          <p className="text-white/50 text-sm">
            {new Date().toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </MagicCard>

        <MagicCard className="p-6 flex flex-col items-center justify-center flex-1">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 shadow-[inset_0_2px_10px_rgba(16,185,129,0.2)]">
            <Lock size={28} className="text-emerald-400" />
          </div>
          <h3 className="text-4xl font-bold text-white">{accounts.length}</h3>
          <p className="text-white/50 text-sm">Saved Passwords</p>
        </MagicCard>
      </div>
    </div>
  );
}

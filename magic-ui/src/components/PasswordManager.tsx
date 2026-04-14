import { Lock } from "lucide-react";
import { MagicCard } from "./ui/MagicCard";

export default function PasswordManager() {
  // The "Engraved Glass" Input Style
  const inputStyle =
    "w-full bg-black/40 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.1)] border border-black/50 focus:bg-black/60 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <MagicCard className="col-span-2 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-white">Add New Account</h2>
          <Lock className="text-white/20" size={32} />
        </div>
        <form className="space-y-5">
          <input
            type="text"
            placeholder="Account Name"
            className={inputStyle}
          />
          <input type="text" placeholder="User Name" className={inputStyle} />
          <input type="email" placeholder="Email ID" className={inputStyle} />
          <input
            type="password"
            placeholder="Password"
            className={inputStyle}
          />
          <input type="text" placeholder="Description" className={inputStyle} />
          <input
            type="password"
            placeholder="Session Password"
            className={inputStyle}
          />
          <button className="w-full py-4 mt-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]">
            Submit
          </button>
        </form>
      </MagicCard>

      <div className="flex flex-col gap-6">
        <MagicCard className="p-6 flex flex-col items-center justify-center h-48">
          <h3 className="text-5xl font-bold text-white drop-shadow-md">0</h3>
          <p className="text-white/50 text-sm mt-2">Total Saved Passwords</p>
        </MagicCard>

        <MagicCard className="p-8 flex-1">
          <h2 className="text-xl font-semibold text-white mb-6">
            Browse Password
          </h2>
          <div className="space-y-5">
            <select className={`${inputStyle} appearance-none cursor-pointer`}>
              <option className="bg-[#0f0f1a]">Select account...</option>
            </select>
            <input
              type="password"
              placeholder="Session Password"
              className={inputStyle}
            />
            <button className="w-full py-4 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white font-medium shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)]">
              Show Details
            </button>
          </div>
        </MagicCard>
      </div>
    </div>
  );
}

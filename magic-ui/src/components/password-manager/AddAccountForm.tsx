import { Lock } from "lucide-react";
import { MagicCard } from "../ui/MagicCard";
import { GlassInput } from "../ui/GlassInput";

export function AddAccountForm() {
  return (
    <MagicCard className="col-span-2 p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-white">Add New Account</h2>
        <Lock className="text-white/20" size={32} />
      </div>

      <form className="space-y-5">
        <GlassInput type="text" placeholder="Account Name" />
        <GlassInput type="text" placeholder="User Name" />
        <GlassInput type="email" placeholder="Email ID" />
        <GlassInput type="password" placeholder="Password" />
        <GlassInput type="text" placeholder="Description" />
        <GlassInput type="password" placeholder="Session Password" />

        <button className="w-full py-4 mt-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]">
          Submit
        </button>
      </form>
    </MagicCard>
  );
}

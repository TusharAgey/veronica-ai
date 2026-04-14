import { MagicCard } from "../components/ui/MagicCard"; // Adjust path if needed

export default function Journal() {
  return (
    <div className="flex flex-col h-full gap-4 p-2">
      {/* Large Text Area inside Glass */}
      <MagicCard className="flex-1 p-2">
        <textarea
          className="w-full h-full bg-transparent resize-none outline-none p-6 text-lg text-white/90 placeholder:text-white/20"
          placeholder="What's on your mind today?"
        ></textarea>
      </MagicCard>

      {/* Bottom Action Bar */}
      <div className="flex gap-4">
        <button className="flex-1 py-4 rounded-2xl spatial-glass hover:bg-white/10 transition-all font-medium text-white">
          Browse Entries
        </button>
        <button className="flex-1 py-4 rounded-2xl bg-indigo-500/80 hover:bg-indigo-500 transition-all font-medium text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]">
          Submit Entry
        </button>
      </div>
    </div>
  );
}

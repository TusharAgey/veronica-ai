import { MagicCard } from "../components/ui/MagicCard";
import { useState, useCallback } from "react";
import { Save, Loader2, Check } from "lucide-react";

export default function Journal() {
  const [content, setContent] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  const handleSubmit = useCallback(() => {
    if (!content.trim()) return;
    setSaveState("saving");
    // Simulate save — replace with actual API call
    setTimeout(() => {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    }, 800);
  }, [content]);

  return (
    <div className="flex flex-col h-full gap-4 p-2">
      {/* Large Text Area inside Glass */}
      <MagicCard className="flex-1 p-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full bg-transparent resize-none outline-none p-6 text-lg text-white/90 placeholder:text-white/20"
          placeholder="What's on your mind today?"
        />
      </MagicCard>

      {/* Bottom Action Bar */}
      <div className="flex gap-4">
        <button className="flex-1 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/10 transition-all font-medium text-white">
          Browse Entries
        </button>
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || saveState === "saving"}
          className="flex-1 py-4 rounded-2xl bg-indigo-500/80 hover:bg-indigo-500 transition-all font-medium text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saveState === "saving" ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Saving...
            </>
          ) : saveState === "saved" ? (
            <>
              <Check size={18} className="text-green-300" /> Saved!
            </>
          ) : (
            <>
              <Save size={18} /> Submit Entry
            </>
          )}
        </button>
      </div>
    </div>
  );
}

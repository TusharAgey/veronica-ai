interface BotSelectorProps {
  bots: string[];
  activeBot: string;
  onSelectBot: (bot: string) => void;
}

export function BotSelector({
  bots,
  activeBot,
  onSelectBot,
}: BotSelectorProps) {
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex gap-2 p-1.5 rounded-full backdrop-blur-3xl saturate-[180%] bg-white/[0.04] border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)]">
      {bots.map((bot) => (
        <button
          key={bot}
          onClick={() => onSelectBot(bot)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            activeBot === bot
              ? "bg-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] text-white"
              : "text-white/50 hover:text-white/80 hover:bg-white/5"
          }`}
        >
          {bot}
        </button>
      ))}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown, Sparkles, Code, Orbit } from "lucide-react";

interface BotSelectorProps {
  bots: string[];
  activeBot: string;
  onSelectBot: (bot: string) => void;
}

const getBotIcon = (botName: string) => {
  if (botName.includes("Code")) return <Code size={16} />;
  if (botName.includes("Space") || botName.includes("Galaxy"))
    return <Orbit size={16} />;
  return <Sparkles size={16} />;
};

export function BotSelector({
  bots,
  activeBot,
  onSelectBot,
}: BotSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Standard React pattern to close the dropdown if the user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (bot: string) => {
    onSelectBot(bot);
    setIsOpen(false);
  };

  return (
    // The wrapper stays in the flex row, anchoring the absolute menu
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold tracking-wide text-white bg-indigo-600 shadow-lg hover:bg-indigo-500 transition-colors cursor-pointer border border-indigo-400/30"
      >
        {getBotIcon(activeBot)}
        {/* Hide text on very small screens to ensure the input box always has room */}
        <span className="hidden sm:inline">{activeBot}</span>
        {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </button>

      {/* DROPDOWN MENU (Opens UPWARDS using 'bottom-full mb-3') */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-3 flex flex-col gap-1 p-2 rounded-2xl backdrop-blur-2xl bg-[#1a1a24]/95 border border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] min-w-[200px] z-50">
          {bots.map((bot) => (
            <button
              key={bot}
              onClick={() => handleSelect(bot)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activeBot === bot
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-white/70 hover:bg-white/10 hover:text-white border border-transparent"
              }`}
            >
              {getBotIcon(bot)}
              {bot}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

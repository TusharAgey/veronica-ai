import { useState } from "react";
import { Search, Send, Zap } from "lucide-react";

export default function Chatbot() {
  const bots = ["Code Bot", "Space Pirate", "Prompto", "Hologram"];
  const [activeBot, setActiveBot] = useState("Code Bot");

  return (
    <div className="flex flex-col h-full relative p-2">
      {/* Floating Top Nav (Bot Selector) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 flex gap-2 spatial-glass rounded-full p-1.5">
        {bots.map((bot) => (
          <button
            key={bot}
            onClick={() => setActiveBot(bot)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeBot === bot
                ? "bg-white/10 shadow-inner text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            {bot}
          </button>
        ))}
      </div>

      {/* Center Background Hologram */}
      <div className="flex-1 flex items-center justify-center pointer-events-none opacity-20">
        <Zap
          size={300}
          className="text-white drop-shadow-[0_0_100px_rgba(255,255,255,0.5)]"
        />
      </div>

      {/* Chat Input Bar */}
      <div className="mt-auto relative z-10 pb-4">
        <div className="spatial-glass rounded-full flex items-center p-2 gap-2">
          <button className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
            <Search size={20} />
          </button>
          <input
            type="text"
            placeholder={`Type your message to ${activeBot}...`}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 px-2"
          />
          <button className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center hover:bg-indigo-400 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <Send size={18} className="ml-1 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

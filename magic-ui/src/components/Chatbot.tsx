import { useState } from "react";

// Extracted Sub-Components
import { BotSelector } from "./chatbot/BotSelector";
import { ZapBackdrop } from "./chatbot/Zap";
import { ChatInput } from "./chatbot/ChatInput";

const AVAILABLE_BOTS = ["Code Bot", "Space Pirate", "Prompto", "Hologram"];

export default function Chatbot() {
  const [activeBot, setActiveBot] = useState(AVAILABLE_BOTS[0]);

  return (
    <div className="flex flex-col h-full relative p-2">
      <BotSelector
        bots={AVAILABLE_BOTS}
        activeBot={activeBot}
        onSelectBot={setActiveBot}
      />

      <ZapBackdrop />

      <ChatInput activeBot={activeBot} />
    </div>
  );
}

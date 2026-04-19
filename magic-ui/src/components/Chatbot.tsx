import { useState } from "react";

// Extracted Sub-Components
import { BotSelector } from "./chatbot/BotSelector";
import { ZapBackdrop } from "./chatbot/Zap";
import { ChatInput } from "./chatbot/ChatInput";
import { ChatMessageList } from "./chatbot/ChatMessageList";
const AVAILABLE_BOTS = ["Code Bot", "Space Pirate"];

const chatsSoFar = {
  "Code Bot": [
    {
      user: "hi",
      llm: "Hello! I'm Code-Bot, your friendly coding assistant. How can I help you today?",
    },
    {
      user: "write a python code to add two numbers",
      llm: "here you go! ```python\ndef add_numbers(a, b):\n    return a + b\n```",
    },
  ],
  "Space Pirate": [
    {
      user: "hi",
      llm: "Ahoy matey! I'm a space pirate, you've found me! Looking for secrets? Follow my favorite stars to a hidden crystal cave on Saturn. Keep it quiet, matey!",
    },
  ],
};

export default function Chatbot() {
  const [activeBot, setActiveBot] = useState(AVAILABLE_BOTS[0]);

  return (
    <div className="flex flex-col h-full relative overflow-hidden rounded-[2rem]">
      <ZapBackdrop />
      {/* --- BOT SELECTOR --- */}
      <div className="pt-4 w-full relative z-20">
        <BotSelector
          bots={AVAILABLE_BOTS}
          activeBot={activeBot}
          onSelectBot={setActiveBot}
        />
      </div>
      <ChatMessageList chats={chatsSoFar[activeBot]} />
      <div className="mt-auto shrink-0 w-full p-4 pb-6 relative z-10 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent">
        <ChatInput activeBot={activeBot} />
      </div>
    </div>
  );
}

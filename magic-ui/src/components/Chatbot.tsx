import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../store/store";
import { addUserPrompt, updateLatestLlmResponse } from "../store/chatsSlice";
import { useLazyRunLlamaQuery } from "../services/llamaApi";
import { botPersonality } from "../utilities/const";
// Extracted Sub-Components
import { BotSelector } from "./chatbot/BotSelector";
import { ZapBackdrop } from "./chatbot/Zap";
import { ChatInput } from "./chatbot/ChatInput";
import { ChatMessageList } from "./chatbot/ChatMessageList";
import { chatHistory } from "../utilities/utils";
const AVAILABLE_BOTS = ["Code Bot", "Space Pirate"];

export default function Chatbot() {
  const [activeBot, setActiveBot] = useState(AVAILABLE_BOTS[0]);
  const dispatch = useAppDispatch();
  const { sessions } = useAppSelector((state) => state.chats);
  const chatsSoFar = sessions[activeBot] || [];
  const [runLlama, result] = useLazyRunLlamaQuery();
  /**
   * User submits prompt
   */
  const handleSend = async (input: string) => {
    if (!input.trim()) return;

    // add user row immediately
    dispatch(
      addUserPrompt({
        bot: activeBot,
        user: input,
      }),
    );

    // trigger stream
    runLlama({
      prompt: [
        ...chatHistory(chatsSoFar),
        {
          role: "user",
          content: input,
        },
      ],
      backstory: botPersonality[activeBot],
    });
  };
  /**
   * Sync stream output into chat slice
   */
  useEffect(() => {
    if (!result.data) return;
    dispatch(
      updateLatestLlmResponse({
        bot: activeBot,
        assistant: result.data.content,
      }),
    );
  }, [result.data?.content, activeBot, dispatch]);

  return (
    <div className="flex flex-col h-full relative overflow-hidden rounded-[2rem]">
      <ZapBackdrop />

      <ChatMessageList chats={chatsSoFar} />
      {/* --- PINNED INPUT DOCK (Side-by-side layout) --- */}
      {/* items-center (or items-end if your input is tall) aligns them vertically */}
      <div className="mt-auto shrink-0 w-full p-4 pb-6 relative z-10 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent flex flex-row items-center gap-3">
        {/* BOT SELECTOR */}
        <BotSelector
          bots={AVAILABLE_BOTS}
          activeBot={activeBot}
          onSelectBot={setActiveBot}
        />

        {/* CHAT INPUT */}
        {/* The min-w-0 prevents the input from breaking out of the flex container, 
            and layout tells Framer Motion to smoothly resize this when the sibling grows! */}
        <motion.div layout className="flex-1 min-w-0">
          <ChatInput activeBot={activeBot} onSend={handleSend} />
        </motion.div>
      </div>
    </div>
  );
}

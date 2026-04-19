import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
  addUserPrompt,
  setSelectedChat,
  updateLatestLlmResponse,
} from "../store/chatsSlice";
import { useLazyRunLlamaQuery } from "../services/llamaApi";
import { botPersonality } from "../utilities/const";
// Extracted Sub-Components
import { BotSelector } from "./chatbot/BotSelector";
import { ZapBackdrop } from "./chatbot/Zap";
import { ChatInput } from "./chatbot/ChatInput";
import { ChatMessageList } from "./chatbot/ChatMessageList";
const AVAILABLE_BOTS = ["Code Bot", "Space Pirate"];

export default function Chatbot() {
  const [activeBot, setActiveBot] = useState(AVAILABLE_BOTS[0]);
  const dispatch = useAppDispatch();
  dispatch(setSelectedChat(activeBot));
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
      {/* --- BOT SELECTOR --- */}
      <div className="pt-4 w-full relative z-20">
        <BotSelector
          bots={AVAILABLE_BOTS}
          activeBot={activeBot}
          onSelectBot={setActiveBot}
        />
      </div>
      <ChatMessageList chats={chatsSoFar} />
      <div className="mt-auto shrink-0 w-full p-4 pb-6 relative z-10 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent">
        <ChatInput activeBot={activeBot} onSend={handleSend} />
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
  addUserPrompt,
  updateLatestLlmResponse,
  removeLastUserPrompt,
  createSession,
  setActiveSession,
  toggleHistoryPanel,
} from "../store/chatsSlice";
import { useLazyRunLlamaQuery } from "../services/llamaApi";
import { botPersonality } from "../utilities/const";
// Extracted Sub-Components
import { BotSelector } from "./chatbot/BotSelector";
import { ZapBackdrop } from "./chatbot/Zap";
import { ChatInput } from "./chatbot/ChatInput";
import { ChatMessageList } from "./chatbot/ChatMessageList";
import ChatHistory from "./chatbot/ChatHistory";
import { chatHistory } from "../utilities/utils";
import { stopGeneration } from "./chatbot/completion";

const AVAILABLE_BOTS = ["Code Bot", "Space Pirate"];

export default function Chatbot() {
  const dispatch = useAppDispatch();
  const { sessions, messages, activeSessionId, panelOpen } = useAppSelector(
    (state) => state.chats,
  );

  // Ensure there's always an active session
  useEffect(() => {
    if (!activeSessionId) {
      // Try to find the most recent session, or create one
      const sessionIds = Object.keys(sessions);
      if (sessionIds.length > 0) {
        // Pick the most recently updated
        const mostRecent = sessionIds.reduce((best, id) =>
          sessions[id].updatedAt > sessions[best].updatedAt ? id : best,
        );
        dispatch(setActiveSession(mostRecent));
      } else {
        dispatch(createSession({ bot: AVAILABLE_BOTS[0] }));
      }
    }
  }, [activeSessionId, sessions, dispatch]);

  const activeSession = activeSessionId ? sessions[activeSessionId] : null;
  const activeBot = activeSession?.bot ?? AVAILABLE_BOTS[0];
  const chatsSoFar = activeSessionId ? messages[activeSessionId] || [] : [];
  const [runLlama, result] = useLazyRunLlamaQuery();
  const streamSessionIdRef = useRef<string | null>(null);

  // Only apply safe-area keyboard padding on mobile (touch) devices.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleStopQuery = () => {
    if (activeSessionId) {
      dispatch(removeLastUserPrompt({ sessionId: activeSessionId }));
    }
    stopGeneration();
  };

  /**
   * Switch bot — creates a new session for the selected bot
   */
  const handleSelectBot = (bot: string) => {
    dispatch(createSession({ bot }));
  };

  /**
   * User submits prompt
   */
  const handleSend = async (input: string) => {
    if (!input.trim() || !activeSessionId) return;
    const sessionId = activeSessionId;
    stopGeneration(); // Cancel any inflight request.
    streamSessionIdRef.current = sessionId;

    // add user row immediately
    dispatch(
      addUserPrompt({
        sessionId,
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
    const streamSessionId = streamSessionIdRef.current;
    if (!result.data || !streamSessionId) return;
    dispatch(
      updateLatestLlmResponse({
        sessionId: streamSessionId,
        assistant: result.data.content,
      }),
    );
  }, [result.data?.content, dispatch]);

  return (
    <div className="flex flex-col h-full relative overflow-hidden rounded-[2rem]">
      <ZapBackdrop />

      {/* Chat History Panel (slide-out) */}
      <ChatHistory />

      {/* Session breadcrumb */}
      {activeSession && (
        <div className="px-4 pt-3 pb-0 z-10">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="text-indigo-400/70 font-medium">
              {activeSession.bot}
            </span>
            <span className="text-white/20">/</span>
            <span className="truncate max-w-[200px]">{activeSession.name}</span>
          </div>
        </div>
      )}

      <ChatMessageList chats={chatsSoFar} />

      {/* --- PINNED INPUT DOCK (Side-by-side layout) --- */}
      <div
        className="mt-auto shrink-0 w-full p-4 pb-20 md:pb-6 relative z-10 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent flex flex-col md:flex-row items-end md:items-center gap-3"
        style={
          isMobile
            ? { paddingBottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }
            : undefined
        }
      >
        {/* HISTORY TOGGLE + BOT SELECTOR */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => dispatch(toggleHistoryPanel())}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer ${
              panelOpen
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10"
            }`}
            title="Chat History"
          >
            <Clock size={18} />
          </button>

          <BotSelector
            bots={AVAILABLE_BOTS}
            activeBot={activeBot}
            onSelectBot={handleSelectBot}
          />
        </div>

        {/* CHAT INPUT */}
        <motion.div layout className="w-full md:flex-1 min-w-0">
          <ChatInput
            isFetching={result.data?.streaming}
            activeBot={activeBot}
            onSend={handleSend}
            onCancel={handleStopQuery}
          />
        </motion.div>
      </div>
    </div>
  );
}

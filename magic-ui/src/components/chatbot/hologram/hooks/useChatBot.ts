import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import {
  addUserPrompt,
  createSession,
  updateLatestLlmResponse,
} from "../../../../store/chatsSlice";
import { useLazyRunLlamaQuery } from "../../../../services/llamaApi";
import { botPersonality } from "../../../../utilities/const";
import { getKokoroAudio } from "../../../../utilities/apiCalls";
import { chatHistory } from "../../../../utilities/utils";
import type { AppState } from "../types";
import { BOT } from "../constants";

interface UseChatBotProps {
  audioRef: React.MutableRefObject<HTMLAudioElement>;
  stateRef: React.MutableRefObject<AppState>;
  handleStateChange: (state: AppState) => void;
}

export const useChatBot = ({
  audioRef,
  stateRef,
  handleStateChange,
}: UseChatBotProps) => {
  const { sessions, messages, activeSessionId } = useAppSelector(
    (state) => state.chats,
  );
  const dispatch = useAppDispatch();
  const [runLlama, result] = useLazyRunLlamaQuery();

  const activeSession = activeSessionId ? sessions[activeSessionId] : null;
  const hologramSessionId =
    activeSession?.bot === BOT
      ? activeSession.id
      : Object.values(sessions).find((session) => session.bot === BOT)?.id;
  const chatsSoFar = hologramSessionId ? messages[hologramSessionId] || [] : [];
  const chatsRef = useRef(chatsSoFar);

  useEffect(() => {
    chatsRef.current = chatsSoFar;
  }, [chatsSoFar]);

  const speak = useCallback(
    async (text: string) => {
      try {
        const response = await getKokoroAudio(text);
        const audioUrl = URL.createObjectURL(response.data);

        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          handleStateChange("LISTENING");
          URL.revokeObjectURL(audioUrl);
        };

        handleStateChange("SPEAKING");
        audioRef.current.play();
      } catch (error) {
        console.error(error);
      }
    },
    [audioRef, handleStateChange],
  );

  const handleSend = useCallback(
    (input: string, conversationHistory: ReturnType<typeof chatHistory>) => {
      if (!input.trim()) return;

      let sessionId = hologramSessionId;
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        dispatch(createSession({ bot: BOT, id: sessionId }));
      }

      dispatch(addUserPrompt({ sessionId, user: input }));

      runLlama({
        prompt: [...conversationHistory, { role: "user", content: input }],
        backstory: botPersonality[BOT],
      });
    },
    [dispatch, hologramSessionId, runLlama],
  );

  useEffect(() => {
    if (!result.data || result.data?.streaming || !hologramSessionId) return;
    dispatch(
      updateLatestLlmResponse({
        sessionId: hologramSessionId,
        assistant: result.data.content,
      }),
    );
  }, [
    result.data?.content,
    dispatch,
    result.data?.streaming,
    hologramSessionId,
  ]);

  useEffect(() => {
    if (stateRef.current === "IDLE") return;
    if (!result.data?.streaming) {
      speak(result.data?.content || "");
    } else {
      handleStateChange("THINKING");
    }
  }, [
    result.data?.content,
    result.data?.streaming,
    speak,
    handleStateChange,
    stateRef,
  ]);

  return { handleSend, chatsRef };
};

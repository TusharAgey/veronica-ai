import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import {
  addUserPrompt,
  updateLatestLlmResponse,
} from "../../../../store/chatsSlice";
import { useLazyRunLlamaQuery } from "../../../../services/llamaApi";
import { botPersonality } from "../../../../utilities/const";
import { getKokoroAudio } from "../../../../utilities/apiCalls";
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
  const { sessions } = useAppSelector((state) => state.chats);
  const dispatch = useAppDispatch();
  const [runLlama, result] = useLazyRunLlamaQuery();

  const chatsSoFar = sessions[BOT] || [];
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
    (input: string, conversationHistory: any[]) => {
      if (!input.trim()) return;

      dispatch(addUserPrompt({ bot: BOT, user: input }));

      runLlama({
        prompt: [...conversationHistory, { role: "user", content: input }],
        backstory: botPersonality[BOT],
      });
    },
    [dispatch, runLlama],
  );

  useEffect(() => {
    if (!result.data || result.data?.streaming) return;
    dispatch(
      updateLatestLlmResponse({ bot: BOT, assistant: result.data.content }),
    );
  }, [result.data?.content, dispatch, result.data?.streaming]);

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

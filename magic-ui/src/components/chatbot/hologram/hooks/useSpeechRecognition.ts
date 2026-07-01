import { useEffect, useRef } from "react";
import { chatHistory } from "../../../../utilities/utils";
import type {
  AppState,
  IWindow,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
} from "../types";

declare const window: IWindow;

interface UseSpeechRecognitionProps {
  isAudioActive: boolean;
  isOpen: boolean;
  stateRef: React.MutableRefObject<AppState>;
  chatsRef: React.MutableRefObject<any[]>;
  handleStateChange: (state: AppState) => void;
  handleSend: (input: string, history: any[]) => void;
}

export const useSpeechRecognition = ({
  isAudioActive,
  isOpen,
  stateRef,
  chatsRef,
  handleStateChange,
  handleSend,
}: UseSpeechRecognitionProps) => {
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    let isUnmounting = false;

    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (isUnmounting) return; // Ignore results if we are closing
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript.trim();
        const lowerCaseTranscript = transcript.toLowerCase();
        if (
          lowerCaseTranscript.trim() === "stop listening" ||
          lowerCaseTranscript.trim() === "go to sleep"
        ) {
          handleStateChange("IDLE");
        } else if (stateRef.current === "LISTENING") {
          handleSend(transcript, chatHistory(chatsRef.current));
          handleStateChange("THINKING");
        } else if (lowerCaseTranscript === "start listening") {
          console.log("Wake word detected, starting recognition...");
          handleStateChange("LISTENING");
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Suppress expected abort errors on unmount
        if (event.error !== "aborted") {
          console.error("Speech Recognition Error", event.error);
        }
      };

      recognition.onend = () => {
        if (isUnmounting) return;

        if (isAudioActive && isOpen) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
      if (isAudioActive && isOpen) {
        try {
          recognition.start();
        } catch (e) {}
      }
    }

    return () => {
      isUnmounting = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          recognitionRef.current.stop();
        }
      }
    };
  }, [
    isAudioActive,
    isOpen,
    handleStateChange,
    handleSend,
    chatsRef,
    stateRef,
  ]);

  return { recognitionRef };
};

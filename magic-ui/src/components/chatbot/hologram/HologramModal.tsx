import React, { useRef, useState, useCallback } from "react";
import type { AppState, HologramModalProps } from "./types";
import { useHologramStyles } from "./hooks/useHologramStyles";
import { useAudioSystem } from "./hooks/useAudioSystem";
import { useChatBot } from "./hooks/useChatBot";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { useHologramAnimation } from "./hooks/useHologramAnimation";
import { HologramControls } from "./HologramControls";

const HologramModal: React.FC<HologramModalProps> = ({ isOpen, onClose }) => {
  // Shared state & Refs
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [singleOrbMode, setSingleOrbMode] = useState<boolean>(false);
  const stateRef = useRef<AppState>("IDLE");
  const singleOrbRef = useRef<boolean>(false);
  const mountRef = useRef<HTMLDivElement>(null);

  // Hook 1: CSS Injection
  useHologramStyles();

  // Hook 2: Audio & MediaStream
  const { initSystem, closeAudioSystem, audioRef, analyserRef, dataArrayRef } =
    useAudioSystem(isAudioActive, setIsAudioActive);

  // Stabilize state changes
  const handleStateChange = useCallback(
    (newState: AppState) => {
      stateRef.current = newState;
      if (newState === "LISTENING" && !isAudioActive) initSystem();
    },
    [isAudioActive, initSystem],
  );

  // Hook 3: Chat LLM & TTS
  const { handleSend, chatsRef } = useChatBot({
    audioRef,
    stateRef,
    handleStateChange,
  });

  // Hook 4: Speech Recognition
  const { recognitionRef } = useSpeechRecognition({
    isAudioActive,
    isOpen,
    stateRef,
    chatsRef,
    handleStateChange,
    handleSend,
  });

  // Hook 5: Anime.js & Fluid Wave Render Engine
  useHologramAnimation({
    isOpen,
    isAudioActive,
    mountRef,
    stateRef,
    singleOrbRef,
    analyserRef,
    dataArrayRef,
  });

  const toggleSingleOrb = useCallback(() => {
    setSingleOrbMode((prev) => {
      const next = !prev;
      singleOrbRef.current = next;
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      return next;
    });
  }, []);

  const closeModal = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        recognitionRef.current.stop();
      }
    }
    closeAudioSystem();
    onClose();
  }, [closeAudioSystem, onClose, recognitionRef]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen z-[9999] bg-[radial-gradient(circle_at_center,#000000_0%,#000000_100%)] flex flex-col items-center justify-center">
      <div ref={mountRef} className="absolute inset-0" />

      {!isAudioActive && (
        <>
          <div
            onClick={initSystem}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-cyan-400 cursor-pointer z-[100] font-[Orbitron,sans-serif]"
          >
            <h1 className="text-2xl font-bold tracking-widest">
              INITIALIZE SYSTEM
            </h1>
            <p className="opacity-70 text-xs mt-2 tracking-widest">
              [ CLICK TO START ]
            </p>
          </div>
          <button
            onClick={closeModal}
            className="fixed top-6 right-6 z-[101] w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </>
      )}
      {isAudioActive && (
        <HologramControls
          singleOrbMode={singleOrbMode}
          toggleSingleOrb={toggleSingleOrb}
          closeModal={closeModal}
        />
      )}
    </div>
  );
};

export default HologramModal;

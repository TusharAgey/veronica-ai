import { useRef, useEffect, useCallback } from "react";
import { SILENCE_BASE64 } from "../constants";
import type { IWindow } from "../types";

declare const window: IWindow;

export const useAudioSystem = (
  isAudioActive: boolean,
  setIsAudioActive: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const audioRef = useRef(new Audio());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const initSystem = useCallback(async () => {
    if (isAudioActive) return;

    try {
      // @ts-ignore
      // prettier-ignore
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      setIsAudioActive(true);

      audioRef.current.src = SILENCE_BASE64;
      audioRef.current.play().catch((e) => {
        console.warn("Silence blocked, but element is blessed:", e);
      });
    } catch (err) {
      console.error("System Init Error:", err);
      alert(
        "Microphone access is required for voice commands; check console for additional details.",
      );
    }
  }, [isAudioActive, setIsAudioActive]);

  const closeAudioSystem = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.suspend();
      audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsAudioActive(false);
  }, [setIsAudioActive]);

  // Total unmount cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    initSystem,
    closeAudioSystem,
    audioRef,
    analyserRef,
    dataArrayRef,
    streamRef,
    audioContextRef,
  };
};

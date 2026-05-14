export type AppState = "IDLE" | "LISTENING" | "SPEAKING" | "THINKING";

export interface HologramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
  webkitAudioContext?: typeof AudioContext;
}

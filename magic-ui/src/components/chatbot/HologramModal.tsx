import React, { useEffect, useRef, useState, useCallback } from "react";
import anime from "animejs";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { addUserPrompt, updateLatestLlmResponse } from "../../store/chatsSlice";
import { useLazyRunLlamaQuery } from "../../services/llamaApi";
import { botPersonality } from "../../utilities/const";
import { chatHistory } from "../../utilities/utils";
import { getKokoroAudio } from "../../utilities/apiCalls";
import type { ChatMessage } from "../../services/types";
// --- Types for Web Speech API ---
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
  webkitAudioContext?: typeof AudioContext;
}

declare const window: IWindow;

// --- Component Props ---
interface HologramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AppState = "IDLE" | "LISTENING" | "SPEAKING" | "THINKING";
const BOT = "Dizzy";
const SILENCE_BASE64 =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

const HologramModal: React.FC<HologramModalProps> = ({ isOpen, onClose }) => {
  const { sessions } = useAppSelector((state) => state.chats);
  const chatsSoFar = sessions[BOT] || [];
  const chatsRef = useRef(chatsSoFar);
  const [runLlama, result] = useLazyRunLlamaQuery();
  const dispatch = useAppDispatch();
  const audioRef = useRef(new Audio());

  async function speak(text: string) {
    try {
      const response = await getKokoroAudio(text);
      const audioUrl = URL.createObjectURL(response.data);

      // Re-use the exactly same, already-blessed audio instance
      audioRef.current.src = audioUrl;
      audioRef.current.onended = () => {
        handleStateChange("LISTENING");
        // Memory management
        URL.revokeObjectURL(audioUrl);
      };
      // Start speaking animation
      handleStateChange("SPEAKING");
      audioRef.current.play();
    } catch (error) {
      console.error(error);
    }
  }
  /**
   * User submits prompt
   */
  function handleSend(input: string, conversationHistory: ChatMessage[]) {
    console.log({ input, conversationHistory });
    if (!input.trim()) return;

    // add user row immediately
    dispatch(
      addUserPrompt({
        bot: BOT,
        user: input,
      }),
    );
    // trigger stream
    runLlama({
      prompt: [
        ...conversationHistory,
        {
          role: "user",
          content: input,
        },
      ],
      backstory: botPersonality[BOT],
    });
  }

  // To ensure that chats are refreshed to latest state. This feeds into the LLM while querying.
  useEffect(() => {
    chatsRef.current = chatsSoFar;
  }, [chatsSoFar]);
  /**
   * Sync stream output into chat slice
   */
  useEffect(() => {
    if (!result.data || result.data?.streaming) return;
    dispatch(
      updateLatestLlmResponse({
        bot: BOT,
        assistant: result.data.content,
      }),
    );
  }, [result.data?.content, BOT, dispatch, result.data?.streaming]);

  useEffect(() => {
    if (stateRef.current === "IDLE") return;
    if (!result.data?.streaming) {
      speak(result.data?.content || "");
    } else {
      handleStateChange("THINKING");
    }
  }, [result.data?.content, result.data?.streaming]);

  const mountRef = useRef<HTMLDivElement>(null);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);

  // State Ref for Animation Loop
  const stateRef = useRef<AppState>("IDLE");
  const singleOrbRef = useRef<boolean>(false);

  // Refs for Anime.js & Audio
  const orbRefs = useRef<HTMLDivElement[]>([]);
  const blobAnimations = useRef<anime.AnimeInstance[]>([]);
  const animationFrameRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // NEW: Stream ref to properly kill the microphone track
  const streamRef = useRef<MediaStream | null>(null);

  // Ref for Speech Recognition
  const recognitionRef = useRef<any>(null);

  // Cleanup microphone on total unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // --- 1. SPEECH RECOGNITION SETUP ---
  useEffect(() => {
    const SpeechRecognition = window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript.trim();

        if (
          transcript.toLowerCase().includes("stop listening") ||
          transcript.toLowerCase().includes("go to sleep")
        ) {
          handleStateChange("IDLE");
        } else if (stateRef.current === "LISTENING") {
          handleSend(transcript, chatHistory(chatsRef.current));
          handleStateChange("THINKING");
        } else if (transcript.toLowerCase().includes("start listening")) {
          console.log("Initiating voice command mode...");
          handleStateChange("LISTENING");
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech Recognition Error", event.error);
      };

      recognition.onend = () => {
        if (mountRef.current && isAudioActive && isOpen) {
          try {
            recognition.start();
          } catch (e) {
            /* Already started */
          }
        }
      };

      recognitionRef.current = recognition;
      if (isAudioActive) {
        try {
          recognition.start();
        } catch (e) {}
      }
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isAudioActive, isOpen]);

  // --- 2. INITIALIZATION HANDLER ---
  const initSystem = async () => {
    if (isAudioActive) return;

    try {
      // @ts-ignore
      // prettier-ignore
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; // Save stream to ref for proper cleanup

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      setIsAudioActive(true);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }

      // BLESS THE AUDIO OBJECT FOR SAFARI
      audioRef.current.src = SILENCE_BASE64;
      audioRef.current.play().catch((e) => {
        // It's normal for some browsers to throw a harmless warning here
        console.warn("Silence blocked, but element is blessed:", e);
      });
    } catch (err) {
      console.error("System Init Error:", err);
      alert("Microphone access is required for voice commands.");
    }
  };

  // --- Orb CSS injected once ---
  useEffect(() => {
    const styleId = "hologram-orb-styles";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .hologram-orb-container {
        position: absolute;
        width: 200px;
        height: 200px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        z-index: 10;
        pointer-events: none;
      }
      .hologram-orb-core {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%);
        z-index: 5;
        mix-blend-mode: overlay;
      }
      .hologram-blob {
        position: absolute;
        width: 60%;
        height: 60%;
        border-radius: 50%;
        filter: blur(25px);
        mix-blend-mode: screen;
        opacity: 0.8;
        will-change: transform, border-radius;
      }
      .hologram-blob-1 { background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); }
      .hologram-blob-2 { background: linear-gradient(135deg, #ff0844 0%, #ffb199 100%); }
      .hologram-blob-3 { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); }
      .hologram-blob-4 { background: linear-gradient(135deg, #0052d4 0%, #4364f7 100%); }
      .hologram-particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: #fff;
        border-radius: 50%;
        opacity: 0;
        box-shadow: 0 0 10px 2px rgba(255,255,255,0.5);
      }
      .hologram-outer-ring {
        position: absolute;
        border-radius: 50%;
        border: 1px solid transparent;
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.05) inset;
        opacity: 0;
        will-change: transform, opacity;
      }
      .hologram-wave-container {
        position: absolute;
        z-index: 30;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.7s;
        width: 140%;
        height: 32px;
        pointer-events: none;
        mix-blend-mode: screen;
      }
      .hologram-wave-container svg {
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      .hologram-wave-path {
        will-change: d;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  // --- 3. ANIME.JS ORB LOGIC ---
  useEffect(() => {
    if (!isOpen || !mountRef.current || !isAudioActive) return;

    const container = mountRef.current;
    orbRefs.current = [];
    blobAnimations.current = [];

    // Create 4 orbs
    const orbData = [
      { id: "bottom", angle: 0 },
      { id: "top", angle: Math.PI },
      { id: "left", angle: -Math.PI / 2 },
      { id: "right", angle: Math.PI / 2 },
    ];

    const orbElements: HTMLDivElement[] = [];
    // Store wave path references for the fluid wave engine
    const allWavePaths: {
      els: Element[];
      freq: number;
      speed: number;
      ampMulti: number;
      phaseOffset: number;
    }[] = [];

    orbData.forEach((_, orbIndex) => {
      const orbContainer = document.createElement("div");
      orbContainer.className = "hologram-orb-container";
      orbContainer.style.transform = "scale(0)";

      // Outer rings container
      const outerRingsDiv = document.createElement("div");
      outerRingsDiv.className = "hologram-outer-rings";
      outerRingsDiv.style.cssText =
        "position:absolute;inset:0;display:flex;justify-content:center;align-items:center;z-index:0;pointer-events:none;";
      for (let r = 0; r < 3; r++) {
        const ring = document.createElement("div");
        ring.className = "hologram-outer-ring";
        ring.style.cssText = "width:100%;height:100%;";
        outerRingsDiv.appendChild(ring);
      }
      orbContainer.appendChild(outerRingsDiv);

      // Core overlay
      const core = document.createElement("div");
      core.className = "hologram-orb-core";
      orbContainer.appendChild(core);

      // 4 blobs
      for (let i = 1; i <= 4; i++) {
        const blob = document.createElement("div");
        blob.className = `hologram-blob hologram-blob-${i}`;
        orbContainer.appendChild(blob);
      }

      // SVG Wave Visualizer (matching OrbGram.html)
      const waveContainer = document.createElement("div");
      waveContainer.className = "hologram-wave-container";
      waveContainer.id = `wave-container-${orbIndex}`;

      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("viewBox", "0 0 200 100");
      svg.setAttribute("preserveAspectRatio", "none");

      // Defs with unique gradient IDs per orb
      const defs = document.createElementNS(svgNS, "defs");
      const gradSpecs = [
        {
          id: `wave-grad-1-${orbIndex}`,
          stops: [
            { offset: "0%", color: "rgba(0, 242, 254, 0)" },
            { offset: "20%", color: "rgba(0, 242, 254, 0.8)" },
            { offset: "50%", color: "rgba(79, 172, 254, 1)" },
            { offset: "80%", color: "rgba(0, 242, 254, 0.8)" },
            { offset: "100%", color: "rgba(0, 242, 254, 0)" },
          ],
        },
        {
          id: `wave-grad-2-${orbIndex}`,
          stops: [
            { offset: "0%", color: "rgba(251, 194, 235, 0)" },
            { offset: "20%", color: "rgba(251, 194, 235, 0.8)" },
            { offset: "50%", color: "rgba(161, 140, 209, 1)" },
            { offset: "80%", color: "rgba(251, 194, 235, 0.8)" },
            { offset: "100%", color: "rgba(251, 194, 235, 0)" },
          ],
        },
        {
          id: `wave-grad-3-${orbIndex}`,
          stops: [
            { offset: "0%", color: "rgba(255, 255, 255, 0)" },
            { offset: "50%", color: "rgba(255, 255, 255, 1)" },
            { offset: "100%", color: "rgba(255, 255, 255, 0)" },
          ],
        },
      ];

      gradSpecs.forEach((gs) => {
        const grad = document.createElementNS(svgNS, "linearGradient");
        grad.setAttribute("id", gs.id);
        grad.setAttribute("x1", "0%");
        grad.setAttribute("y1", "0%");
        grad.setAttribute("x2", "100%");
        grad.setAttribute("y2", "0%");
        gs.stops.forEach((st) => {
          const stop = document.createElementNS(svgNS, "stop");
          stop.setAttribute("offset", st.offset);
          stop.setAttribute("stop-color", st.color);
          grad.appendChild(stop);
        });
        defs.appendChild(grad);
      });
      svg.appendChild(defs);

      // Path specs: [className, gradientId, strokeWidth, filter, opacity]
      const pathSpecs: [string, string, number, string?, number?][] = [
        [
          "hologram-wave-path path-1",
          `url(#wave-grad-1-${orbIndex})`,
          10,
          "blur(6px)",
          0.4,
        ],
        [
          "hologram-wave-path path-2",
          `url(#wave-grad-2-${orbIndex})`,
          10,
          "blur(6px)",
          0.4,
        ],
        [
          "hologram-wave-path path-1",
          `url(#wave-grad-1-${orbIndex})`,
          4,
          "blur(2px)",
          0.8,
        ],
        [
          "hologram-wave-path path-2",
          `url(#wave-grad-2-${orbIndex})`,
          4,
          "blur(2px)",
          0.8,
        ],
        ["hologram-wave-path path-1", `url(#wave-grad-1-${orbIndex})`, 1.5],
        ["hologram-wave-path path-2", `url(#wave-grad-2-${orbIndex})`, 1.5],
        [
          "hologram-wave-path path-3",
          `url(#wave-grad-3-${orbIndex})`,
          1,
          undefined,
          0.9,
        ],
      ];

      pathSpecs.forEach(([cls, gradId, sw, filter, opacity]) => {
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("class", cls);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", gradId);
        path.setAttribute("stroke-width", String(sw));
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        if (filter) path.setAttribute("filter", filter);
        if (opacity !== undefined)
          path.setAttribute("opacity", String(opacity));
        svg.appendChild(path);
      });

      waveContainer.appendChild(svg);
      orbContainer.appendChild(waveContainer);

      container.appendChild(orbContainer);
      orbElements.push(orbContainer);
      orbRefs.current.push(orbContainer);
    });

    // Collect wave paths for the fluid wave engine (after all orbs are in DOM)
    setTimeout(() => {
      for (let oi = 0; oi < 4; oi++) {
        const orb = orbElements[oi];
        const paths1 = Array.from(orb.querySelectorAll(".path-1"));
        const paths2 = Array.from(orb.querySelectorAll(".path-2"));
        const paths3 = Array.from(orb.querySelectorAll(".path-3"));
        if (paths1.length) {
          allWavePaths.push({
            els: paths1,
            freq: 0.025,
            speed: 0.05,
            ampMulti: 1.0,
            phaseOffset: 0,
          });
        }
        if (paths2.length) {
          allWavePaths.push({
            els: paths2,
            freq: 0.035,
            speed: -0.04,
            ampMulti: 0.8,
            phaseOffset: 2,
          });
        }
        if (paths3.length) {
          allWavePaths.push({
            els: paths3,
            freq: 0.045,
            speed: 0.07,
            ampMulti: 0.5,
            phaseOffset: 4,
          });
        }
      }
    }, 0);

    // --- Blob Animation Engine (matching OrbGram.html) ---
    function animateBlob(blob: Element, index: number, state: AppState) {
      let spread: number,
        durationMin: number,
        durationMax: number,
        scaleRange: number[];

      if (state === "LISTENING") {
        spread = 25;
        durationMin = 1500;
        durationMax = 2500;
        scaleRange = [1.0, 1.3];
      } else if (state === "THINKING") {
        spread = 45;
        durationMin = 400;
        durationMax = 800;
        scaleRange = [0.8, 1.1];
      } else if (state === "SPEAKING") {
        spread = 30;
        durationMin = 1000;
        durationMax = 2000;
        scaleRange = [1.1, 1.4];
      } else {
        // IDLE
        spread = 15;
        durationMin = 3000;
        durationMax = 5000;
        scaleRange = [0.9, 1.2];
      }

      const anim = anime({
        targets: blob,
        translateX: () => anime.random(-spread, spread) + "%",
        translateY: () => anime.random(-spread, spread) + "%",
        scale: () =>
          anime.random(scaleRange[0] * 100, scaleRange[1] * 100) / 100,
        rotate: () => anime.random(0, 360),
        borderRadius: [
          `${anime.random(30, 70)}% ${anime.random(30, 70)}% ${anime.random(30, 70)}% ${anime.random(30, 70)}%`,
        ],
        duration: () => anime.random(durationMin, durationMax),
        easing: "easeInOutSine",
        complete: () => {
          animateBlob(blob, index, stateRef.current);
        },
      });

      blobAnimations.current[index] = anim;
    }

    // Start blob animations for all orbs
    const allBlobs = container.querySelectorAll(".hologram-blob");
    allBlobs.forEach((blob, i) => {
      animateBlob(blob, i, stateRef.current);
    });

    // --- Entrance Sequence (matching OrbGram.html) ---
    const entranceTimeline = anime.timeline({
      easing: "easeOutExpo",
    });

    entranceTimeline
      .add({
        targets: orbElements,
        scale: [0, 1],
        rotate: ["-90deg", "0deg"],
        duration: 2000,
        easing: "spring(1, 80, 10, 0)",
        delay: anime.stagger(200),
      })
      .add(
        {
          begin: () => createParticleExplosion(),
        },
        "-=500",
      )
      .finished.then(() => {
        // Anime.js entrance animation overwrites the entire transform property,
        // including the translate(-50%, -50%) centering set by updateLayout().
        // Re-apply layout after the animation completes to restore proper centering.
        updateLayout();
      });

    // --- Particle Explosion (spawns at each orb position) ---
    function createParticleExplosion() {
      const particleCount = 5;
      orbElements.forEach((orb) => {
        const fragments = document.createDocumentFragment();
        const particlesArray: HTMLDivElement[] = [];
        const orbRect = orb.getBoundingClientRect();
        const cx = orbRect.left + orbRect.width / 2;
        const cy = orbRect.top + orbRect.height / 2;

        for (let i = 0; i < particleCount; i++) {
          const p = document.createElement("div");
          p.className = "hologram-particle";
          p.style.left = cx + "px";
          p.style.top = cy + "px";
          p.style.position = "fixed";
          fragments.appendChild(p);
          particlesArray.push(p);
        }

        document.body.appendChild(fragments);

        anime({
          targets: particlesArray,
          translateX: () => anime.random(-80, 80),
          translateY: () => anime.random(-80, 80),
          scale: () => anime.random(0.5, 2),
          opacity: [
            { value: 1, duration: 200 },
            { value: 0, duration: 1000, delay: 500 },
          ],
          duration: 2000,
          easing: "easeOutExpo",
          complete: () => {
            particlesArray.forEach((p) => p.remove());
          },
        });
      });
    }

    // --- Layout Positioning (4-quadrant or single-orb mode) ---
    const updateLayout = () => {
      const w = window.innerWidth,
        h = window.innerHeight;
      const singleMode = singleOrbRef.current;

      orbElements.forEach((orb, i) => {
        if (singleMode) {
          // Single orb mode: only show orb 0 at center, larger
          const singleSize = Math.min(w, h) * 0.28;
          if (i === 0) {
            orb.style.display = "flex";
            orb.style.width = singleSize + "px";
            orb.style.height = singleSize + "px";
            orb.style.left = `${w / 2}px`;
            orb.style.top = `${h / 2}px`;
            orb.style.transform = "translate(-50%, -50%)";
            const blobSize = singleSize * 0.6;
            orb.querySelectorAll(".hologram-blob").forEach((b) => {
              (b as HTMLElement).style.width = blobSize + "px";
              (b as HTMLElement).style.height = blobSize + "px";
            });
            (
              orb.querySelector(".hologram-orb-core") as HTMLElement
            ).style.width = singleSize + "px";
            (
              orb.querySelector(".hologram-orb-core") as HTMLElement
            ).style.height = singleSize + "px";
          } else {
            orb.style.display = "none";
          }
        } else {
          // 4-orb mode
          orb.style.display = "flex";
          const orbSize = Math.min(w, h) * 0.14;
          orb.style.width = orbSize + "px";
          orb.style.height = orbSize + "px";
          const blobSize = orbSize * 0.6;
          orb.querySelectorAll(".hologram-blob").forEach((b) => {
            (b as HTMLElement).style.width = blobSize + "px";
            (b as HTMLElement).style.height = blobSize + "px";
          });
          const coreSize = orbSize;
          (orb.querySelector(".hologram-orb-core") as HTMLElement).style.width =
            coreSize + "px";
          (
            orb.querySelector(".hologram-orb-core") as HTMLElement
          ).style.height = coreSize + "px";

          const safePadding = orbSize * 0.85;
          const maxDistanceX = Math.max(0, w / 2 - safePadding);
          const maxDistanceY = Math.max(0, h / 2 - safePadding);
          const distanceX = Math.min(w * 0.25, maxDistanceX, 350);
          const distanceY = Math.min(h * 0.25, maxDistanceY, 350);

          switch (i) {
            case 0:
              orb.style.left = `${w / 2 - distanceX}px`;
              orb.style.top = `${h / 2 - distanceY}px`;
              break;
            case 1:
              orb.style.left = `${w / 2 + distanceX}px`;
              orb.style.top = `${h / 2 - distanceY}px`;
              break;
            case 2:
              orb.style.left = `${w / 2 - distanceX}px`;
              orb.style.top = `${h / 2 + distanceY}px`;
              break;
            case 3:
              orb.style.left = `${w / 2 + distanceX}px`;
              orb.style.top = `${h / 2 + distanceY}px`;
              break;
          }
          orb.style.transform = "translate(-50%, -50%)";
        }
      });
    };
    updateLayout();

    // --- FLUID SVG WAVE ENGINE (matching OrbGram.html) ---
    let wavePhase = 0;
    let currentWaveAmp = 2;
    let targetWaveAmp = 2;
    let waveSpeedMulti = 1;

    function renderWaveLoop() {
      // Smoothly interpolate amplitude for natural transitions
      currentWaveAmp += (targetWaveAmp - currentWaveAmp) * 0.1;
      wavePhase += 1 * waveSpeedMulti;

      allWavePaths.forEach((p) => {
        const phaseOffset = wavePhase * p.speed + p.phaseOffset;
        let d = "M 0 50 ";
        for (let x = 0; x <= 200; x += 3) {
          const windowFunc = Math.pow(Math.sin((x / 200) * Math.PI), 2);
          const y =
            50 +
            Math.sin(x * p.freq + phaseOffset) *
              currentWaveAmp *
              p.ampMulti *
              windowFunc;
          d += "L " + x + " " + y + " ";
        }
        p.els.forEach((el) => el.setAttribute("d", d));
      });
    }

    // --- Ring Pulse Animation (matching OrbGram.html) ---
    let ringPulseAnim: anime.AnimeInstance | null = null;

    function startRingPulse(color: string) {
      const allRings = container.querySelectorAll(".hologram-outer-ring");
      allRings.forEach((ring) => {
        (ring as HTMLElement).style.borderColor = color;
      });

      if (ringPulseAnim) ringPulseAnim.pause();
      ringPulseAnim = anime({
        targets: ".hologram-outer-ring",
        scale: [0.9, 2.4],
        opacity: [0.15, 0],
        duration: 3500,
        easing: "easeOutQuad",
        delay: anime.stagger(900),
        loop: true,
      });
    }

    // --- Audio Reactive Loop (combined with wave engine) ---
    let currentVol = 0;

    const renderLoop = () => {
      animationFrameRef.current = requestAnimationFrame(renderLoop);
      const s = stateRef.current;

      let micVol = 0;
      if (analyserRef.current && dataArrayRef.current) {
        //@ts-ignore
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length / 3; i++)
          sum += dataArrayRef.current[i];
        micVol = Math.min(sum / (dataArrayRef.current.length / 3) / 50, 2.5);
      }

      let targetVol = 0;
      if (s === "IDLE" || s === "THINKING")
        targetVol = 0.15 + Math.sin(performance.now() * 0.005) * 0.05;
      else if (s === "LISTENING") targetVol = micVol || 0.2;
      else if (s === "SPEAKING") {
        const t = performance.now() * 0.01;
        targetVol = 0.6 + (Math.sin(t * 0.5) + Math.sin(t * 1.5)) * 0.3;
      }

      currentVol += (targetVol - currentVol) * 0.1;

      // Scale orbs based on volume
      // Always reconstruct the full transform to include both the centering
      // translate(-50%, -50%) and the volume-based scale. This is necessary
      // because anime.js's entrance animation overwrites the entire transform
      // property, removing the translate centering. By always setting both,
      // the very next animation frame restores correct positioning.
      const scale = 1.0 + currentVol * 0.3;
      orbElements.forEach((orb) => {
        orb.style.transform = `translate(-50%, -50%) scale(${scale})`;
      });

      // --- State-driven wave parameters (matching OrbGram.html) ---
      if (s === "IDLE") {
        targetWaveAmp = 3;
        waveSpeedMulti = 0.4;
        orbElements.forEach((orb) => {
          const wc = orb.querySelector(
            ".hologram-wave-container",
          ) as HTMLElement;
          if (wc) wc.style.opacity = "0.4";
        });
      } else if (s === "LISTENING") {
        targetWaveAmp = 12;
        waveSpeedMulti = 1.2;
        orbElements.forEach((orb) => {
          const wc = orb.querySelector(
            ".hologram-wave-container",
          ) as HTMLElement;
          if (wc) wc.style.opacity = "1";
        });
        startRingPulse("rgba(0, 242, 254, 0.3)");
      } else if (s === "THINKING") {
        targetWaveAmp = 8;
        waveSpeedMulti = 2.5;
        orbElements.forEach((orb) => {
          const wc = orb.querySelector(
            ".hologram-wave-container",
          ) as HTMLElement;
          if (wc) wc.style.opacity = "0.8";
        });
      } else if (s === "SPEAKING") {
        const avg = micVol * 50;
        targetWaveAmp = 5 + (avg / 255) * 50;
        waveSpeedMulti = 1 + (avg / 255) * 3;
        orbElements.forEach((orb) => {
          const wc = orb.querySelector(
            ".hologram-wave-container",
          ) as HTMLElement;
          if (wc) wc.style.opacity = "1";
        });
        startRingPulse("rgba(99, 102, 241, 0.3)");
      }

      // Run the wave renderer
      renderWaveLoop();
    };
    renderLoop();

    const handleResize = () => {
      updateLayout();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("resize", handleResize);
      // Kill all anime animations
      blobAnimations.current.forEach((anim) => {
        if (anim) anim.pause();
      });
      blobAnimations.current = [];
      // Remove DOM elements
      orbElements.forEach((orb) => orb.remove());
      // Remove any leftover particles
      container
        .querySelectorAll(".hologram-particle")
        .forEach((p) => p.remove());
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isOpen, isAudioActive]);

  if (!isOpen) return null;

  // OPTIMIZATION 1: Stabilize the state change function so it doesn't recreate on every render
  const handleStateChange = useCallback(
    (newState: AppState) => {
      stateRef.current = newState;
      if (newState === "LISTENING" && !isAudioActive) initSystem();
    },
    [isAudioActive],
  ); // Only recreate if audio status changes

  // OPTIMIZATION 2: Stabilize the close function
  const closeModal = useCallback(() => {
    recognitionRef.current?.stop();

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.suspend();
      audioContextRef.current.close();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    setIsAudioActive(false);
    onClose();
  }, [onClose]); // Only recreate if the parent's onClose prop changes

  // Single-orb mode toggle
  const [singleOrbMode, setSingleOrbMode] = useState<boolean>(false);
  const toggleSingleOrb = useCallback(() => {
    setSingleOrbMode((prev) => {
      const next = !prev;
      singleOrbRef.current = next;
      // Trigger layout update on next frame
      requestAnimationFrame(() => {
        // The resize handler calls updateLayout
        window.dispatchEvent(new Event("resize"));
      });
      return next;
    });
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen z-[9999] bg-[radial-gradient(circle_at_center,#000000_0%,#000000_100%)] flex flex-col items-center justify-center">
      {/* Anime.js Orb Mount */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* Initialize Overlay */}
      {!isAudioActive && (
        <div
          onClick={initSystem}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-cyan-400 cursor-pointer z-[1000] font-[Orbitron,sans-serif]"
        >
          <h1 className="text-2xl font-bold tracking-widest">
            INITIALIZE SYSTEM
          </h1>
          <p className="opacity-70 text-xs mt-2 tracking-widest">
            [ CLICK TO ENGAGE ]
          </p>
        </div>
      )}

      {/* Controls: Toggle + Close buttons */}
      <div
        className={
          singleOrbMode
            ? "fixed top-6 right-6 z-[10000] flex flex-col items-center gap-3"
            : "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] flex flex-col items-center gap-3"
        }
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSingleOrb}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={
            singleOrbMode ? "Switch to 4-orb mode" : "Switch to single-orb mode"
          }
        >
          {singleOrbMode ? (
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
              <circle cx="12" cy="12" r="3" />
              <circle cx="19" cy="5" r="2" />
              <circle cx="5" cy="5" r="2" />
              <circle cx="19" cy="19" r="2" />
              <circle cx="5" cy="19" r="2" />
            </svg>
          ) : (
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
              <circle cx="12" cy="12" r="5" />
            </svg>
          )}
        </button>

        {/* Close Button */}
        <button
          onClick={closeModal}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
      </div>
    </div>
  );
};

export default HologramModal;

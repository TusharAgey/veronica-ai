import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

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

type AppState = "IDLE" | "LISTENING" | "SPEAKING";

const HologramModal: React.FC<HologramModalProps> = ({ isOpen, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);

  // State Ref for Animation Loop
  const stateRef = useRef<AppState>("IDLE");

  // Refs for Three.js & Audio
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
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
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript
          .trim()
          .toLowerCase();

        if (transcript.includes("start listening")) {
          handleStateChange("LISTENING");
        } else if (
          transcript.includes("stop listening") ||
          transcript.includes("go to sleep")
        ) {
          handleStateChange("IDLE");
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
    } catch (err) {
      console.error("System Init Error:", err);
      alert("Microphone access is required for voice commands.");
    }
  };

  // --- 3. THREE.JS LOGIC ---
  useEffect(() => {
    if (!isOpen || !mountRef.current || !isAudioActive) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const BASE_FRUSTUM = 20;
    const PADDING_FACTOR = 0.8;
    const frustumHeight = BASE_FRUSTUM / PADDING_FACTOR;

    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(
      (-frustumHeight * aspect) / 2,
      (frustumHeight * aspect) / 2,
      frustumHeight / 2,
      -frustumHeight / 2,
      1,
      1000,
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const SEGMENTS = 150;
    const PALETTE = [
      new THREE.Color(0.0, 1.0, 1.0),
      new THREE.Color(1.0, 0.0, 1.0),
      new THREE.Color(0.2, 0.5, 1.0),
      new THREE.Color(1.0, 0.8, 0.2),
      new THREE.Color(0.6, 0.0, 1.0),
    ];

    const createOrbTexture = (): THREE.CanvasTexture => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
        gradient.addColorStop(0.3, "rgba(0, 255, 255, 0.6)");
        gradient.addColorStop(0.7, "rgba(120, 50, 255, 0.2)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const orbMap = createOrbTexture();
    const attenuation = (x: number) => Math.pow(4 * x * (1 - x), 2.5);

    class HologramEmitter {
      group: THREE.Group;
      orb: THREE.Sprite;
      lines: Array<{
        mesh: THREE.Line;
        baseColor: THREE.Color;
        speed: number;
        noiseOffset: number;
        phase: number;
      }>;
      waveSpread: number;

      constructor() {
        this.group = new THREE.Group();
        const orbMat = new THREE.SpriteMaterial({
          map: orbMap,
          color: 0xffffff,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.9,
        });
        this.orb = new THREE.Sprite(orbMat);
        this.orb.scale.set(6, 6, 1);
        this.orb.position.z = -1;
        this.group.add(this.orb);

        this.lines = [];
        this.waveSpread = 16;
        for (let i = 0; i < PALETTE.length; i++) {
          const geometry = new THREE.BufferGeometry();
          const positions = new Float32Array(SEGMENTS * 3);
          const colors = new Float32Array(SEGMENTS * 3);
          for (let j = 0; j < SEGMENTS; j++) {
            positions[j * 3] =
              (j / (SEGMENTS - 1)) * this.waveSpread - this.waveSpread / 2;
            positions[j * 3 + 1] = 0;
            positions[j * 3 + 2] = 0;
          }

          // FIX: Explicitly set DynamicDrawUsage so modern WebGL updates the arrays
          geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3).setUsage(
              THREE.DynamicDrawUsage,
            ),
          );
          geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(colors, 3).setUsage(
              THREE.DynamicDrawUsage,
            ),
          );

          const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8,
            linewidth: 3,
          });
          const line = new THREE.Line(geometry, material);
          line.position.z = i * 0.1;
          this.group.add(line);
          this.lines.push({
            mesh: line,
            baseColor: PALETTE[i],
            speed: 0.005 + i * 0.002,
            noiseOffset: i * 13.5,
            phase: 0,
          });
        }
      }
      update(vol: number, state: AppState) {
        let speedMult: number, freqMult: number;
        if (state === "LISTENING") {
          freqMult = 0.5;
          speedMult = 0.8;
        } else if (state === "SPEAKING") {
          freqMult = 0.7;
          speedMult = 0.8;
        } else {
          freqMult = 1.0;
          speedMult = 0.5;
        }

        // FIX: Switch from Date.now() to performance.now() to prevent precision freezing
        const pulse = 6 + vol * 3 + Math.sin(performance.now() * 0.003) * 0.5;
        this.orb.scale.set(pulse, pulse, 1);

        this.lines.forEach((l) => {
          l.phase += l.speed * speedMult;
          const pos = l.mesh.geometry.attributes.position.array as Float32Array;
          const cols = l.mesh.geometry.attributes.color.array as Float32Array;
          for (let j = 0; j < SEGMENTS; j++) {
            const xRel = j / (SEGMENTS - 1);
            const xPos = pos[j * 3];
            const wave =
              Math.sin(xPos * 0.5 * freqMult + l.phase + l.noiseOffset) +
              Math.sin(xPos * 1.5 * freqMult + l.phase * 2.0);
            pos[j * 3 + 1] = wave * vol * attenuation(xRel) * 1.8;
            const whiteMix = Math.pow(attenuation(xRel), 3);
            cols[j * 3] = l.baseColor.r + (1 - l.baseColor.r) * whiteMix;
            cols[j * 3 + 1] = l.baseColor.g + (1 - l.baseColor.g) * whiteMix;
            cols[j * 3 + 2] = l.baseColor.b + (1 - l.baseColor.b) * whiteMix;
          }
          l.mesh.geometry.attributes.position.needsUpdate = true;
          l.mesh.geometry.attributes.color.needsUpdate = true;
        });
      }
    }

    const emitters = [
      new HologramEmitter(),
      new HologramEmitter(),
      new HologramEmitter(),
      new HologramEmitter(),
    ];
    emitters.forEach((e) => scene.add(e.group));
    const [bottom, top, left, right] = emitters;

    const updateLayout = () => {
      const w = window.innerWidth,
        h = window.innerHeight;
      renderer.setSize(w, h);
      const asp = w / h;

      const curFrustum = BASE_FRUSTUM / PADDING_FACTOR;
      camera.left = (-curFrustum * asp) / 2;
      camera.right = (curFrustum * asp) / 2;
      camera.top = curFrustum / 2;
      camera.bottom = -curFrustum / 2;
      camera.updateProjectionMatrix();

      const halfW = (BASE_FRUSTUM * asp) / 2;
      const halfH = BASE_FRUSTUM / 2;

      bottom.group.position.set(0, -halfH + 2, 0);
      top.group.position.set(0, halfH - 2, 0);
      top.group.rotation.set(0, 0, Math.PI);

      left.group.position.set(-halfW + 2, 0, 0);
      left.group.rotation.set(0, 0, -Math.PI / 2);

      right.group.position.set(halfW - 2, 0, 0);
      right.group.rotation.set(0, 0, Math.PI / 2);
    };
    updateLayout();

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
      // FIX: Switch to performance.now()
      if (s === "IDLE")
        targetVol = 0.15 + Math.sin(performance.now() * 0.005) * 0.05;
      else if (s === "LISTENING") targetVol = micVol || 0.2;
      else if (s === "SPEAKING") {
        const t = performance.now() * 0.01;
        targetVol = 0.6 + (Math.sin(t * 0.5) + Math.sin(t * 1.5)) * 0.3;
      }

      currentVol += (targetVol - currentVol) * 0.1;
      emitters.forEach((e) => e.update(currentVol, s));
      renderer.render(scene, camera);
    };
    renderLoop();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      updateLayout();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      orbMap.dispose();
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

  return (
    <div className="fixed inset-0 w-screen h-screen z-[9999] bg-[radial-gradient(circle_at_center,#000000_0%,#000000_100%)] flex flex-col items-center justify-center">
      {/* Three.js Canvas Mount */}
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

      {/* Control Panel */}
      <div className="relative flex flex-col  rounded-[20px] ">
        <button onClick={closeModal} className=" text-white  ">
          X
        </button>
      </div>
    </div>
  );
};

export default HologramModal;

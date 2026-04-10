import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const HologramModal = ({ isOpen, onClose }) => {
  const mountRef = useRef(null);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [currentState, setCurrentState] = useState("IDLE");

  // State Ref for Animation Loop
  const stateRef = useRef("IDLE");

  // Refs for Three.js & Audio
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  // Ref for Speech Recognition
  const recognitionRef = useRef(null);

  // --- 1. SPEECH RECOGNITION SETUP ---
  useEffect(() => {
    // Browser compatibility check
    const SpeechRecognition = window.SpeechRecognition;
    console.log(SpeechRecognition);
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Keep listening even after a pause
      recognition.interimResults = false; // Only trigger on final results
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        console.log({ event });
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript
          .trim()
          .toLowerCase();

        console.log("Heard:", transcript); // Debug log

        // CHECK FOR WAKE WORD
        if (transcript.includes("start listening")) {
          console.log("Wake word detected!");
          handleStateChange("LISTENING");
        }
        // Optional: Voice command to stop
        else if (
          transcript.includes("stop listening") ||
          transcript.includes("go to sleep")
        ) {
          handleStateChange("IDLE");
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech Recognition Error", event.error);
      };

      // Auto-restart if it stops (unless we closed the modal)
      recognition.onend = () => {
        if (mountRef.current && isAudioActive) {
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
        } catch (e) {
          console.log({ e });
        }
      }
    } else {
      console.log("hehe you don't have any voice recognication unit");
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isAudioActive]); // Re-bind if audio active state changes

  // --- 2. INITIALIZATION HANDLER ---
  const initSystem = async () => {
    if (isAudioActive) return;

    // A. Start Audio Context (Visualizer)
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      setIsAudioActive(true);

      // B. Start Speech Recognition (Wake Word)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          console.log("Voice Command Listener Started");
        } catch (e) {
          console.log("Recognition already active");
        }
      }
    } catch (err) {
      console.error("System Init Error:", err);
      alert("Microphone access is required for voice commands.");
    }
  };

  // --- THREE.JS LOGIC (Same as before) ---
  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // --- PADDING LOGIC ---
    const BASE_FRUSTUM = 20;
    const PADDING_FACTOR = 0.8; // 10% padding from edges
    const frustumHeight = BASE_FRUSTUM / PADDING_FACTOR;

    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(
      (-frustumHeight * aspect) / 2,
      (frustumHeight * aspect) / 2,
      frustumHeight / 2,
      -frustumHeight / 2,
      1,
      1000
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

    const createOrbTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
      gradient.addColorStop(0.3, "rgba(0, 255, 255, 0.6)");
      gradient.addColorStop(0.7, "rgba(120, 50, 255, 0.2)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(canvas);
    };
    const orbMap = createOrbTexture();
    const attenuation = (x) => Math.pow(4 * x * (1 - x), 2.5);

    class HologramEmitter {
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
          geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3)
          );
          geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
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
      update(vol, state) {
        // SMOOTHED PHYSICS from previous step
        let speedMult, freqMult;
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

        const pulse = 6 + vol * 3 + Math.sin(Date.now() * 0.003) * 0.5;
        this.orb.scale.set(pulse, pulse, 1);

        this.lines.forEach((l) => {
          l.phase += l.speed * speedMult;
          const pos = l.mesh.geometry.attributes.position.array;
          const cols = l.mesh.geometry.attributes.color.array;
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

      // Calculate the 'viewable' frustum vs the 'content' frustum
      const curFrustum = BASE_FRUSTUM / PADDING_FACTOR;
      camera.left = (-curFrustum * asp) / 2;
      camera.right = (curFrustum * asp) / 2;
      camera.top = curFrustum / 2;
      camera.bottom = -curFrustum / 2;
      camera.updateProjectionMatrix();

      // Safe boundaries for content
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
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length / 3; i++)
          sum += dataArrayRef.current[i];
        micVol = Math.min(sum / (dataArrayRef.current.length / 3) / 50, 2.5);
      }

      let targetVol = 0;
      if (s === "IDLE") targetVol = 0.15 + Math.sin(Date.now() * 0.005) * 0.05;
      else if (s === "LISTENING") targetVol = micVol || 0.2;
      else if (s === "SPEAKING") {
        const t = Date.now() * 0.01;
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
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStateChange = (newState) => {
    setCurrentState(newState);
    stateRef.current = newState;
    // If manually clicking listening, ensure audio/recog is ready
    if (newState === "LISTENING" && !isAudioActive) initSystem();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        background:
          "radial-gradient(circle at center, #000000 0%, #000000 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        ref={mountRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />

      {!isAudioActive && (
        <div
          onClick={initSystem}
          style={{
            // Updated Click Handler
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(0,0,0,0.8)",
            color: "#00ffff",
            cursor: "pointer",
            zIndex: 1000,
            fontFamily: "Orbitron, sans-serif",
          }}
        >
          <h1>INITIALIZE SYSTEM</h1>
          <p style={{ opacity: 0.7, fontSize: "12px", marginTop: "10px" }}>
            [ CLICK TO ENGAGE ]
          </p>
        </div>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          background: "rgba(45, 29, 130, 0.2)",
          padding: "10px",
          borderRadius: "20px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        {["IDLE", "LISTENING", "SPEAKING"].map((state) => (
          <button
            key={state}
            onClick={() => handleStateChange(state)}
            style={{
              background: currentState === state ? "#00ffff" : "transparent",
              color:
                currentState === state ? "#0f0e0f" : "rgba(255,255,255,0.7)",
              border: "none",
              padding: "10px 20px",
              borderRadius: "20px",
              cursor: "pointer",
              fontFamily: "Orbitron, sans-serif",
            }}
          >
            {state}
          </button>
        ))}

        <button
          onClick={onClose}
          style={{
            marginTop: "20px",
            background: "rgba(255,0,0,0.2)",
            color: "white",
            border: "1px solid red",
            borderRadius: "20px",
            cursor: "pointer",
          }}
        >
          CLOSE MODAL
        </button>
      </div>
    </div>
  );
};

export default HologramModal;

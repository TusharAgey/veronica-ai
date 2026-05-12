import { useEffect, useRef } from "react";
import anime from "animejs";
import type { AppState } from "../types";

interface UseHologramAnimationProps {
  isOpen: boolean;
  isAudioActive: boolean;
  mountRef: React.RefObject<HTMLDivElement | null>;
  stateRef: React.MutableRefObject<AppState>;
  singleOrbRef: React.MutableRefObject<boolean>;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  dataArrayRef: React.MutableRefObject<Uint8Array | null>;
}

export const useHologramAnimation = ({
  isOpen,
  isAudioActive,
  mountRef,
  stateRef,
  singleOrbRef,
  analyserRef,
  dataArrayRef,
}: UseHologramAnimationProps) => {
  const orbRefs = useRef<HTMLDivElement[]>([]);
  const blobAnimations = useRef<anime.AnimeInstance[]>([]);
  const animationFrameRef = useRef<number>(0);
  const lastRingPulseState = useRef<AppState | null>(null);

  useEffect(() => {
    if (!isOpen || !mountRef || !mountRef.current || !isAudioActive) return;

    const container = mountRef.current;
    orbRefs.current = [];
    blobAnimations.current = [];

    const orbData = [
      { id: "bottom", angle: 0 },
      { id: "top", angle: Math.PI },
      { id: "left", angle: -Math.PI / 2 },
      { id: "right", angle: Math.PI / 2 },
    ];

    const orbElements: HTMLDivElement[] = [];
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

      const core = document.createElement("div");
      core.className = "hologram-orb-core";
      orbContainer.appendChild(core);

      for (let i = 1; i <= 4; i++) {
        const blob = document.createElement("div");
        blob.className = `hologram-blob hologram-blob-${i}`;
        orbContainer.appendChild(blob);
      }

      const waveContainer = document.createElement("div");
      waveContainer.className = "hologram-wave-container";
      waveContainer.id = `wave-container-${orbIndex}`;

      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("viewBox", "0 0 200 100");
      svg.setAttribute("preserveAspectRatio", "none");

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

    setTimeout(() => {
      for (let oi = 0; oi < 4; oi++) {
        const orb = orbElements[oi];
        const paths1 = Array.from(orb.querySelectorAll(".path-1"));
        const paths2 = Array.from(orb.querySelectorAll(".path-2"));
        const paths3 = Array.from(orb.querySelectorAll(".path-3"));
        if (paths1.length)
          allWavePaths.push({
            els: paths1,
            freq: 0.025,
            speed: 0.05,
            ampMulti: 1.0,
            phaseOffset: 0,
          });
        if (paths2.length)
          allWavePaths.push({
            els: paths2,
            freq: 0.035,
            speed: -0.04,
            ampMulti: 0.8,
            phaseOffset: 2,
          });
        if (paths3.length)
          allWavePaths.push({
            els: paths3,
            freq: 0.045,
            speed: 0.07,
            ampMulti: 0.5,
            phaseOffset: 4,
          });
      }
    }, 0);

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

    container
      .querySelectorAll(".hologram-blob")
      .forEach((blob, i) => animateBlob(blob, i, stateRef.current));

    const entranceTimeline = anime.timeline({ easing: "easeOutExpo" });

    entranceTimeline
      .add({
        targets: orbElements,
        scale: [0, 1],
        rotate: ["-90deg", "0deg"],
        duration: 2000,
        easing: "spring(1, 80, 10, 0)",
        delay: anime.stagger(200),
      })
      .add({ begin: () => createParticleExplosion() }, "-=500")
      .finished.then(() => updateLayout());

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
          complete: () => particlesArray.forEach((p) => p.remove()),
        });
      });
    }

    const updateLayout = () => {
      const w = window.innerWidth,
        h = window.innerHeight;
      const singleMode = singleOrbRef.current;

      orbElements.forEach((orb, i) => {
        if (singleMode) {
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
          const distanceX = Math.min(
            w * 0.25,
            Math.max(0, w / 2 - safePadding),
            350,
          );
          const distanceY = Math.min(
            h * 0.25,
            Math.max(0, h / 2 - safePadding),
            350,
          );

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

    let wavePhase = 0,
      currentWaveAmp = 2,
      targetWaveAmp = 2,
      waveSpeedMulti = 1;

    function renderWaveLoop() {
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

    let ringPulseAnim: anime.AnimeInstance | null = null;
    function startRingPulse(color: string) {
      container.querySelectorAll(".hologram-outer-ring").forEach((ring) => {
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

    let currentVol = 0;
    const renderLoop = () => {
      animationFrameRef.current = requestAnimationFrame(renderLoop);
      const s = stateRef.current;
      let micVol = 0;

      if (analyserRef.current && dataArrayRef.current) {
        // @ts-ignore
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
      else if (s === "SPEAKING")
        targetVol =
          0.6 +
          (Math.sin(performance.now() * 0.01 * 0.5) +
            Math.sin(performance.now() * 0.01 * 1.5)) *
            0.3;

      currentVol += (targetVol - currentVol) * 0.1;
      const scale = 1.0 + currentVol * 0.3;
      orbElements.forEach((orb) => {
        orb.style.transform = `translate(-50%, -50%) scale(${scale})`;
      });

      if (s === "IDLE") {
        lastRingPulseState.current = null;
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
        if (lastRingPulseState.current !== "LISTENING") {
          startRingPulse("rgba(0, 242, 254, 0.3)");
          lastRingPulseState.current = "LISTENING";
        }
      } else if (s === "THINKING") {
        lastRingPulseState.current = null;
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
        if (lastRingPulseState.current !== "SPEAKING") {
          startRingPulse("rgba(99, 102, 241, 0.3)");
          lastRingPulseState.current = "SPEAKING";
        }
      }

      renderWaveLoop();
    };
    renderLoop();

    const handleResize = () => updateLayout();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("resize", handleResize);
      blobAnimations.current.forEach((anim) => {
        if (anim) anim.pause();
      });
      blobAnimations.current = [];
      orbElements.forEach((orb) => orb.remove());
      container
        .querySelectorAll(".hologram-particle")
        .forEach((p) => p.remove());
    };
  }, [
    isOpen,
    isAudioActive,
    mountRef,
    stateRef,
    singleOrbRef,
    analyserRef,
    dataArrayRef,
  ]);
};

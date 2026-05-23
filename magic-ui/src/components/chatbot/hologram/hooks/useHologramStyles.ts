import { useEffect } from "react";

export const useHologramStyles = () => {
  useEffect(() => {
    const styleId = "hologram-orb-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .hologram-orb-container { position: absolute; width: 200px; height: 200px; display: flex; justify-content: center; align-items: center; border-radius: 50%; z-index: 10; pointer-events: none; }
      .hologram-orb-visual { position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; border-radius: 50%; transform-origin: center; will-change: transform; }
      .hologram-orb-core { position: absolute; width: 100%; height: 100%; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%); z-index: 5; mix-blend-mode: overlay; }
      .hologram-blob { position: absolute; width: 60%; height: 60%; border-radius: 50%; filter: blur(25px); mix-blend-mode: screen; opacity: 0.8; will-change: transform, border-radius; }
      .hologram-blob-1 { background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); }
      .hologram-blob-2 { background: linear-gradient(135deg, #ff0844 0%, #ffb199 100%); }
      .hologram-blob-3 { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); }
      .hologram-blob-4 { background: linear-gradient(135deg, #0052d4 0%, #4364f7 100%); }
      .hologram-particle { position: absolute; width: 4px; height: 4px; background: #fff; border-radius: 50%; opacity: 0; box-shadow: 0 0 10px 2px rgba(255,255,255,0.5); }
      .hologram-outer-ring { position: absolute; border-radius: 50%; border: 1px solid transparent; box-shadow: 0 0 20px rgba(255, 255, 255, 0.05) inset; opacity: 0; will-change: transform, opacity; }
      .hologram-wave-container { position: absolute; z-index: 30; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.7s; width: 140%; height: 32px; pointer-events: none; mix-blend-mode: screen; }
      .hologram-wave-container svg { width: 100%; height: 100%; overflow: visible; }
      .hologram-wave-path { will-change: d; stroke-linecap: round; stroke-linejoin: round; }
    `;
    document.head.appendChild(style);

    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);
};

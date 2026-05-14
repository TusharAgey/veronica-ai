import React from "react";

interface HologramControlsProps {
  singleOrbMode: boolean;
  toggleSingleOrb: () => void;
  closeModal: () => void;
}

export const HologramControls: React.FC<HologramControlsProps> = ({
  singleOrbMode,
  toggleSingleOrb,
  closeModal,
}) => {
  return (
    <div
      className={
        singleOrbMode
          ? "fixed top-6 right-6 z-[10000] flex flex-col items-center gap-3"
          : "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] flex flex-col items-center gap-3"
      }
    >
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
  );
};

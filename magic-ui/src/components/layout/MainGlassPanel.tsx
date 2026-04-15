interface MainGlassPanelProps {
  children: React.ReactNode;
  theme: "dark" | "midnight";
  blurValue: number;
}

export function MainGlassPanel({
  children,
  theme,
  blurValue,
}: MainGlassPanelProps) {
  const baseClasses =
    "flex-1 flex flex-col relative overflow-hidden border rounded-[2.5rem] p-8 transition-all duration-1000";
  const themeClasses =
    theme === "midnight"
      ? "bg-black/[0.2] border-white/[0.02] shadow-[0_8px_32px_0_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)]"
      : "bg-white/[0.04] border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)]";

  return (
    <main
      className={`${baseClasses} ${themeClasses}`}
      style={{ backdropFilter: `blur(${blurValue}px) saturate(180%)` }}
    >
      {children}
    </main>
  );
}

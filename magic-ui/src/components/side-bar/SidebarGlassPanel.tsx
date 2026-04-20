import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface SidebarGlassPanelProps {
  children: React.ReactNode;
  isCollapsed: boolean;
  blurValue: number;
}
interface SidebarGlassPanelProps {
  children: React.ReactNode;
  isCollapsed: boolean;
  blurValue: number;
}

export function SidebarGlassPanel({
  children,
  isCollapsed,
  blurValue,
}: SidebarGlassPanelProps) {
  // 1. Add a quick listener to check if we are on a mobile screen
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const baseClasses =
    "relative overflow-hidden border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)] bg-white/[0.04]";
  const layoutClasses = "flex flex-col items-center py-6 px-3 rounded-[2rem]";

  return (
    <motion.aside
      layout
      initial={false}
      animate={{
        width: isMobile ? "100%" : isCollapsed ? 80 : 256,
        // FIX: Restored the logic so desktop shrinks to "auto" when collapsed!
        height: isMobile ? "auto" : isCollapsed ? "auto" : "100%",
      }}
      transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
      // Added max-w-md on mobile so it doesn't look stretched out on giant tablets
      className={`${baseClasses} ${layoutClasses} ${isMobile ? "max-w-md mx-auto py-3 px-4" : ""}`}
      style={{ backdropFilter: `blur(${blurValue}px) saturate(180%)` }}
    >
      {children}
    </motion.aside>
  );
}

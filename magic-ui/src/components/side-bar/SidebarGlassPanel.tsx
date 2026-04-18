import { motion } from "framer-motion";

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
  const baseClasses =
    "relative flex flex-col overflow-hidden bg-white/[0.04] border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)]";
  const layoutClasses = isCollapsed
    ? "rounded-[3rem] py-6 px-3"
    : "rounded-[2.5rem] p-6";

  return (
    <motion.aside
      layout
      initial={false}
      animate={{
        width: isCollapsed ? 80 : 256,
        height: isCollapsed ? "auto" : "100%",
      }}
      transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
      className={`${baseClasses} ${layoutClasses}`}
      style={{ backdropFilter: `blur(${blurValue}px) saturate(180%)` }}
    >
      {children}
    </motion.aside>
  );
}

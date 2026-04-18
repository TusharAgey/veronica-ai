import { motion, AnimatePresence } from "framer-motion";

interface SidebarNavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}

export function SidebarNavItem({
  icon,
  label,
  isActive,
  onClick,
  isCollapsed,
}: SidebarNavItemProps) {
  const baseClasses =
    "relative flex items-center transition-colors duration-300 w-full whitespace-nowrap group z-10";

  // FIX 1: Shrunk from w-12 h-12 down to w-10 h-10 when collapsed so it doesn't touch the track's border
  const layoutClasses = isCollapsed
    ? "justify-center w-10 h-10 mx-auto"
    : "gap-3 px-4 py-3 h-12 text-left";

  const textClasses = isActive
    ? "text-white"
    : "text-white/50 group-hover:text-white/90";

  return (
    <button
      onClick={onClick}
      title={isCollapsed ? label : ""}
      className={`${baseClasses} ${layoutClasses} ${textClasses}`}
    >
      {/* THE LIQUID DROPLET */}
      {isActive && (
        <motion.div
          layoutId="active-drop"
          // FIX 2: Restored the vibrant purple background and glow
          className={`absolute inset-0 z-[-1] bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] ${
            isCollapsed ? "rounded-full" : "rounded-2xl"
          }`}
          transition={{
            type: "spring",
            stiffness: 180,
            damping: 20,
            mass: 1.2,
          }}
        />
      )}

      {/* ICON */}
      <div className="shrink-0 relative z-10 transition-transform group-hover:scale-110 duration-300 flex items-center justify-center">
        {icon}
      </div>

      {/* TEXT */}
      <AnimatePresence mode="popLayout">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, width: "auto", filter: "blur(0px)" }}
            exit={{ opacity: 0, width: 0, filter: "blur(4px)" }}
            className="text-sm font-medium overflow-hidden relative z-10"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

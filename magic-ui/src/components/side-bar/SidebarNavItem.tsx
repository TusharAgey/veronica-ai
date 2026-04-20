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
  // THE FIX: When collapsed (mobile), strictly enforce a square w-12 h-12 so the
  // background droplet remains a perfect circle. When expanded, let it take full width.
  const layoutClasses = isCollapsed
    ? "justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full"
    : "justify-start px-4 py-3 w-full rounded-2xl";

  const textClasses = isActive
    ? "text-white"
    : "text-white/50 group-hover:text-white/90";

  return (
    <button
      onClick={onClick}
      title={isCollapsed ? label : ""}
      // Removed flex-1 so they don't stretch into ovals on mobile
      className={`relative flex items-center gap-3 transition-colors group cursor-pointer shrink-0 ${layoutClasses} ${textClasses}`}
    >
      {/* THE LIQUID DROPLET */}
      {isActive && (
        <motion.div
          layoutId="active-drop"
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
      <div className="shrink-0 relative z-10 transition-transform group-hover:scale-110 duration-300 flex items-center justify-center mx-auto md:mx-0">
        {icon}
      </div>

      {/* TEXT */}
      <AnimatePresence mode="popLayout">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, width: "auto", filter: "blur(0px)" }}
            exit={{ opacity: 0, width: 0, filter: "blur(4px)" }}
            className="text-sm font-medium overflow-hidden relative z-10 whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

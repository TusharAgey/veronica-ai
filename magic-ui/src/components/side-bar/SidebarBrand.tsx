import { motion, AnimatePresence } from "framer-motion";

interface SidebarBrandProps {
  isCollapsed: boolean;
}

export function SidebarBrand({ isCollapsed }: SidebarBrandProps) {
  return (
    <motion.div
      layout
      className={`flex items-center mb-10 ${isCollapsed ? "justify-center" : "gap-3 px-2"}`}
    >
      <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(99,102,241,0.5)] text-white shrink-0 font-bold">
        V
      </div>
      <AnimatePresence mode="popLayout">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="text-xl font-bold tracking-wider text-white whitespace-nowrap overflow-hidden"
          >
            ASSISTANT
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

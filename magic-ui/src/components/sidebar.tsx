import {
  LayoutDashboard,
  Lock,
  Book,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  // Accept blurValue prop
  blurValue: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  blurValue,
}: SidebarProps) {
  return (
    <div className="relative h-full flex items-center z-20 shrink-0">
      <motion.aside
        layout
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 256,
          height: isCollapsed ? "auto" : "100%",
        }}
        transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
        // 1. Removed backdrop-blur-3xl saturate-[180%] from className
        className={`relative flex flex-col overflow-hidden bg-white/[0.04] border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)] ${
          isCollapsed ? "rounded-[3rem] py-6 px-3" : "rounded-[2.5rem] p-6"
        }`}
        // 2. Added dynamic blur inline style
        style={{ backdropFilter: `blur(${blurValue}px) saturate(180%)` }}
      >
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

        <motion.nav layout className="flex flex-col gap-3 w-full">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            isActive={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<Lock size={20} />}
            label="Passwords"
            isActive={activeTab === "passwords"}
            onClick={() => setActiveTab("passwords")}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<Book size={20} />}
            label="Journal"
            isActive={activeTab === "journal"}
            onClick={() => setActiveTab("journal")}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<MessageSquare size={20} />}
            label="Chatbot"
            isActive={activeTab === "chatbot"}
            onClick={() => setActiveTab("chatbot")}
            isCollapsed={isCollapsed}
          />
        </motion.nav>
      </motion.aside>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors shadow-2xl z-50"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick, isCollapsed }: any) {
  return (
    <button
      onClick={onClick}
      title={isCollapsed ? label : ""}
      className={`flex items-center transition-all duration-300 w-full whitespace-nowrap ${
        isCollapsed
          ? "justify-center p-3 rounded-full"
          : "gap-3 px-4 py-3 rounded-2xl text-left"
      } ${
        isActive
          ? "bg-white/[0.08] border border-white/[0.15] shadow-[0_0_20px_rgba(120,113,255,0.2)] text-white scale-105"
          : "text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent"
      }`}
    >
      <div className="shrink-0">{icon}</div>
      <AnimatePresence mode="popLayout">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="text-sm font-medium overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

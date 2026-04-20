import {
  LayoutDashboard,
  Lock,
  Book,
  Bot,
  BotMessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";

import { SidebarGlassPanel } from "./side-bar/SidebarGlassPanel";
import { SidebarBrand } from "./side-bar/SidebarBrand";
import { SidebarNavItem } from "./side-bar/SidebarNavItem";
import { SidebarToggle } from "./side-bar/SidebarToggle";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  blurValue: number;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { id: "passwords", label: "Passwords", icon: <Lock size={20} /> },
  { id: "journal", label: "Journal", icon: <Book size={20} /> },
  { id: "chatbot", label: "Chatbot", icon: <BotMessageSquare size={20} /> },
  { id: "hologram", label: "Hologram", icon: <Bot size={20} /> },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  blurValue,
}: SidebarProps) {
  const isEffectivelyCollapsed =
    isCollapsed || (typeof window !== "undefined" && window.innerWidth < 768);
  return (
    // 1. Mobile: Fixed horizontal dock at the bottom. Desktop: Relative vertical panel.
    <div className="fixed bottom-4 left-4 right-4 md:relative md:bottom-auto md:left-auto md:right-auto md:h-full flex items-center justify-center md:justify-start z-50 md:z-20 shrink-0">
      <SidebarGlassPanel
        isCollapsed={isEffectivelyCollapsed}
        blurValue={blurValue}
      >
        {/* 2. Hide brand logo on mobile to save space */}
        <div className="hidden md:block">
          <SidebarBrand isCollapsed={isEffectivelyCollapsed} />
        </div>

        {/* 3. Switch axis: flex-row on mobile, flex-col on desktop */}
        <motion.nav
          layout
          className={`flex flex-row md:flex-col gap-2 relative w-full justify-between md:justify-start ${
            isEffectivelyCollapsed
              ? "bg-black/40 md:bg-black/20 rounded-full p-1.5 md:border border-white/5 md:shadow-inner backdrop-blur-xl"
              : ""
          }`}
        >
          {NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
              isCollapsed={isEffectivelyCollapsed}
            />
          ))}
        </motion.nav>
      </SidebarGlassPanel>

      {/* 4. Hide the expand toggle on mobile since it's always a compact dock */}
      <div className="hidden md:block">
        <SidebarToggle
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
      </div>
    </div>
  );
}

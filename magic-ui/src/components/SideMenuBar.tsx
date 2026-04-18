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
  return (
    <div className="relative h-full flex items-center z-20 shrink-0">
      <SidebarGlassPanel isCollapsed={isCollapsed} blurValue={blurValue}>
        <SidebarBrand isCollapsed={isCollapsed} />

        {/* Liquid Drop Nav Items Track */}
        <motion.nav
          layout
          className={`flex flex-col gap-2 relative w-full ${
            // FIX 3: Increased padding to p-1.5 so the inner track is wider than the buttons
            isCollapsed
              ? "bg-black/20 rounded-full p-1.5 border border-white/5 shadow-inner"
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
              isCollapsed={isCollapsed}
            />
          ))}
        </motion.nav>
      </SidebarGlassPanel>

      {/* Floating Toggle placed OUTSIDE the Glass Panel to prevent clipping */}
      <SidebarToggle
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />
    </div>
  );
}

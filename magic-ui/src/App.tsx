import { useState, useEffect } from "react";
import { User, Settings as SettingsIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "./components/sidebar";
import Settings from "./components/Settings";
import Dashboard from "./components/Dashboard";
import PasswordManager from "./components/PasswordManager";
import Journal from "./components/Journal";
import Chatbot from "./components/Chatbot";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Theme state: 'dark' (Room) or 'midnight' (Obsidian Space)
  const [theme, setTheme] = useState<"dark" | "midnight">("dark");

  // Lifted state for the blur intensity (0px to 100px)
  // Let's default it to 24px, which is similar to backdrop-blur-3xl
  const [blurValue, setBlurValue] = useState(24);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    if (theme === "midnight") {
      root.style.setProperty("--glass-bg", "rgba(5, 5, 10, 0.6)");
    } else {
      root.style.setProperty("--glass-bg", "rgba(15, 15, 26, 0.4)");
    }
  }, [theme]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden text-slate-50 bg-black">
      {/* --- THE ENVIRONMENTS --- */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-black">
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${theme === "dark" ? "opacity-100" : "opacity-0"}`}
        >
          <img
            src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2564&auto=format&fit=crop"
            alt="Dark Room"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a]/80 to-transparent" />
        </div>
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${theme === "midnight" ? "opacity-100" : "opacity-0"}`}
        >
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
            alt="Midnight Environment"
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/40" />
        </div>
      </div>

      {/* --- UI LAYER --- */}
      <div className="relative z-10 flex w-full h-full p-6 md:p-10 gap-8">
        <Settings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          setTheme={setTheme}
          blurValue={blurValue}
          setBlurValue={setBlurValue}
        />

        {/* Passing blurValue to Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          blurValue={blurValue}
        />

        {/* --- MAIN GLASS PANEL --- */}
        <main
          // 1. Remove backdrop-blur-3xl and saturate-[180%] from className
          className={`flex-1 flex flex-col relative overflow-hidden border rounded-[2.5rem] p-8 transition-all duration-1000 ${
            theme === "midnight"
              ? "bg-black/[0.2] border-white/[0.02] shadow-[0_8px_32px_0_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)]"
              : "bg-white/[0.02] border-white/[0.05] shadow-[0_8px_32px_0_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)]"
          }`}
          // 2. Add dynamic blur via inline style
          style={{ backdropFilter: `blur(${blurValue}px) saturate(180%)` }}
        >
          <header className="h-16 flex items-center justify-between mb-6 shrink-0">
            <h1 className="text-2xl font-semibold capitalize tracking-wide text-white">
              {activeTab === "passwords" ? "Convert Crypto" : activeTab}
            </h1>

            <div
              className={`flex items-center gap-4 px-4 py-2 backdrop-blur-xl rounded-full shadow-inner transition-colors duration-1000 ${
                theme === "midnight"
                  ? "bg-black/40 border border-white/5"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              <User size={16} className="text-white/50" />
              <span className="text-sm font-medium pr-2 border-r border-white/10 text-white/80">
                Good Afternoon!
              </span>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="hover:rotate-90 transition-transform duration-300 pl-2"
              >
                <SettingsIcon
                  size={16}
                  className="text-white/50 hover:text-white"
                />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto pb-4 pr-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full"
              >
                {activeTab === "dashboard" && <Dashboard />}
                {activeTab === "passwords" && <PasswordManager />}
                {activeTab === "journal" && <Journal />}
                {activeTab === "chatbot" && <Chatbot />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

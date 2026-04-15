import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Views & Modals
import Sidebar from "./components/Sidebar";
import Settings from "./components/Settings";
import Dashboard from "./components/Dashboard";
import PasswordManager from "./components/PasswordManager";
import Journal from "./components/Journal";
import Chatbot from "./components/Chatbot";
import HologramModal from "./components/chatbot/HologramModal";
// Extracted Layout Components
import { SpatialEnvironment } from "./components/layout/SpatialEnvironment";
import { MainGlassPanel } from "./components/layout/MainGlassPanel";
import { TopHeader } from "./components/layout/TopHeader";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<"dark" | "midnight">("dark");
  const [blurValue, setBlurValue] = useState(24);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <>
      {activeTab === "hologram" ? (
        <>
          <input id="user-text-input" hidden></input>
          <HologramModal
            isOpen={true}
            onClose={() => setActiveTab("chatbot")}
          />
        </>
      ) : (
        <div className="fixed inset-0 w-full h-full overflow-hidden text-slate-50 bg-black">
          <SpatialEnvironment />

          {/* UI LAYER */}
          <div className="relative z-10 flex w-full h-full p-6 md:p-10 gap-8">
            <Settings
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              theme={theme}
              setTheme={setTheme}
              blurValue={blurValue}
              setBlurValue={setBlurValue}
            />

            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
              blurValue={blurValue}
            />

            <MainGlassPanel theme={theme} blurValue={blurValue}>
              <TopHeader
                activeTab={activeTab}
                theme={theme}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />

              {/* DYNAMIC VIEW ROUTER */}
              <div className="flex-1 overflow-y-auto pb-4 pr-2 z-10">
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
            </MainGlassPanel>
          </div>
        </div>
      )}
    </>
  );
}

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Views & Modals
import Sidebar from "./components/SideMenuBar";
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [theme, setTheme] = useState<"dark" | "midnight">("dark");
  const [blurValue, setBlurValue] = useState(5);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // ── Mobile Keyboard: visualViewport API ──────────────────────
  // Detects when the virtual keyboard opens/closes and adjusts the
  // app container height so no whitespace appears above the keyboard.
  const handleViewportResize = useCallback(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const root = document.getElementById("root");
    if (!root) return;

    // Use the layout viewport (innerHeight) instead of screen.height to
    // avoid false positives from browser chrome (URL bar, toolbars, etc.)
    // on mobile. screen.height includes the area behind browser chrome,
    // so its delta with visualViewport.height can exceed 100 even when
    // the keyboard is closed. innerHeight already excludes browser chrome,
    // so a significant delta reliably indicates the keyboard is open.
    const layoutHeight = window.innerHeight;
    const viewportHeight = vv.height;
    const offsetTop = vv.offsetTop;

    // Only apply keyboard detection on touch-capable devices to avoid
    // treating desktop browser chrome (toolbar, address bar, etc.) as a keyboard.
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) {
      root.style.height = "";
      root.classList.remove("keyboard-open");
      setKeyboardHeight(0);
      return;
    }

    // Also require an active editable element to confirm the keyboard is
    // actually open. On mobile, the visual viewport can shrink due to
    // browser chrome (URL bar collapsing, etc.) without the keyboard
    // being present.
    const activeEl = document.activeElement;
    const isEditable =
      activeEl &&
      (activeEl.tagName === "INPUT" ||
        activeEl.tagName === "TEXTAREA" ||
        (activeEl as HTMLElement).isContentEditable);

    // If the visual viewport is significantly smaller than the layout viewport
    // AND it's shifted up (keyboard is open), pin the root height.
    const diff = layoutHeight - viewportHeight;
    const keyboardThreshold = 100; // ignore tiny differences (e.g. URL bar)

    if (diff > keyboardThreshold && offsetTop === 0 && isEditable) {
      // Keyboard is open — pin root to the visual viewport height
      root.style.height = `${viewportHeight}px`;
      root.classList.add("keyboard-open");
      setKeyboardHeight(diff);
    } else {
      // Keyboard is closed — restore natural height
      root.style.height = "";
      root.classList.remove("keyboard-open");
      setKeyboardHeight(0);
    }
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    // Listen to both resize and scroll events on visualViewport
    vv.addEventListener("resize", handleViewportResize);
    vv.addEventListener("scroll", handleViewportResize);

    // Run once on mount to catch any initial state
    handleViewportResize();

    return () => {
      vv.removeEventListener("resize", handleViewportResize);
      vv.removeEventListener("scroll", handleViewportResize);
    };
  }, [handleViewportResize]);

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
          <div
            className={`relative z-10 flex flex-col md:flex-row w-full h-full p-2 md:p-10 gap-3 md:gap-8 ${keyboardHeight > 0 ? "pb-4" : "pb-24 md:pb-10"}`}
          >
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
              <div className="flex-1 overflow-y-auto px-1 md:pr-2 z-10">
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

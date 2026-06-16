import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Views & Modals — lazy-loaded for code splitting
const Sidebar = lazy(() => import("./components/SideMenuBar"));
const Settings = lazy(() => import("./components/Settings"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const PasswordManager = lazy(() => import("./components/PasswordManager"));
const Journal = lazy(() => import("./components/Journal"));
const Chatbot = lazy(() => import("./components/Chatbot"));
const HologramModal = lazy(
  () => import("./components/chatbot/hologram/HologramModal"),
);
// Extracted Layout Components
import { SpatialEnvironment } from "./components/layout/SpatialEnvironment";
import { MainGlassPanel } from "./components/layout/MainGlassPanel";
import { TopHeader } from "./components/layout/TopHeader";
import { ViewSkeleton } from "./components/ui/Skeleton";

function ViewFallback() {
  return <ViewSkeleton />;
}

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

    // If the visual viewport is significantly smaller than the layout viewport,
    // pin the root height. Removed offsetTop check because it's unreliable on
    // mobile — some browsers report offsetTop=0 even without a keyboard open,
    // which was causing position:fixed to be applied and breaking touch scroll.
    const diff = layoutHeight - viewportHeight;
    const keyboardThreshold = 150; // ignore tiny differences (e.g. URL bar)

    if (diff > keyboardThreshold && isEditable) {
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
          <Suspense fallback={<ViewFallback />}>
            <HologramModal
              isOpen={true}
              onClose={() => setActiveTab("chatbot")}
            />
          </Suspense>
        </>
      ) : (
        <div className="fixed inset-0 w-full h-full overflow-y-auto text-slate-50 bg-black">
          <SpatialEnvironment />

          {/* UI LAYER */}
          <div
            className={`relative z-10 flex flex-col md:flex-row w-full h-full p-2 md:p-10 gap-3 md:gap-8 ${keyboardHeight > 0 ? "pb-4" : "pb-24 md:pb-10"}`}
          >
            <Suspense fallback={null}>
              <Settings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                theme={theme}
                setTheme={setTheme}
                blurValue={blurValue}
                setBlurValue={setBlurValue}
              />
            </Suspense>

            <Suspense fallback={null}>
              <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
                blurValue={blurValue}
              />
            </Suspense>

            <MainGlassPanel theme={theme} blurValue={blurValue}>
              <TopHeader
                activeTab={activeTab}
                theme={theme}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />

              {/* DYNAMIC VIEW ROUTER */}
              <div className="flex-1 overflow-y-auto px-1 md:pr-2 z-10 pt-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{
                      opacity: 0,
                      y: 30,
                      scale: 0.97,
                      filter: "blur(8px)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      y: -20,
                      scale: 0.97,
                      filter: "blur(8px)",
                    }}
                    transition={{
                      duration: 0.35,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="h-full"
                  >
                    <Suspense fallback={<ViewFallback />}>
                      {activeTab === "dashboard" && <Dashboard />}
                      {activeTab === "passwords" && <PasswordManager />}
                      {activeTab === "journal" && <Journal />}
                      {activeTab === "chatbot" && <Chatbot />}
                    </Suspense>
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

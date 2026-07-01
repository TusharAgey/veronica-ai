import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

// --- TYPES ---
type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  error: (message: string) => void;
  success: (message: string) => void;
}

// --- CONTEXT ---
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- HELPER FOR ICONS & COLORS ---
const getToastStyles = (type: ToastType) => {
  switch (type) {
    case "error":
      return {
        icon: <AlertCircle size={18} className="text-red-400" />,
        border: "border-red-500/30",
        glow: "shadow-[0_0_15px_rgba(239,68,68,0.2)]",
      };
    case "success":
      return {
        icon: <CheckCircle2 size={18} className="text-green-400" />,
        border: "border-green-500/30",
        glow: "shadow-[0_0_15px_rgba(34,197,94,0.2)]",
      };
    default:
      return {
        icon: <Info size={18} className="text-indigo-400" />,
        border: "border-indigo-500/30",
        glow: "shadow-[0_0_15px_rgba(99,102,241,0.2)]",
      };
  }
};

// --- PROVIDER ---
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    setToasts((prev) => {
      // If a toast with this exact message is already on the screen, ignore the new one!
      if (prev.some((t) => t.message === message)) return prev;

      const id = Math.random().toString(36).substring(2, 9);

      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, 4000);

      return [...prev, { id, message, type }];
    });
  }, []);
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  const contextValue = useMemo(
    () => ({
      toast: addToast,
      error: (msg: string) => addToast(msg, "error"),
      success: (msg: string) => addToast(msg, "success"),
    }),
    [addToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* --- TOAST CONTAINER (Top Center for mobile safety, Top Right for Desktop) --- */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4 z-[9999] flex flex-col gap-3 w-[90%] max-w-sm pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const { icon, border, glow } = getToastStyles(t.type);
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                transition={{ type: "spring", bounce: 0.3 }}
                className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl backdrop-blur-3xl saturate-[180%] bg-[#1a1a24]/90 border ${border} ${glow}`}
              >
                <div className="shrink-0">{icon}</div>
                <p className="flex-1 text-sm font-medium text-white/90">
                  {t.message}
                </p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// --- CUSTOM HOOK ---
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

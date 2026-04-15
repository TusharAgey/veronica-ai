import { User, Settings as SettingsIcon } from "lucide-react";
import { getGreetingByTime } from "../../utilities/utils";
interface TopHeaderProps {
  activeTab: string;
  theme: "dark" | "midnight";
  onOpenSettings: () => void;
}

export function TopHeader({
  activeTab,
  theme,
  onOpenSettings,
}: TopHeaderProps) {
  const title = activeTab === "passwords" ? "Password Manager" : activeTab;

  const profileClasses =
    theme === "midnight"
      ? "bg-black/40 border border-white/5"
      : "bg-white/10 border border-white/10";

  return (
    <header
      className={
        activeTab === "chatbot"
          ? "h-16 flex items-center justify-between shrink-0 z-20"
          : "h-16 flex items-center justify-between mb-6 shrink-0 z-20"
      }
    >
      <h1 className="text-2xl font-semibold capitalize tracking-wide text-white">
        {title}
      </h1>

      <div
        className={`flex items-center gap-4 px-4 py-2 backdrop-blur-xl rounded-full shadow-inner transition-colors duration-1000 ${profileClasses}`}
      >
        <User size={16} className="text-white/50" />
        <span className="text-sm font-medium pr-2 border-r border-white/10 text-white/80">
          Good {getGreetingByTime()}!
        </span>
        <button
          onClick={onOpenSettings}
          className="hover:rotate-90 transition-transform duration-300 pl-2"
        >
          <SettingsIcon size={16} className="text-white/50 hover:text-white" />
        </button>
      </div>
    </header>
  );
}

import { Send, InfoIcon } from "lucide-react";
import { useGetActiveLLMModelQuery } from "../../services/api";

interface ChatInputProps {
  activeBot: string;
}

export function ChatInput({ activeBot }: ChatInputProps) {
  const { data: activeLLMModel } = useGetActiveLLMModelQuery();
  return (
    <div className="mt-auto relative z-10">
      <div className="flex items-center p-2 gap-2 rounded-full backdrop-blur-3xl saturate-[180%] bg-white/[0.04] border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)]">
        <div title={activeLLMModel ?? "not-loaded"} style={{ padding: "15px" }}>
          <InfoIcon height={20} />
        </div>

        <input
          type="text"
          placeholder={`Type your message to ${activeBot}...`}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 px-2"
        />

        <button className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center hover:bg-indigo-400 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          <Send size={18} className="ml-1 text-white" />
        </button>
      </div>
    </div>
  );
}

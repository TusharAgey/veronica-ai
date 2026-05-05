import { useState, useRef, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import type { Components } from "react-markdown";
import type { ChatTurn } from "../../services/types";

interface ChatProps {
  chats: ChatTurn[];
}
// --- THE TYPING INDICATOR PILL ---
const TypingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex w-max max-w-[85%] md:max-w-[75%] mr-auto mb-4"
    >
      <div className="flex items-center gap-1.5 px-5 py-4 rounded-3xl rounded-tl-sm backdrop-blur-2xl saturate-[180%] bg-indigo-500/10 border border-indigo-500/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
        {/* The 3 bouncing dots */}
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            className="w-2 h-2 rounded-full bg-indigo-400"
            animate={{
              y: [0, -6, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: dot * 0.2, // Stagger the bounce!
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
// --- NEW: Isolated CodeBlock component to handle its own copy state ---
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    // Reset back to the copy icon after 2 seconds
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#121212]">
      {/* Syntax Header Bar with Copy Button */}
      <div className="bg-white/5 px-4 py-2 text-xs font-mono text-white/40 border-b border-white/5 uppercase tracking-wider flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500/50" />
          <span className="w-2 h-2 rounded-full bg-yellow-500/50" />
          <span className="w-2 h-2 rounded-full bg-green-500/50" />
          {language && <span className="ml-2">{language}</span>}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          title="Copy code to clipboard"
        >
          {isCopied ? (
            <>
              <Check size={14} className="text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* The Code */}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-cyan-300 whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}

function extractText(node: any): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }
  if (node?.props?.children) {
    return extractText(node.props.children);
  }
  return "";
}

const components: Components = {
  pre({ children }) {
    const codeEl = children as any;
    const className = codeEl?.props?.className || "";
    const language = className.replace("language-", "");
    const raw = codeEl?.props?.children;
    const code = extractText(raw).replace(/\n$/, "");
    return <CodeBlock language={language} code={code} />;
  },

  code({ children }) {
    return (
      <code className="bg-white/10 px-1 py-0.5 rounded font-mono text-sm">
        {children}
      </code>
    );
  },

  p({ children }) {
    const text = String(children).trim();
    if (/^[^a-zA-Z0-9]+$/.test(text) && text.length < 4) {
      return null;
    }
    return (
      <p className="text-white/90 leading-relaxed text-[15px]">{children}</p>
    );
  },

  table({ children }) {
    return (
      <div className="overflow-x-auto my-3">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    );
  },

  th({ children }) {
    return (
      <th className="border px-3 py-2 text-left bg-white/5">{children}</th>
    );
  },

  td({ children }) {
    return <td className="border px-3 py-2">{children}</td>;
  },

  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 underline"
      >
        {children}
      </a>
    );
  },
};

function MessageFormatter({ text }: { text: string }) {
  if (!text?.trim()) return <TypingIndicator />;

  return (
    <div className="prose prose-invert max-w-none prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={components}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export function ChatMessageList({ chats }: ChatProps) {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current && messagesEndRef.current.scrollIntoView();
  });
  return (
    <div className="flex-1 overflow-y-auto pt-4 pb-4 px-2 flex flex-col gap-8 scrollbar-hide z-10">
      {[...chats].map((chat, idx) => (
        <div key={idx} className="flex flex-col gap-6 w-full">
          {/* USER MESSAGE (Right Aligned, Cyan Pill) */}
          <div className="flex justify-end w-full">
            <div className="bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] text-white px-6 py-3 rounded-t-2xl rounded-l-2xl rounded-br-sm   max-w-[80%] text-[15px] font-medium">
              {chat.user}
            </div>
          </div>

          {/* LLM MESSAGE (Left Aligned, Dark Card) */}
          {chat.assistant === "" ? (
            <TypingIndicator />
          ) : (
            <div className="flex justify-start w-full">
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-5 rounded-r-2xl rounded-b-2xl rounded-tl-sm shadow-xl max-w-[90%]">
                <MessageFormatter text={chat.assistant} />
              </div>
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

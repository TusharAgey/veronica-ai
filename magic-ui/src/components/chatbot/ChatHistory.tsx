import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  MessageSquare,
  Code,
  Orbit,
  Sparkles,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  createSession,
  deleteSession,
  renameSession,
  setActiveSession,
  toggleHistoryPanel,
  setSearchQuery,
} from "../../store/chatsSlice";
import { formatRelativeTime } from "../../utilities/utils";
import type { ChatSessionMeta } from "../../services/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getBotIcon = (botName: string) => {
  if (botName.includes("Code")) return <Code size={16} />;
  if (botName.includes("Space") || botName.includes("Galaxy"))
    return <Orbit size={16} />;
  return <Sparkles size={16} />;
};

/**
 * Group sessions by date buckets: Today, Yesterday, This Week, This Month, Older
 */
function groupSessionsByDate(
  sessions: ChatSessionMeta[],
): Array<{ label: string; sessions: ChatSessionMeta[] }> {
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const yesterdayStart = todayStart - 86_400_000;
  const weekStart = todayStart - now.getDay() * 86_400_000;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const groups: Record<string, ChatSessionMeta[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    "This Month": [],
    Older: [],
  };

  for (const s of sessions) {
    if (s.updatedAt >= todayStart) {
      groups["Today"].push(s);
    } else if (s.updatedAt >= yesterdayStart) {
      groups["Yesterday"].push(s);
    } else if (s.updatedAt >= weekStart) {
      groups["This Week"].push(s);
    } else if (s.updatedAt >= monthStart) {
      groups["This Month"].push(s);
    } else {
      groups["Older"].push(s);
    }
  }

  return Object.entries(groups)
    .filter(([_, s]) => s.length > 0)
    .map(([label, s]) => ({ label, sessions: s }));
}

// ─── Confirmation Dialog ─────────────────────────────────────────────────────

function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#1a1a24] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-white/60 text-sm mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Context Menu ────────────────────────────────────────────────────────────

function ContextMenu({
  isOpen,
  position,
  onClose,
  onRename,
  onDelete,
}: {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-[90] min-w-[180px] rounded-2xl backdrop-blur-2xl bg-[#1a1a24]/95 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-1.5 overflow-hidden"
      style={{ left: position.x, top: position.y }}
    >
      <button
        onClick={() => {
          onRename();
          onClose();
        }}
        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
      >
        <Pencil size={15} />
        Rename
      </button>
      <div className="h-px bg-white/5 my-1" />
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
      >
        <Trash2 size={15} />
        Delete
      </button>
    </div>
  );
}

// ─── Main ChatHistory Panel ──────────────────────────────────────────────────

export default function ChatHistory() {
  const dispatch = useAppDispatch();
  const { sessions, activeSessionId, searchQuery, panelOpen } = useAppSelector(
    (state) => state.chats,
  );

  const [contextMenu, setContextMenu] = useState<{
    sessionId: string;
    x: number;
    y: number;
  } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus rename input when it appears
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  // Debounced search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        dispatch(setSearchQuery(value));
      }, 300);
    },
    [dispatch],
  );

  // Filter sessions by search query
  const filteredSessions = useMemo(() => {
    const allSessions = Object.values(sessions);
    if (!searchQuery.trim()) return allSessions;
    const q = searchQuery.toLowerCase();
    return allSessions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.bot.toLowerCase().includes(q) ||
        s.lastMessagePreview.toLowerCase().includes(q),
    );
  }, [sessions, searchQuery]);

  // Sort by updatedAt descending
  const sortedSessions = useMemo(
    () => [...filteredSessions].sort((a, b) => b.updatedAt - a.updatedAt),
    [filteredSessions],
  );

  // Group by date
  const groupedSessions = useMemo(
    () => groupSessionsByDate(sortedSessions),
    [sortedSessions],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleNewChat = () => {
    // Find the bot of the active session, or default to "Code Bot"
    const activeBot = activeSessionId
      ? (sessions[activeSessionId]?.bot ?? "Code Bot")
      : "Code Bot";
    dispatch(createSession({ bot: activeBot }));
  };

  const handleSelectSession = (id: string) => {
    dispatch(setActiveSession(id));
    dispatch(toggleHistoryPanel());
  };

  const handleContextMenu = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    setContextMenu({ sessionId, x: e.clientX, y: e.clientY });
  };

  const handleStartRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
  };

  const handleSaveRename = (id: string) => {
    if (renameValue.trim()) {
      dispatch(renameSession({ id, name: renameValue.trim() }));
    }
    setRenamingId(null);
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      dispatch(deleteSession(confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop overlay */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            onClick={() => dispatch(toggleHistoryPanel())}
          />
        )}
      </AnimatePresence>

      {/* Slide-out panel */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-40 w-full max-w-sm flex flex-col backdrop-blur-2xl bg-[#121212]/95 border-r border-white/10 shadow-[4px_0_32px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock size={18} className="text-indigo-400" />
                Chat History
              </h2>
              <button
                onClick={() => dispatch(toggleHistoryPanel())}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search + New Chat */}
            <div className="px-4 pt-3 pb-2 flex gap-2 shrink-0">
              <div className="flex-1 relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search conversations..."
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all"
                />
              </div>
              <button
                onClick={handleNewChat}
                className="shrink-0 w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition-colors shadow-[0_0_12px_rgba(99,102,241,0.3)] cursor-pointer"
                title="New Chat"
              >
                <Plus size={18} className="text-white" />
              </button>
            </div>

            {/* Session list */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-hide">
              {groupedSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <MessageSquare size={28} className="text-white/20" />
                  </div>
                  <p className="text-white/40 text-sm font-medium">
                    No chat history yet
                  </p>
                  <p className="text-white/20 text-xs mt-1">
                    Start a conversation to see it here
                  </p>
                </div>
              ) : (
                groupedSessions.map((group) => (
                  <div key={group.label}>
                    <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider px-2 mb-2">
                      {group.label}
                    </h3>
                    <div className="space-y-1">
                      {group.sessions.map((session, idx) => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: idx * 0.03,
                            ease: "easeOut",
                          }}
                          className={`group relative flex items-start gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
                            activeSessionId === session.id
                              ? "bg-indigo-500/15 border border-indigo-500/25"
                              : "hover:bg-white/5 border border-transparent"
                          }`}
                          onClick={() => handleSelectSession(session.id)}
                          onContextMenu={(e) =>
                            handleContextMenu(e, session.id)
                          }
                        >
                          {/* Bot icon */}
                          <div className="shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 mt-0.5">
                            {getBotIcon(session.bot)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Session name / rename input */}
                            {renamingId === session.id ? (
                              <input
                                ref={renameInputRef}
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onBlur={() => handleSaveRename(session.id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    handleSaveRename(session.id);
                                  if (e.key === "Escape") setRenamingId(null);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-white/10 border border-indigo-500/50 rounded-lg px-2 py-1 text-sm text-white outline-none"
                              />
                            ) : (
                              <p className="text-sm font-medium text-white truncate pr-6">
                                {session.name}
                              </p>
                            )}

                            {/* Last message preview */}
                            {session.lastMessagePreview && (
                              <p className="text-xs text-white/40 truncate mt-0.5">
                                {session.lastMessagePreview}
                              </p>
                            )}

                            {/* Meta row */}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[11px] text-white/30">
                                {formatRelativeTime(session.updatedAt)}
                              </span>
                              {session.messageCount > 0 && (
                                <>
                                  <span className="text-[11px] text-white/20">
                                    ·
                                  </span>
                                  <span className="text-[11px] text-white/30">
                                    {session.messageCount}{" "}
                                    {session.messageCount === 1
                                      ? "message"
                                      : "messages"}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Context menu button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContextMenu(e, session.id);
                            }}
                            className="absolute right-2 top-3 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer"
                          >
                            <MoreHorizontal size={15} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          isOpen={!!contextMenu}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onRename={() =>
            handleStartRename(
              contextMenu.sessionId,
              sessions[contextMenu.sessionId]?.name ?? "",
            )
          }
          onDelete={() => handleDelete(contextMenu.sessionId)}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Delete conversation?"
        message="This action cannot be undone. All messages in this conversation will be permanently deleted."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </>
  );
}

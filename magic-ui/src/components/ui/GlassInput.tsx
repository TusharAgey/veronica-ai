import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";

// Centralized style for the "Engraved Glass" look
const glassStyles =
  "w-full bg-black/40 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.1)] border border-black/50 focus:bg-black/60 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all";

export function GlassInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${glassStyles} ${className || ""}`} {...props} />;
}

export function GlassSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`${glassStyles} appearance-none cursor-pointer ${className || ""}`}
      {...props}
    >
      {children}
    </select>
  );
}

interface GlassSearchableSelectProps {
  /** Placeholder shown when no option is selected */
  placeholder?: string;
  /** List of options to display */
  options: string[];
  /** Currently selected value */
  value: string;
  /** Called when an option is selected */
  onChange: (value: string) => void;
  /** Optional className override */
  className?: string;
}

export function GlassSearchableSelect({
  placeholder = "Select account...",
  options,
  value,
  onChange,
  className,
}: GlassSearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search text
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase()),
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus the search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={`relative ${className || ""}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${glassStyles} flex items-center justify-between gap-2 cursor-pointer`}
      >
        <span className={value ? "text-white" : "text-white/30"}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-white/50 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[#0d0a1a]/95 backdrop-blur-lg border border-indigo-500/20 rounded-xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search accounts..."
              className="w-full bg-black/60 text-white text-sm pl-9 pr-4 py-3 outline-none border-b border-white/5 placeholder:text-white/30"
            />
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-white/40 text-center">
                No accounts found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/10 ${
                    option === value
                      ? "text-indigo-400 bg-indigo-500/20"
                      : "text-white/80"
                  }`}
                >
                  {option}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

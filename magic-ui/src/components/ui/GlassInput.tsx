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

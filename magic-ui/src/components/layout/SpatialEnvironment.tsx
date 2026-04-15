interface SpatialEnvironmentProps {
  theme: "dark" | "midnight";
}

export function SpatialEnvironment({ theme }: SpatialEnvironmentProps) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-black">
      {/* Studio / Dark Mode */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${theme === "dark" ? "opacity-100" : "opacity-0"}`}
      >
        <img
          src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2564&auto=format&fit=crop"
          alt="Dark Room"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      {/* Obsidian / Midnight Mode */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${theme === "midnight" ? "opacity-100" : "opacity-0"}`}
      >
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
          alt="Midnight Environment"
          className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/40" />
      </div>
    </div>
  );
}

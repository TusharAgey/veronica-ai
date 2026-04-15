import React, { useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "../../utilities/utils";

export function MagicCard({
  children,
  className,
  gradientSize = 250,
  gradientColor = "rgba(120, 113, 255, 0.15)",
  gradientOpacity = 1,
  ...props
}: any) {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative flex h-full w-full overflow-hidden rounded-[2rem] transition-all duration-300",
        // Increased baseline opacity and border for permanent visibility
        "bg-white/[0.06] border border-white/[0.12] shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]",
        "hover:bg-white/[0.08]",
        className,
      )}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)`,
          opacity: isHovered ? gradientOpacity : 0,
        }}
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}

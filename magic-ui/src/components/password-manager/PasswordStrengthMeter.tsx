import { useMemo } from "react";
import { cn } from "../../utilities/utils";

interface StrengthResult {
  score: number; // 0–4
  label: string;
  color: string;
}

const segments = [
  {
    threshold: 1,
    className: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
  },
  {
    threshold: 2,
    className: "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]",
  },
  {
    threshold: 3,
    className: "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]",
  },
  {
    threshold: 4,
    className: "bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.5)]",
  },
] as const;

export function getPasswordStrength(password: string): StrengthResult {
  let score = 0;

  if (!password) {
    return { score: 0, label: "", color: "bg-gray-500" };
  }

  // Length checks
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 0.5;
  if (/[^a-zA-Z0-9]/.test(password)) score += 0.5;

  // Clamp to 0–5
  const clamped = Math.min(Math.max(Math.round(score), 0), 4);

  const labels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
  ];

  return {
    score: clamped,
    label: labels[clamped],
    color: colors[clamped],
  };
}

export function PasswordStrengthMeter() {
  const password =
    (document.getElementById("password") as HTMLInputElement)?.value || "";

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="w-full space-y-1.5">
      {/* Segmented bar */}
      <div className="flex gap-1">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i < strength.score ? seg.className : "bg-white/10",
            )}
          />
        ))}
      </div>

      {/* Label */}
      <p
        className={cn(
          "text-xs font-medium transition-colors duration-300",
          strength.score <= 1 && "text-red-400",
          strength.score === 2 && "text-yellow-400",
          strength.score >= 3 && "text-green-400",
        )}
      >
        {strength.label}
      </p>
    </div>
  );
}

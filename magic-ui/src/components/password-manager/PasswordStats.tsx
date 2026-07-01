import { MagicCard } from "../ui/MagicCard";

interface PasswordStatsProps {
  count: number;
}

export function PasswordStats({ count }: PasswordStatsProps) {
  return (
    <MagicCard className="p-6 flex flex-col items-center justify-center h-48">
      <h3 className="text-4xl font-bold text-white drop-shadow-md">{count}</h3>
      <p className="text-white/50 text-sm mt-2">Total Saved</p>
    </MagicCard>
  );
}

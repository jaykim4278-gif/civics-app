import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ current, total, label, className }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex justify-between mb-2 text-sm font-bold text-muted-foreground uppercase tracking-wide">
          <span>{label}</span>
          <span>{current} / {total}</span>
        </div>
      )}
      <div className="h-4 bg-muted rounded-full overflow-hidden border border-black/5">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full relative overflow-hidden"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] translate-x-[-100%]" />
        </div>
      </div>
    </div>
  );
}

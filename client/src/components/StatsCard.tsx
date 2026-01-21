import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: "primary" | "secondary" | "accent";
}

export function StatsCard({ label, value, icon: Icon, color }: StatsCardProps) {
  const colors = {
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
  };

  return (
    <div className={cn(
      "p-5 rounded-2xl border-2 flex items-center gap-4 transition-all hover:scale-[1.02]",
      colors[color]
    )}>
      <div className={cn(
        "p-3 rounded-xl bg-white shadow-sm flex-shrink-0",
        color === "primary" && "text-primary",
        color === "secondary" && "text-secondary",
        color === "accent" && "text-accent"
      )}>
        <Icon className="w-6 h-6 stroke-[2.5px]" />
      </div>
      <div>
        <p className="text-3xl font-display font-bold leading-none mb-1">
          {value}
        </p>
        <p className="text-sm font-bold opacity-80 uppercase tracking-wide">
          {label}
        </p>
      </div>
    </div>
  );
}

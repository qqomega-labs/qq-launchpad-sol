import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  value: string | null;
  label: string;
  loading?: boolean;
  color?: "default" | "accent" | "red";
}

/**
 * @dev Compact stat card with hover lift effect.
 */
export function StatCard({
  value,
  label,
  loading = false,
  color = "default",
}: StatCardProps) {
  const colorClasses: Record<string, string> = {
    default: "text-white",
    accent: "text-accent",
    red: "text-red",
  };

  return (
    <div className="glass-panel stat-card rounded-[10px] px-3.5 py-3 flex flex-col items-center justify-center min-w-[76px]">
      {loading ? (
        <Skeleton className="h-6 w-16 mb-0.5" />
      ) : (
        <span
          className={`font-mono text-lg md:text-xl font-medium ${colorClasses[color]}`}
        >
          {value ?? "\u2014"}
        </span>
      )}
      <span className="text-text-muted text-xs mt-0.5 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  value: string | null;
  label: string;
  loading?: boolean;
  color?: 'default' | 'accent' | 'red';
}

/**
 * @dev Single stat display card with mono font for the value
 */
export function StatCard({ value, label, loading = false, color = 'default' }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    default: 'text-white',
    accent: 'text-accent',
    red: 'text-red',
  };

  return (
    <div className="glass-panel rounded-[12px] px-4 py-3 flex flex-col items-center justify-center min-h-[80px] flex-1">
      {loading ? (
        <Skeleton className="h-7 w-20 mb-1" />
      ) : (
        <span className={`font-mono text-xl font-medium ${colorClasses[color]}`}>
          {value ?? '\u2014'}
        </span>
      )}
      <span className="text-text-muted text-xs mt-1">{label}</span>
    </div>
  );
}

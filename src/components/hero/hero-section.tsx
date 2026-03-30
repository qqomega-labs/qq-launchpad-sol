import { StatCard } from "./stat-card";
import { useBurnedSupply } from "./use-burned-supply";
import { formatNumber } from "@/lib/format";
import { TOTAL_SUPPLY } from "@/config/const";

/**
 * @dev Compact hero banner - value prop + live stats in a horizontal strip.
 * Stacks vertically on mobile, single row on desktop.
 */
export function HeroSection() {
  const { burned, seatsRemaining, loading } = useBurnedSupply();

  const seatsColor =
    seatsRemaining !== null
      ? seatsRemaining < 8000
        ? "red"
        : seatsRemaining < 9000
          ? "accent"
          : "default"
      : "default";

  return (
    <div className="glass-panel rounded-[12px] p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        {/* Value prop */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight">
            1 QQ = 1 <span className="text-accent">Dashboard</span> Access
          </h1>
          <p className="mt-2 text-sm md:text-base text-text-secondary leading-relaxed max-w-md">
            Hold <span className="text-white font-medium">$QQ</span> to unlock
            QQ Omega: real-time ratings, rankings, and insights across 100+
            crypto assets.
          </p>
        </div>

        {/* Stats strip */}
        <div className="flex gap-2.5 shrink-0">
          <StatCard
            value={formatNumber(TOTAL_SUPPLY)}
            label="Supply"
            loading={false}
          />
          <StatCard
            value={burned !== null ? formatNumber(burned) : null}
            label="Burned"
            loading={loading}
            color="accent"
          />
          <StatCard
            value={
              seatsRemaining !== null ? formatNumber(seatsRemaining) : null
            }
            label="Seats"
            loading={loading}
            color={seatsColor}
          />
        </div>
      </div>
    </div>
  );
}

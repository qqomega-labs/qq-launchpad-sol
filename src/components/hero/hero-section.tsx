import { StatCard } from './stat-card';
import { useBurnedSupply } from './use-burned-supply';
import { formatNumber } from '@/lib/format';
import { TOTAL_SUPPLY } from '@/config/const';

/**
 * @dev Hero section with value proposition and live stats
 */
export function HeroSection() {
  const { burned, seatsRemaining, loading } = useBurnedSupply();

  const seatsColor = seatsRemaining !== null
    ? seatsRemaining < 8000 ? 'red' : seatsRemaining < 9000 ? 'accent' : 'default'
    : 'default';

  return (
    <div className="flex flex-col justify-center h-full">
      <h1 className="text-[32px] lg:text-[38px] font-bold text-white leading-[1.1] tracking-tight">
        1 QQ = 1{' '}
        <span className="text-accent">Dashboard</span>{' '}
        Access
      </h1>

      <p className="mt-4 text-[15px] text-text-secondary leading-relaxed max-w-lg">
        Hold <span className="text-white font-medium">$QQ</span> in your wallet to unlock the QQ Omega scoring dashboard:
        real-time ratings, rankings, and AI-driven insights across 100+ crypto assets.
      </p>

      <p className="mt-3 text-sm font-mono text-accent tracking-wider uppercase">
        10,000 total supply. Shrinking.
      </p>

      <div className="flex gap-3 mt-6">
        <StatCard
          value={formatNumber(TOTAL_SUPPLY)}
          label="Total Supply"
          loading={false}
        />
        <StatCard
          value={burned !== null ? formatNumber(burned) : null}
          label="Burned"
          loading={loading}
          color="accent"
        />
        <StatCard
          value={seatsRemaining !== null ? formatNumber(seatsRemaining) : null}
          label="Seats Left"
          loading={loading}
          color={seatsColor}
        />
      </div>
    </div>
  );
}

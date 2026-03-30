import { useHolders } from "./use-holders";
import { truncateAddress, formatNumber } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { TOTAL_SUPPLY } from "@/config/const";

/**
 * @dev Top token holders table
 */
export function HoldersTable() {
  const { holders, loading } = useHolders();

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  if (holders.length === 0) {
    return (
      <p className="text-text-muted text-xs text-center py-4">
        No holder data available
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-text-muted text-xs uppercase border-b border-border/50">
            <th className="pb-2 pr-3 font-medium w-8">#</th>
            <th className="pb-2 pr-3 font-medium">Address</th>
            <th className="pb-2 pr-3 font-medium text-right">Amount</th>
            <th className="pb-2 font-medium text-right">%</th>
          </tr>
        </thead>
        <tbody>
          {holders.slice(0, 20).map((holder, idx) => {
            const isTop3 = idx < 3;
            const pct = holder.pct ?? (holder.amount / TOTAL_SUPPLY) * 100;
            return (
              <tr
                key={holder.address}
                className={`border-b border-border/50 last:border-0 text-xs ${isTop3 ? "text-accent" : ""}`}
              >
                <td className="py-2 pr-3 text-text-muted">{idx + 1}</td>
                <td className="py-2 pr-3 font-mono">
                  <a
                    href={`https://solscan.io/account/${holder.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {truncateAddress(holder.address, 6)}
                  </a>
                </td>
                <td className="py-2 pr-3 text-right font-mono text-text-primary">
                  {formatNumber(holder.amount, 2)}
                </td>
                <td className="py-2 text-right font-mono text-text-secondary">
                  {pct.toFixed(2)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

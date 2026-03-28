import { useTradeFeed, type Trade } from './use-trade-feed';
import { truncateAddress, formatPrice } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';

function timeAgo(isoStr: string): string {
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 0) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function TradeRow({ trade }: { trade: Trade }) {
  const isBuy = trade.type === 'buy';
  return (
    <tr className="border-b border-border/50 last:border-0 text-xs">
      <td className="py-2 pr-3 text-text-muted whitespace-nowrap">{timeAgo(trade.timestamp)}</td>
      <td className={`py-2 pr-3 font-medium ${isBuy ? 'text-green' : 'text-red'}`}>
        {isBuy ? 'Buy' : 'Sell'}
      </td>
      <td className="py-2 pr-3 text-text-primary font-mono">{trade.amount?.toFixed(2) ?? '-'}</td>
      <td className="py-2 pr-3 text-text-secondary font-mono">
        {trade.usdPrice ? `$${formatPrice(trade.usdPrice)}` : '-'}
      </td>
      <td className="py-2 text-right">
        {trade.txHash ? (
          <a
            href={`https://solscan.io/tx/${trade.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-white transition-colors"
          >
            {truncateAddress(trade.txHash, 4)}
          </a>
        ) : '-'}
      </td>
    </tr>
  );
}

/**
 * @dev Live trade feed table
 */
export function TradeFeed() {
  const { trades, connected } = useTradeFeed();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-secondary text-xs font-medium">Live Trades</h3>
        <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green' : 'bg-red'}`} />
      </div>

      {trades.length === 0 ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <p className="text-text-muted text-xs text-center mt-2">
            {connected ? 'Waiting for trades...' : 'Connecting...'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-text-muted text-[10px] uppercase border-b border-border/50">
                <th className="pb-2 pr-3 font-medium">Time</th>
                <th className="pb-2 pr-3 font-medium">Type</th>
                <th className="pb-2 pr-3 font-medium">Amount</th>
                <th className="pb-2 pr-3 font-medium">Price</th>
                <th className="pb-2 font-medium text-right">Tx</th>
              </tr>
            </thead>
            <tbody>
              {trades.slice(0, 20).map((trade, idx) => (
                <TradeRow key={trade.txHash || idx} trade={trade} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

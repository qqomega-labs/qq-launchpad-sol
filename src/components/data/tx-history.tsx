import { useTxHistory } from "./use-tx-history"
import type { TxRecord } from "@/lib/jupiter-data"
import { truncateAddress, formatPrice } from "@/lib/format"
import { Skeleton } from "@/components/ui/skeleton"

function timeAgo(isoStr: string): string {
   const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000)
   if (diff < 60) return `${diff}s ago`
   if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
   if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
   return `${Math.floor(diff / 86400)}d ago`
}

function TxRow({ tx }: { tx: TxRecord }) {
   const isBuy = tx.type === "buy"
   return (
      <tr className="border-b border-border/50 last:border-0 text-xs">
         <td className="py-2 pr-3 text-text-muted whitespace-nowrap">{timeAgo(tx.timestamp)}</td>
         <td className={`py-2 pr-3 font-medium ${isBuy ? "text-green" : "text-red"}`}>{isBuy ? "Buy" : "Sell"}</td>
         <td className="py-2 pr-3 text-text-primary font-mono">{tx.amount?.toFixed(2) ?? "-"}</td>
         <td className="py-2 pr-3 text-text-secondary font-mono">
            {tx.usdPrice ? `$${formatPrice(tx.usdPrice)}` : "-"}
         </td>
         <td className="py-2 pr-3 font-mono text-text-muted">
            {tx.traderAddress ? (
               <a
                  href={`https://solscan.io/account/${tx.traderAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
               >
                  {truncateAddress(tx.traderAddress, 4)}
               </a>
            ) : (
               "-"
            )}
         </td>
         <td className="py-2 text-right">
            {tx.txHash ? (
               <a
                  href={`https://solscan.io/tx/${tx.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-white transition-colors"
               >
                  {truncateAddress(tx.txHash, 4)}
               </a>
            ) : (
               "-"
            )}
         </td>
      </tr>
   )
}

/**
 * @dev Transaction history table with load-more pagination
 */
export function TxHistory() {
   const { transactions, loading, loadingMore, hasMore, loadMore } = useTxHistory()

   if (loading) {
      return (
         <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
               <Skeleton key={i} className="h-6 w-full" />
            ))}
         </div>
      )
   }

   if (transactions.length === 0) {
      return <p className="text-text-muted text-xs text-center py-4">No transactions found</p>
   }

   return (
      <div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-text-muted text-xs uppercase border-b border-border/50">
                     <th className="pb-2 pr-3 font-medium">Time</th>
                     <th className="pb-2 pr-3 font-medium">Type</th>
                     <th className="pb-2 pr-3 font-medium">Amount</th>
                     <th className="pb-2 pr-3 font-medium">Price</th>
                     <th className="pb-2 pr-3 font-medium">Wallet</th>
                     <th className="pb-2 font-medium text-right">Tx</th>
                  </tr>
               </thead>
               <tbody>
                  {transactions.map((tx, idx) => (
                     <TxRow key={tx.txHash || idx} tx={tx} />
                  ))}
               </tbody>
            </table>
         </div>
         {hasMore && (
            <button
               onClick={loadMore}
               disabled={loadingMore}
               className="w-full mt-3 py-2.5 text-xs text-text-muted hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
               {loadingMore ? "Loading..." : "Load more"}
            </button>
         )}
      </div>
   )
}

import { usePoolState } from "./use-pool-state"
import { formatNumber, cn } from "@/lib/utils"
import { DBC_SUPPLY, COLORS } from "@/config/const"
import { Skeleton } from "@/components/ui/skeleton"
import { FlipNumber } from "@/components/ui/flip-number"

/**
 * @dev Bonding curve progress bar with animated gradient and graduation detection
 */
export function BondingProgress() {
   const { tokensSold, progressPct, graduated, loading } = usePoolState()

   if (loading) {
      return (
         <div className="glass-panel rounded-[12px] p-4 md:p-5">
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-3 w-48" />
         </div>
      )
   }

   return (
      <div className="glass-panel rounded-[12px] p-4 md:p-5 h-full flex flex-col justify-center">
         <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white">Bonding Curve</span>
            <span className="text-text-muted text-xs font-mono">
               <FlipNumber value={progressPct.toFixed(1)} />%
            </span>
         </div>

         {/* Progress bar */}
         <div className="w-full h-6 bg-bg-input rounded-full overflow-hidden">
            <div
               className={cn(
                  "h-full rounded-full relative transition-all duration-500",
                  !graduated && "progress-gradient"
               )}
               style={{
                  width: `${progressPct}%`,
                  ...(graduated ? { background: COLORS.green } : {}),
               }}
            >
               {!graduated && progressPct > 0 && (
                  <div className="absolute right-0 top-0 w-2 h-full bg-white/30 animate-pulse-edge rounded-full" />
               )}
            </div>
         </div>

         {/* Labels */}
         <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-mono text-text-secondary">
               {graduated ? (
                  <span className="text-green">Graduated &mdash; now trading on Meteora DAMM v2</span>
               ) : (
                  <>
                     <FlipNumber value={formatNumber(Math.floor(tokensSold))} /> / {formatNumber(DBC_SUPPLY)} QQ sold
                  </>
               )}
            </span>
            {!graduated && <span className="text-xs text-text-muted">Graduates at $20K raised</span>}
         </div>
      </div>
   )
}

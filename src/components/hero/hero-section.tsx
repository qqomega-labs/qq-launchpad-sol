import { HeroStat } from "./hero-stat"
import { usePoolState } from "@/components/progress/use-pool-state"
import { formatNumber } from "@/lib/format"
import { SOLANA_NON_DBC_SUPPLY, DBC_SUPPLY } from "@/config/const"

/**
 * @dev Compact hero banner - value prop + live counter stats.
 * Stacks vertically on mobile, single row on desktop.
 */
export function HeroSection() {
   const { baseRemaining, loading } = usePoolState()

   // Remaining seats = tokens in pool minus non-DBC allocations (LP, airdrop, core, partnerships)
   const seatsRemaining = Math.floor(baseRemaining) - SOLANA_NON_DBC_SUPPLY

   const seatsColor = seatsRemaining < 500 ? "hot" : seatsRemaining < 1300 ? "warm" : "fomo"

   return (
      <div className="glass-panel rounded-[12px] p-4 md:p-5">
         <div className="flex flex-col md:flex-row landscape:flex-row md:items-center landscape:items-center gap-4 md:gap-6">
            {/* Value prop */}
            <div className="flex-1 min-w-0">
               <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight">
                  1 QQ = <span className="text-accent">Lifetime</span> access to Your Quant Assistant{" "}
               </h1>
               <p className="mt-2 text-sm md:text-base text-text-secondary leading-relaxed max-w-3xl">
                  Hold just <span className="text-white font-medium">1 $QQ</span> in your wallet to access the lifetime
                  wisdom of QQ Omega's swarms: fundamentals, tokenomics, on-chain data, technical analysis, and macro
                  signals into one investment edge
               </p>
            </div>

            {/* Counter strip */}
            <div className="flex items-center gap-0 shrink-0">
               <HeroStat value={formatNumber(DBC_SUPPLY)} label="Seats" loading={false} />
               <span className="text-white/15 text-2xl md:text-3xl font-thin mx-1 mb-5 select-none">/</span>
               <HeroStat value={formatNumber(seatsRemaining)} label="Remaining" loading={loading} color={seatsColor} />
            </div>
         </div>
      </div>
   )
}

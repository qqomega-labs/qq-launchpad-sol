import { Lock } from "lucide-react"
import { TIMEFRAMES, type TimeframeKey } from "./sphere-data"
import { COLORS } from "@/config/const"
import { cn } from "@/lib/utils"

interface TimeframeChipsProps {
   active: TimeframeKey
   onSelect: (key: TimeframeKey) => void
}

/** @dev Timeframe selector chips. Only enabled timeframes are clickable; others show a lock icon. */
export function TimeframeChips({ active, onSelect }: TimeframeChipsProps) {
   return (
      <div className="flex items-center gap-1 md:gap-1.5 flex-wrap">
         {TIMEFRAMES.map((tf) => {
            const isA = active === tf.key
            return (
               <span
                  key={tf.key}
                  onClick={() => tf.enabled && onSelect(tf.key)}
                  className={cn(
                     "flex items-center gap-0.5 md:gap-1.5 px-1.5 py-px md:px-2.5 md:py-1.5 rounded-md font-mono text-[9px] md:text-xs select-none",
                     tf.enabled
                        ? isA
                           ? cn(
                                "bg-accent/[0.15] border border-accent/40 text-accent cursor-pointer",
                                COLORS.tw.accentGlowSm
                             )
                           : "bg-white/[0.03] border border-white/[0.06] text-text-muted cursor-pointer hover:bg-white/[0.06] transition-colors"
                        : "bg-white/[0.02] border border-white/[0.04] text-text-muted/40 cursor-not-allowed"
                  )}
                  title={tf.enabled ? tf.label : `${tf.label} (coming soon)`}
               >
                  {!tf.enabled && <Lock className="w-2.5 h-2.5 opacity-40" />}
                  {tf.enabled && (
                     <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "currentColor", opacity: isA ? 1 : 0.4 }}
                     />
                  )}
                  <span className={cn(isA && tf.enabled ? "font-bold" : "font-medium")}>{tf.short}</span>
               </span>
            )
         })}
      </div>
   )
}

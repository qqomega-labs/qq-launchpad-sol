import { Skeleton } from "@/components/ui/skeleton"
import { COLORS } from "@/config/const"

interface HeroStatProps {
   value: string | null
   label: string
   loading?: boolean
   color?: "default" | "fomo" | "warm" | "hot"
}

/**
 * @dev Raw counter display for hero stats.
 * Color levels follow QQ pink gradient: default (white), fomo (soft pink), warm (medium), hot (accent).
 */
export function HeroStat({ value, label, loading = false, color = "default" }: HeroStatProps) {
   const colorClasses: Record<string, string> = {
      default: "text-white",
      fomo: COLORS.tw.fomoSoft,
      warm: COLORS.tw.fomoWarm,
      hot: COLORS.tw.fomoHot,
   }

   return (
      <div className="flex flex-col items-center justify-center px-2">
         {loading ? (
            <Skeleton className="h-8 w-20 mb-1" />
         ) : (
            <span
               className={`font-mono text-2xl md:text-3xl font-bold tabular-nums tracking-tight ${colorClasses[color]}`}
            >
               {value ?? "\u2014"}
            </span>
         )}
         <span className="text-text-muted text-[10px] md:text-xs mt-1 uppercase tracking-[0.15em] font-medium">
            {label}
         </span>
      </div>
   )
}

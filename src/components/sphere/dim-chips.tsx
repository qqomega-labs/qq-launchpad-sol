import { Lock } from "lucide-react"
import { DIMS, type SortKey } from "./sphere-data"
import { cn } from "@/lib/utils"

interface DimChipsProps {
   active: SortKey
   onSelect: (key: SortKey) => void
}

/** @dev Horizontal dimension chips. Renders all entries from DIMS uniformly; respects `enabled` flag. */
export function DimChips({ active, onSelect }: DimChipsProps) {
   return (
      <div className="flex items-center gap-1 md:gap-1.5 flex-wrap">
         {DIMS.map((d) => {
            const isA = active === d.key
            return (
               <span
                  key={d.key}
                  onClick={() => d.enabled && onSelect(d.key)}
                  className={cn(
                     "flex items-center gap-1 md:gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1.5 rounded-md font-mono text-[10px] md:text-xs select-none",
                     d.enabled ? "cursor-pointer" : "cursor-not-allowed"
                  )}
                  style={{
                     background: !d.enabled ? `${d.color}04` : isA ? `${d.color}15` : `${d.color}08`,
                     border: !d.enabled
                        ? `1px solid ${d.color}0a`
                        : isA
                          ? `1px solid ${d.color}44`
                          : `1px solid ${d.color}18`,
                     color: !d.enabled ? `${d.color}33` : isA ? d.color : `${d.color}77`,
                     fontWeight: isA ? 700 : 500,
                     boxShadow: isA ? `0 0 8px ${d.color}18` : "none",
                  }}
                  title={d.enabled ? d.label : `${d.label} (coming soon)`}
               >
                  {!d.enabled && <Lock className="w-2.5 h-2.5" />}
                  {d.enabled && (
                     <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: d.color, opacity: isA ? 1 : 0.4 }}
                     />
                  )}
                  {d.short}
               </span>
            )
         })}
      </div>
   )
}

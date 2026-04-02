import { CATS, SCORE_DIMS, type RankedAsset, type CatKey } from "./sphere-data"
import { COLORS } from "@/config/const"
import { cn } from "@/lib/utils"

interface SphereDetailProps {
   data: RankedAsset
   onClose: () => void
}

/** @dev Slide-up detail card for selected asset. */
export function SphereDetail({ data, onClose }: SphereDetailProps) {
   const ci = CATS[data.cat as CatKey]
   const catColor = ci?.c || "#ff4d94"

   return (
      <div
         className="glass-panel animate-fade-up rounded-xl px-2 py-1.5 md:px-3 md:py-2 flex items-center gap-2 md:gap-3"
         style={{
            borderColor: `${catColor}33`,
            boxShadow: `0 0 20px ${catColor}12, 0 4px 16px ${COLORS.raw.shadow}`,
         }}
      >
         <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1 md:gap-1.5 mb-0.5 flex-wrap">
               <span className="font-mono font-extrabold text-sm md:text-lg text-white">#{data.rank}</span>
               <span className="font-mono font-bold text-sm md:text-base text-white">{data.s}</span>
               <span className="text-[10px] md:text-xs text-text-muted">{data.n}</span>
               <span
                  className="font-mono font-semibold text-[10px] px-1 py-px rounded-sm"
                  style={{
                     background: `${catColor}12`,
                     color: catColor,
                     border: `1px solid ${catColor}22`,
                  }}
               >
                  {ci?.l}
               </span>
            </div>
            {/* Dimension scores: seed values blurred (demo preview - real data gated behind QQ access).
                Final score uses data.qq to match the value shown on the sphere tile. */}
            <div className="flex gap-1 md:gap-1.5 mb-0.5 md:mb-1 flex-wrap">
               {SCORE_DIMS.map((d) => (
                  <span key={d.key} className="font-mono text-[10px] md:text-xs opacity-80" style={{ color: d.color }}>
                     {d.short}:<span style={{ filter: "blur(3px)" }}>{data[d.key]}</span>
                  </span>
               ))}
               <span className="font-mono text-[10px] md:text-xs font-bold text-accent">= {data.qq}</span>
            </div>
            <p className="text-[10px] md:text-xs text-text-muted m-0 leading-snug font-sans">{data.note}</p>
         </div>
         <button
            onClick={onClose}
            className={cn(
               "shrink-0 rounded-md px-1.5 py-0.5 md:px-2 md:py-1 leading-none",
               "bg-white/[0.04] border border-white/[0.06]",
               "text-text-muted text-sm md:text-base hover:text-white transition-colors"
            )}
            aria-label="Close detail"
         >
            &times;
         </button>
      </div>
   )
}

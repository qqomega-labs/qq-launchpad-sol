import { useState } from "react"
import { TOTAL, type SortKey, type TimeframeKey } from "./sphere-data"
import { fibSphere, rotate3D, hexPath, rankAll, getHexColor } from "./sphere-utils"
import { useSphereRotation } from "./use-sphere-rotation"
import { SphereDetail } from "./sphere-detail"
import { DimChips } from "./dim-chips"
import { TimeframeChips } from "./timeframe-chips"
import { COLORS } from "@/config/const"
import { cn } from "@/lib/utils"

// PUBLIC

/** @dev 3D interactive hex sphere displaying crypto assets ranked by QQ Score dimensions. */
export function QQHexSphere() {
   const [sortKey, setSortKey] = useState<SortKey>("comp")
   const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeKey>("yearly")
   const [selected, setSelected] = useState<number | null>(null)

   const { rot, sphereContainerRef, onDown, onMove, onUp, onSphereEnter, onSphereLeave, hasMoved } =
      useSphereRotation()

   const ranked = rankAll(sortKey)
   const sphere = fibSphere(TOTAL)

   // Tighter sphere for side-by-side layout
   const sphereR = 190
   const angularSep = Math.sqrt((4 * Math.PI) / TOTAL)
   const hexR = sphereR * angularSep * 0.70
   const cx = 300
   const cy = 260

   const proj = sphere
      .map((sp, i) => {
         const rp = rotate3D(sp, rot.x, rot.y)
         return { ...rp, idx: i }
      })
      .sort((a, b) => a.z - b.z)

   const hexD = hexPath(hexR)
   const sel = selected !== null ? ranked[selected] : null

   return (
      <div
         className={cn(
            "glass-panel rounded-[12px] flex flex-col overflow-hidden relative",
            "landscape:max-h-[320px] landscape:overflow-hidden"
         )}
      >
         {/* Header */}
         <div className="flex items-center justify-between px-4 md:px-5 pt-4 md:pt-5 pb-1 md:pb-2">
            <div className="flex items-baseline gap-2">
               <span className="text-base font-semibold text-white">QQ Score preview</span>
               <span className="text-sm text-text-muted">{TOTAL} assets</span>
            </div>
            <span className="text-xs text-text-muted">drag to explore</span>
         </div>

         {/* Dimension chips */}
         <div className="px-4 md:px-5 pb-1.5 md:pb-2.5">
            <DimChips active={sortKey} onSelect={setSortKey} />
         </div>

         {/* Timeframe chips */}
         <div className="px-4 md:px-5 pb-1 md:pb-2">
            <TimeframeChips active={selectedTimeframe} onSelect={setSelectedTimeframe} />
         </div>

         {/* SVG Sphere */}
         <div
            ref={sphereContainerRef}
            className="relative select-none flex-1"
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onSphereLeave}
            onPointerEnter={onSphereEnter}
            onTouchEnd={onUp}
            onTouchCancel={onUp}
         >
            {/* Core glow */}
            <div
               className="absolute top-1/2 left-1/2 rounded-full pointer-events-none z-0"
               style={{
                  transform: "translate(-50%, -50%)",
                  width: sphereR * 2.4,
                  height: sphereR * 2.4,
                  background: `radial-gradient(circle, ${COLORS.raw.accentTabActive} 0%, ${COLORS.raw.accentFaint} 50%, transparent 70%)`,
               }}
            />

            <svg
               viewBox="0 0 600 520"
               className={cn(
                  "w-full h-auto relative z-[1]",
                  "cursor-grab active:cursor-grabbing",
                  "landscape:max-h-[260px]"
               )}
               style={{ touchAction: "none" }}
               onPointerDown={onDown}
               onTouchStart={onDown}
            >
               <defs>
                  <filter id="hexGlow" x="-40%" y="-40%" width="180%" height="180%">
                     <feGaussianBlur stdDeviation="2.5" result="b" />
                     <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                     </feMerge>
                  </filter>
                  <radialGradient id="sphereShadow" cx="50%" cy="55%" r="40%">
                     <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                     <stop offset="80%" stopColor="rgba(0,0,0,0)" />
                     <stop offset="100%" stopColor={COLORS.raw.shadowVignette} />
                  </radialGradient>
               </defs>

               <circle
                  cx={cx}
                  cy={cy}
                  r={sphereR + hexR * 0.3}
                  fill="none"
                  stroke={COLORS.raw.accentSubtle}
                  strokeWidth="0.8"
               />
               <circle cx={cx} cy={cy} r={sphereR + hexR * 0.3} fill="url(#sphereShadow)" opacity=".25" />

               {proj.map((p) => {
                  const data = ranked[p.idx]
                  const { h, s, l } = getHexColor(data.rank)
                  const depth01 = (p.z + 1) / 2
                  const opacity = 0.15 + depth01 * 0.85
                  const lightBoost = depth01 * 18
                  const fillL = l - 10 + lightBoost
                  const fillA = 0.2 + depth01 * 0.75
                  const fill = `hsla(${h},${s}%,${fillL}%,${fillA})`
                  const strokeA = 0.08 + depth01 * 0.25
                  const stroke = `hsla(${h},${s - 10}%,${fillL + 15}%,${strokeA})`
                  const sx = cx + p.x * sphereR
                  const sy = cy + p.y * sphereR
                  const isSel = selected === p.idx
                  const shadow = depth01 > 0.4 ? `0 1px 2px ${COLORS.raw.shadowDeep}` : "none"
                  const vis = depth01 > 0.18
                  const visTicker = depth01 > 0.12

                  const scoreFs = Math.max(5.5, hexR * 0.32)
                  const tickerFs = Math.max(6.5, hexR * 0.42)
                  const rankFs = Math.max(4, hexR * 0.18)

                  return (
                     <g
                        key={`${sortKey}-${data.s}`}
                        data-h="1"
                        transform={`translate(${sx.toFixed(1)},${sy.toFixed(1)})`}
                        style={{
                           cursor: "pointer",
                           opacity,
                           transition: "opacity .15s",
                        }}
                        onClick={() => {
                           if (!hasMoved()) setSelected(selected === p.idx ? null : p.idx)
                        }}
                        onMouseEnter={(e) => {
                           e.currentTarget.style.opacity = "1"
                           e.currentTarget.querySelector(".hexFill")?.setAttribute("filter", "url(#hexGlow)")
                        }}
                        onMouseLeave={(e) => {
                           e.currentTarget.style.opacity = String(opacity)
                           e.currentTarget.querySelector(".hexFill")?.removeAttribute("filter")
                        }}
                     >
                        <path
                           className="hexFill"
                           d={hexD}
                           fill={isSel ? `hsla(${h},${s + 10}%,${fillL + 8}%,${Math.min(1, fillA + 0.2)})` : fill}
                           stroke={isSel ? COLORS.white : stroke}
                           strokeWidth={isSel ? 1.5 : 0.6}
                           strokeLinejoin="round"
                           filter={isSel ? "url(#hexGlow)" : undefined}
                        />
                        {vis && (
                           <text
                              x="0"
                              y={-hexR * 0.42}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="white"
                              fontFamily="var(--font-mono)"
                              fontWeight="800"
                              fontSize={scoreFs}
                              style={{
                                 textShadow: `0 1px 3px ${COLORS.raw.shadowText}, 0 0 6px ${COLORS.raw.shadowLight}`,
                              }}
                              opacity={0.5 + depth01 * 0.5}
                           >
                              {data.qq}
                           </text>
                        )}
                        {visTicker && (
                           <text
                              x="0"
                              y={hexR * 0.0}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="white"
                              fontFamily="var(--font-mono)"
                              fontWeight="800"
                              fontSize={tickerFs}
                              letterSpacing="-0.5"
                              style={{ textShadow: shadow }}
                              opacity={0.3 + depth01 * 0.7}
                           >
                              {data.s}
                           </text>
                        )}
                        {vis && (
                           <text
                              x="0"
                              y={hexR * 0.45}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="white"
                              fontFamily="var(--font-mono)"
                              fontWeight="500"
                              fontSize={rankFs}
                              style={{ textShadow: shadow }}
                              opacity={0.25 + depth01 * 0.4}
                           >
                              #{data.rank}
                           </text>
                        )}
                     </g>
                  )
               })}
            </svg>
         </div>

         {/* Detail panel - overlays bottom of sphere */}
         {sel && (
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 z-10">
               <SphereDetail data={sel} onClose={() => setSelected(null)} />
            </div>
         )}
      </div>
   )
}

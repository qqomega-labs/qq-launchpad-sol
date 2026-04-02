import { useState, useRef, useEffect } from "react"
import { Lock } from "lucide-react"
import {
   DIMS,
   SCORE_DIMS,
   CATS,
   TOTAL,
   TIMEFRAMES,
   type SortKey,
   type RankedAsset,
   type CatKey,
   type TimeframeKey,
} from "./sphere-data"
import { fibSphere, rotate3D, hexPath, rankAll, getHexColor } from "./sphere-utils"
import { COLORS } from "@/config/const"
import { cn } from "@/lib/utils"

// PRIVATE - sub-components

interface DetailProps {
   data: RankedAsset
   onClose: () => void
}

/** @dev Slide-up detail card for selected asset. */
function Detail({ data, onClose }: DetailProps) {
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
            {/* Dimension scores: seed values blurred (demo preview — real data gated behind QQ access).
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

/** @dev Horizontal dimension chips. Renders all entries from DIMS uniformly; respects `enabled` flag. */
function DimChips({ active, onSelect }: { active: SortKey; onSelect: (key: SortKey) => void }) {
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

/** @dev Timeframe selector chips. Only enabled timeframes are clickable; others show a lock icon. */
function TimeframeChips({ active, onSelect }: { active: TimeframeKey; onSelect: (key: TimeframeKey) => void }) {
   return (
      <div className="flex items-center gap-1 md:gap-1.5 flex-wrap">
         {TIMEFRAMES.map((tf) => {
            const isA = active === tf.key
            return (
               <span
                  key={tf.key}
                  onClick={() => tf.enabled && onSelect(tf.key)}
                  className={cn(
                     "flex items-center gap-1 md:gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1.5 rounded-md font-mono text-[10px] md:text-xs select-none",
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

// PUBLIC

/** @dev 3D interactive hex sphere displaying crypto assets ranked by QQ Score dimensions. */
export function QQHexSphere() {
   const [sortKey, setSortKey] = useState<SortKey>("comp")
   const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeKey>("yearly")
   const [selected, setSelected] = useState<number | null>(null)
   const [rot, setRot] = useState({ x: -0.25, y: 0 })
   const dragRef = useRef({
      active: false,
      hovering: false,
      lx: 0,
      ly: 0,
      moved: false,
      vx: 0,
      vy: 0,
      lastTime: 0,
   })
   const rafRef = useRef<number>(0)
   const sphereContainerRef = useRef<HTMLDivElement>(null)

   const ranked = rankAll(sortKey)
   const sphere = fibSphere(TOTAL)

   // Idle auto-rotation + momentum spin loop
   const IDLE_SPEED = 0.0012 // slow ambient rotation (radians/frame)
   const FRICTION = 0.94
   const MIN_V = 0.0003

   useEffect(() => {
      let prev = performance.now()

      const tick = (now: number) => {
         const d = dragRef.current
         const dt = Math.min(now - prev, 32) / 16

         if (d.active) {
            // User is dragging: do nothing, onMove handles it
         } else if (Math.abs(d.vx) > MIN_V || Math.abs(d.vy) > MIN_V) {
            // Post-drag momentum: decelerate smoothly
            d.vx *= FRICTION ** dt
            d.vy *= FRICTION ** dt
            setRot((r) => ({ x: r.x + d.vy * dt, y: r.y + d.vx * dt }))
         } else if (!d.hovering) {
            // Idle: slow ambient rotation
            setRot((r) => ({ x: r.x, y: r.y + IDLE_SPEED * dt }))
         }

         prev = now
         rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(rafRef.current)
   }, [])

   // Imperative touchmove with { passive: false } so preventDefault() is allowed.
   // React registers onTouchMove as passive by default (React 17+), blocking preventDefault.
   useEffect(() => {
      const el = sphereContainerRef.current
      if (!el) return
      const handler = (e: TouchEvent) => {
         const d = dragRef.current
         if (!d.active) return
         e.preventDefault()
         const t = e.touches[0]
         const dx = t.clientX - d.lx
         const dy = t.clientY - d.ly
         if (Math.abs(dx) > 2 || Math.abs(dy) > 2) d.moved = true
         const now = performance.now()
         const elapsed = Math.max(now - d.lastTime, 1)
         d.vx = dx * 0.006 * (16 / elapsed)
         d.vy = -dy * 0.006 * (16 / elapsed)
         d.lx = t.clientX
         d.ly = t.clientY
         d.lastTime = now
         setRot((r) => ({ x: r.x - dy * 0.006, y: r.y + dx * 0.006 }))
      }
      el.addEventListener("touchmove", handler, { passive: false })
      return () => el.removeEventListener("touchmove", handler)
   }, [])

   const getXY = (e: React.PointerEvent) => ({ x: e.clientX, y: e.clientY })

   const onDown = (e: React.PointerEvent | React.TouchEvent) => {
      const x = "touches" in e ? e.touches[0].clientX : e.clientX
      const y = "touches" in e ? e.touches[0].clientY : e.clientY
      dragRef.current = {
         active: true,
         hovering: true,
         lx: x,
         ly: y,
         moved: false,
         vx: 0,
         vy: 0,
         lastTime: performance.now(),
      }
   }

   const onMove = (e: React.PointerEvent) => {
      const d = dragRef.current
      if (!d.active) return
      const { x, y } = getXY(e)
      const dx = x - d.lx
      const dy = y - d.ly
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) d.moved = true
      const now = performance.now()
      const elapsed = Math.max(now - d.lastTime, 1)
      d.vx = dx * 0.006 * (16 / elapsed)
      d.vy = -dy * 0.006 * (16 / elapsed)
      d.lx = x
      d.ly = y
      d.lastTime = now
      setRot((r) => ({ x: r.x - dy * 0.006, y: r.y + dx * 0.006 }))
   }

   const onUp = () => {
      dragRef.current.active = false
   }

   const onSphereEnter = () => {
      dragRef.current.hovering = true
      dragRef.current.vx = 0
      dragRef.current.vy = 0
   }

   const onSphereLeave = () => {
      dragRef.current.hovering = false
      dragRef.current.active = false
   }

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
                           if (!dragRef.current.moved) setSelected(selected === p.idx ? null : p.idx)
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
               <Detail data={sel} onClose={() => setSelected(null)} />
            </div>
         )}
      </div>
   )
}

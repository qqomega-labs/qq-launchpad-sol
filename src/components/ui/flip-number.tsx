import { useEffect, useRef, useState } from "react"

const FLIP_DURATION = 300

interface FlipNumberProps {
   value: string | null
   className?: string
}

/**
 * @dev Displays a value with a split-flap flip animation whenever the value changes.
 *
 * Layering strategy to avoid overlap:
 * - Static layer is hidden (visibility: hidden) while the flip panel is animating,
 *   so only one value is visible at any time.
 * - `displayed` is updated at the animation midpoint so when the flip panel is removed
 *   at the end, the static layer already shows the new value with no visible jump.
 * - `visibility: hidden` (not `display: none`) preserves layout dimensions during the swap.
 *
 * Skips animation on initial mount (null → first real value).
 */
export function FlipNumber({ value, className }: FlipNumberProps) {
   const [displayed, setDisplayed] = useState<string | null>(value)
   const [next, setNext] = useState<string | null>(null)
   const [flipping, setFlipping] = useState(false)
   const prevRef = useRef<string | null>(value)
   const midTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
   const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

   useEffect(() => {
      if (value === prevRef.current) return
      const wasNull = prevRef.current === null
      prevRef.current = value

      // Skip flip on initial load (null → first real value)
      if (wasNull) {
         setDisplayed(value)
         return
      }

      let mounted = true

      if (midTimerRef.current) clearTimeout(midTimerRef.current)
      if (endTimerRef.current) clearTimeout(endTimerRef.current)

      setNext(value)
      setFlipping(true)

      // Update static layer at midpoint - hidden anyway, no visual jump
      midTimerRef.current = setTimeout(() => {
         if (mounted) setDisplayed(value)
         midTimerRef.current = null
      }, FLIP_DURATION / 2)

      // Remove flip panel after animation completes; static layer takes over
      endTimerRef.current = setTimeout(() => {
         if (mounted) {
            setFlipping(false)
            setNext(null)
         }
         endTimerRef.current = null
      }, FLIP_DURATION)

      return () => {
         mounted = false
         if (midTimerRef.current) {
            clearTimeout(midTimerRef.current)
            midTimerRef.current = null
         }
         if (endTimerRef.current) {
            clearTimeout(endTimerRef.current)
            endTimerRef.current = null
         }
      }
   }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

   return (
      <span className="relative inline-block" style={{ perspective: "400px" }}>
         {/* Static layer: hidden while flip panel is active to prevent overlap */}
         <span className={className} style={{ visibility: flipping ? "hidden" : "visible" }}>
            {displayed ?? "\u2014"}
         </span>

         {/* Flip layer: animates from rotateX(-90deg) → 0, covers static layer entirely */}
         {flipping && next !== null && (
            <span
               className={`absolute inset-0 flex items-center justify-center animate-flip-down ${className ?? ""}`}
               style={{ backfaceVisibility: "hidden" }}
            >
               {next}
            </span>
         )}
      </span>
   )
}

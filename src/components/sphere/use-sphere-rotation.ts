import { useState, useRef, useEffect, type RefObject } from "react"

// PRIVATE

const IDLE_SPEED = 0.0012
const FRICTION = 0.94
const MIN_V = 0.0003

interface DragState {
   active: boolean
   hovering: boolean
   lx: number
   ly: number
   moved: boolean
   vx: number
   vy: number
   lastTime: number
}

const initialDrag = (): DragState => ({
   active: false,
   hovering: false,
   lx: 0,
   ly: 0,
   moved: false,
   vx: 0,
   vy: 0,
   lastTime: 0,
})

// PUBLIC

export interface UseSphereRotationReturn {
   rot: { x: number; y: number }
   sphereContainerRef: RefObject<HTMLDivElement | null>
   onDown: (e: React.PointerEvent | React.TouchEvent) => void
   onMove: (e: React.PointerEvent) => void
   onUp: () => void
   onSphereEnter: () => void
   onSphereLeave: () => void
   /** @dev Check if a drag gesture occurred (distinguishes tap from drag) */
   hasMoved: () => boolean
}

/**
 * @dev Manages sphere rotation state: idle auto-rotation, drag gestures, and momentum spin.
 * Registers an imperative touchmove handler with { passive: false } so preventDefault() works.
 */
export function useSphereRotation(): UseSphereRotationReturn {
   const [rot, setRot] = useState({ x: -0.25, y: 0 })
   const dragRef = useRef<DragState>(initialDrag())
   const rafRef = useRef<number>(0)
   const sphereContainerRef = useRef<HTMLDivElement>(null)

   // Idle auto-rotation + momentum spin loop
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
      const x = e.clientX
      const y = e.clientY
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

   const hasMoved = () => dragRef.current.moved

   return { rot, sphereContainerRef, onDown, onMove, onUp, onSphereEnter, onSphereLeave, hasMoved }
}

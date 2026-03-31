import { useState, useEffect, useRef, useCallback } from "react"
import { fetchOhlcv, type Candle } from "@/lib/gecko"

interface UseOhlcvOptions {
   timeframe: "minute" | "hour" | "day"
   aggregate: number
   pollMs: number
}

/**
 * @dev Polls GeckoTerminal for OHLCV data with exponential backoff on rate limit.
 * Uses a setTimeout chain so each tick respects the current backoff delay.
 */
export function useOhlcv({ timeframe, aggregate, pollMs }: UseOhlcvOptions) {
   const [candles, setCandles] = useState<Candle[]>([])
   const [loading, setLoading] = useState(true)
   const backoffRef = useRef<number>(pollMs)
   const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
   const mountedRef = useRef(true)

   const scheduleNext = useCallback(() => {
      timerRef.current = setTimeout(() => {
         loadAndSchedule()
      }, backoffRef.current)
   }, [])

   const loadAndSchedule = useCallback(async () => {
      try {
         const data = await fetchOhlcv(timeframe, aggregate)
         if (mountedRef.current) {
            setCandles(data)
            setLoading(false)
            backoffRef.current = pollMs
         }
      } catch (e) {
         if (e instanceof Error && e.message === "RATE_LIMITED") {
            backoffRef.current = Math.min(backoffRef.current * 2, 30_000)
         }
         if (mountedRef.current) setLoading(false)
      }
      if (mountedRef.current) scheduleNext()
   }, [timeframe, aggregate, pollMs, scheduleNext])

   useEffect(() => {
      mountedRef.current = true
      backoffRef.current = pollMs
      setLoading(true)
      loadAndSchedule()

      return () => {
         mountedRef.current = false
         if (timerRef.current) clearTimeout(timerRef.current)
      }
   }, [loadAndSchedule])

   return { candles, loading }
}

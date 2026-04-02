import { useState, useEffect, useRef } from "react"
import { fetchOhlcv, type Candle } from "@/lib/gecko"

interface UseOhlcvOptions {
   timeframe: "minute" | "hour" | "day"
   aggregate: number
   pollMs: number
}

/**
 * @dev Polls GeckoTerminal for OHLCV data with exponential backoff on rate limit.
 * Uses a ref-based tick loop to avoid stale closures — params are read from
 * paramsRef on every tick so timeframe switches are always reflected immediately
 * without recreating the effect or the scheduling closure.
 */
export function useOhlcv({ timeframe, aggregate, pollMs }: UseOhlcvOptions) {
   const [candles, setCandles] = useState<Candle[]>([])
   const [loading, setLoading] = useState(true)
   const mountedRef = useRef(true)
   const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
   const backoffRef = useRef<number>(pollMs)
   // Always holds the latest params; tick() reads from here so no stale closure
   const paramsRef = useRef({ timeframe, aggregate, pollMs })
   paramsRef.current = { timeframe, aggregate, pollMs }

   useEffect(() => {
      mountedRef.current = true
      backoffRef.current = paramsRef.current.pollMs
      setLoading(true)

      async function tick() {
         const { timeframe: tf, aggregate: agg, pollMs: ms } = paramsRef.current
         try {
            const data = await fetchOhlcv(tf, agg)
            if (mountedRef.current) {
               setCandles(data)
               setLoading(false)
               backoffRef.current = ms
            }
         } catch (e) {
            if (e instanceof Error && e.message === "RATE_LIMITED") {
               backoffRef.current = Math.min(backoffRef.current * 2, 30_000)
            }
            if (mountedRef.current) setLoading(false)
         }
         if (mountedRef.current) {
            timerRef.current = setTimeout(tick, backoffRef.current)
         }
      }

      tick()

      return () => {
         mountedRef.current = false
         clearTimeout(timerRef.current)
      }
   }, [timeframe, aggregate]) // eslint-disable-line react-hooks/exhaustive-deps

   return { candles, loading }
}

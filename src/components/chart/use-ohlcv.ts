import { useState, useEffect, useRef } from "react"
import { fetchOhlcv, type Candle } from "@/lib/gecko"
import { fetchSpotPrice } from "@/lib/dexscreener"

interface UseOhlcvOptions {
   timeframe: "minute" | "hour" | "day"
   aggregate: number
   pollMs: number
}

/**
 * @dev Polls GeckoTerminal for OHLCV data with exponential backoff on rate limit
 * and a DexScreener fallback to keep the last candle's close fresh.
 *
 * Tick loop flow:
 *   1. fetchOhlcv(): returns cached history + fresh tail (or full history on
 *                    first visit). Updates candles state and resets backoff.
 *
 *   2. On RATE_LIMITED:
 *        a. Double the backoff (max 30s)
 *        b. fetchSpotPrice() from DexScreener: patch last candle's close so
 *           the chart stays live even while GT is blocked
 *        c. If DexScreener also fails, do nothing. Chart shows last known state
 *   3. Schedule next tick after backoffRef.current ms
 *
 * Uses a ref-based tick loop (paramsRef) to avoid stale closures - timeframe
 * and aggregate switches are reflected immediately without recreating the effect.
 */
export function useOhlcv({ timeframe, aggregate, pollMs }: UseOhlcvOptions) {
   const [candles, setCandles] = useState<Candle[]>([])
   const [loading, setLoading] = useState(true)
   const mountedRef = useRef(true)
   const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
   const backoffRef = useRef<number>(pollMs)
   // Always holds the latest params so tick() never closes over stale values
   const paramsRef = useRef({ timeframe, aggregate, pollMs })
   paramsRef.current = { timeframe, aggregate, pollMs }

   useEffect(() => {
      mountedRef.current = true
      backoffRef.current = paramsRef.current.pollMs
      setLoading(true)

      async function tick() {
         const { timeframe: tf, aggregate: agg, pollMs: ms } = paramsRef.current

         try {
            // --- primary path: GeckoTerminal ---
            // gecko.ts handles throttling and cache internally:
            // cache miss → 300 candles, cache hit → 5 candles merged into history
            const data = await fetchOhlcv(tf, agg)
            if (mountedRef.current) {
               setCandles(data)
               setLoading(false)
               backoffRef.current = ms // reset backoff on success
            }
         } catch (e) {
            if (e instanceof Error && e.message === "RATE_LIMITED") {
               // Exponential backoff: double the wait, cap at 30s
               backoffRef.current = Math.min(backoffRef.current * 2, 30_000)

               // --- fallback path: DexScreener spot price ---
               // GT is blocked but we can still keep the last candle's close
               // price current. This prevents the chart from freezing visually.
               try {
                  const spot = await fetchSpotPrice()
                  if (mountedRef.current) {
                     setCandles((prev) => {
                        if (prev.length === 0) return prev
                        // Replace only the last candle's close; open/high/low
                        // stay as GT reported them for the current interval
                        const updated = [...prev]
                        updated[updated.length - 1] = {
                           ...updated[updated.length - 1],
                           close: spot,
                        }
                        return updated
                     })
                  }
               } catch {
                  // DexScreener also unavailable; chart shows last known state,
                  // backoff already applied above
               }
            }

            // Don't hold the loading spinner on error; show whatever we have
            if (mountedRef.current) setLoading(false)
         }

         // Schedule next tick regardless of success/failure
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

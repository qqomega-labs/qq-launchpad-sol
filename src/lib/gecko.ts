import { GT_BASE, GT_POOL_ADDR } from "@/config/const"

// In dev, route through the Vite proxy to avoid CORS (GT omits the header on 429 responses)
const GT_API_BASE = import.meta.env.DEV ? "/gt-proxy" : GT_BASE

export interface Candle {
   time: number
   open: number
   high: number
   low: number
   close: number
   volume: number
}

/**
 * @dev Fetch OHLCV candle data from GeckoTerminal API v2.
 * A CORS error on 429 manifests as a TypeError (browser blocks the response
 * when the rate-limited reply omits Access-Control-Allow-Origin).
 */
export async function fetchOhlcv(
   timeframe: "minute" | "hour" | "day",
   aggregate: number,
   limit = 300
): Promise<Candle[]> {
   const url = `${GT_API_BASE}/networks/solana/pools/${GT_POOL_ADDR}/ohlcv/${timeframe}?aggregate=${aggregate}&limit=${limit}&currency=usd&token=base`

   let res: Response
   try {
      res = await fetch(url, { headers: { Accept: "application/json" } })
   } catch {
      // CORS-blocked 429 surfaces as a TypeError
      throw new Error("RATE_LIMITED")
   }

   if (res.status === 429) throw new Error("RATE_LIMITED")
   if (!res.ok) throw new Error(`GT API ${res.status}`)

   const json = await res.json()
   return (json.data.attributes.ohlcv_list as number[][])
      .map(([time, open, high, low, close, volume]) => ({
         time,
         open,
         high,
         low,
         close,
         volume,
      }))
      .sort((a, b) => a.time - b.time)
      .filter((c, i, arr) => i === 0 || c.time !== arr[i - 1].time)
}

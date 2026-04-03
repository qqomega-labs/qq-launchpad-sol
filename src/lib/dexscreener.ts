import { GT_POOL_ADDR } from "@/config/const"

// DexScreener public API — no key required, ~300 req/min on free tier.
// Used as a lightweight fallback to keep the last candle's close price
// fresh when GeckoTerminal is rate-limited.
const DS_API_BASE = "https://api.dexscreener.com/latest/dex/pairs/solana"

// Abort the request if DS doesn't respond within this window.
// Keeps the fallback from blocking the backoff timer indefinitely.
const FETCH_TIMEOUT_MS = 5_000

/**
 * @dev Fetch the current spot price (USD) from DexScreener for the QQ pool.
 *
 * Throws "DS_UNAVAILABLE" if any of the following occur:
 *   - Network error or non-2xx response
 *   - Request exceeds FETCH_TIMEOUT_MS
 *   - `pair.priceUsd` is missing, not a number, zero, or negative
 *
 * The caller (use-ohlcv.ts) silently ignores this error — DexScreener is a
 * best-effort fallback, not a required data source.
 */
export async function fetchSpotPrice(): Promise<number> {
   const controller = new AbortController()
   const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

   try {
      const res = await fetch(`${DS_API_BASE}/${GT_POOL_ADDR}`, {
         headers: { Accept: "application/json" },
         signal: controller.signal,
      })

      if (!res.ok) throw new Error("DS_UNAVAILABLE")

      const json = await res.json()
      const raw: unknown = json?.pair?.priceUsd

      if (raw == null) throw new Error("DS_UNAVAILABLE")

      const price = parseFloat(String(raw))

      // Reject NaN, 0, negative — any of these would corrupt the last candle close
      if (!Number.isFinite(price) || price <= 0) throw new Error("DS_UNAVAILABLE")

      return price
   } catch (e) {
      // Normalise all failure modes into a single error string so callers
      // can catch without inspecting (AbortError, TypeError, DS_UNAVAILABLE, etc.)
      if (e instanceof Error && e.message === "DS_UNAVAILABLE") throw e
      throw new Error("DS_UNAVAILABLE")
   } finally {
      clearTimeout(timeoutId)
   }
}

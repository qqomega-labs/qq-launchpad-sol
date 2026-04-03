import { GT_BASE, GT_POOL_ADDR } from "@/config/const"

// In dev, route through the Vite proxy to avoid CORS
// (GT omits Access-Control-Allow-Origin on 429 responses, making the error
// undetectable without the proxy)
const GT_API_BASE = import.meta.env.DEV ? "/gt-proxy" : GT_BASE

// GeckoTerminal free tier: ~30 req/min (~1 every 2s).
// Module-level gate: any call that arrives sooner than MIN_REQUEST_GAP_MS
// after the previous one waits the remaining delta before hitting the network.
const MIN_REQUEST_GAP_MS = 3_000
let lastRequestAt = 0

export interface Candle {
   time: number
   open: number
   high: number
   low: number
   close: number
   volume: number
}

// ─── localStorage persistence ──────────────────────────────────────────────────
// localStorage + JSON: supported from IE8, the widest compatible persistence API.
// All access is routed through storageAvailable so environments that throw even
// on property access (certain browsers in restricted mode) are handled once at
// module init and never retried.

const STORAGE_KEY_PREFIX = "qq-candles-"
// Closed candles are immutable. We consider history "stale" only after 4 hours,
// at which point we fetch a wider tail (20) to catch any missed candles.
const CACHE_STALE_MS = 4 * 60 * 60 * 1000 // 4 hours
// Max candles to persist: prevents unbounded storage growth across sessions.
const MAX_STORED_CANDLES = 300
// Schema version: bump when Candle shape changes so stale entries are discarded.
const STORAGE_VERSION = 1

interface StoredEntry {
   v: number
   candles: Candle[]
   savedAt: number
}

// Test localStorage availability once at module init. Accessing localStorage
// itself can throw in some restricted environments (certain iOS WebViews, etc.).
const storageAvailable = (() => {
   try {
      const probe = "__qq_probe__"
      localStorage.setItem(probe, "1")
      localStorage.removeItem(probe)
      return true
   } catch {
      return false
   }
})()

/** @dev Validate that a value is a finite number: guards against null/NaN/Infinity from corrupt storage. */
function isFiniteNumber(v: unknown): v is number {
   return typeof v === "number" && Number.isFinite(v)
}

/** @dev Validate the shape of a single candle object. */
function isValidCandle(c: unknown): c is Candle {
   if (c === null || typeof c !== "object") return false
   const { time, open, high, low, close, volume } = c as Record<string, unknown>
   return (
      isFiniteNumber(time) &&
      isFiniteNumber(open) &&
      isFiniteNumber(high) &&
      isFiniteNumber(low) &&
      isFiniteNumber(close) &&
      isFiniteNumber(volume)
   )
}

function readStorage(cacheKey: string): { candles: Candle[]; stale: boolean } | null {
   if (!storageAvailable) return null
   const storageKey = STORAGE_KEY_PREFIX + cacheKey
   try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return null

      const entry = JSON.parse(raw) as StoredEntry

      // Reject entries from a different schema version or missing required fields
      if (
         entry.v !== STORAGE_VERSION ||
         !Array.isArray(entry.candles) ||
         typeof entry.savedAt !== "number"
      ) {
         localStorage.removeItem(storageKey) // don't keep un-parseable data
         return null
      }

      // Validate every candle: a single bad entry could crash the chart
      const validCandles = entry.candles.filter(isValidCandle)
      if (validCandles.length === 0) {
         localStorage.removeItem(storageKey)
         return null
      }

      return {
         candles: validCandles,
         stale: Date.now() - entry.savedAt > CACHE_STALE_MS,
      }
   } catch {
      // JSON.parse failed or some other storage error; remove the broken entry
      try { localStorage.removeItem(storageKey) } catch { /* ignore */ }
      return null
   }
}

function writeStorage(cacheKey: string, candles: Candle[]): void {
   if (!storageAvailable) return
   try {
      // Keep only the most recent MAX_STORED_CANDLES to bound storage size
      const toStore = candles.length > MAX_STORED_CANDLES
         ? candles.slice(-MAX_STORED_CANDLES)
         : candles
      const entry: StoredEntry = { v: STORAGE_VERSION, candles: toStore, savedAt: Date.now() }
      localStorage.setItem(STORAGE_KEY_PREFIX + cacheKey, JSON.stringify(entry))
   } catch {
      // Quota exceeded (Safari private mode throws here) or storage unavailable.
      // In-memory cache is still intact; persistence is best-effort.
   }
}

// ─── In-memory candle cache ────────────────────────────────────────────────────
// Keyed by "${timeframe}-${aggregate}".
// Populated either from localStorage (instant, no network) or from a fresh GT
// fetch. Historical candles are immutable so the cache never expires during the
// session; only the tail (5–20 candles) is re-fetched on each poll.
const candleCache = new Map<string, { candles: Candle[] }>()

/**
 * @dev Merge incoming candles into an existing array, deduplicating by `time`.
 * Newer values for the same timestamp overwrite older ones; handles the
 * in-progress (forming) candle being updated between polls.
 */
function mergeCandles(existing: Candle[], incoming: Candle[]): Candle[] {
   // Build a map from the full history so lookups are O(1)
   const map = new Map(existing.map((c) => [c.time, c]))
   // Overwrite any matching timestamps with the fresher incoming values
   for (const c of incoming) map.set(c.time, c)
   return Array.from(map.values()).sort((a, b) => a.time - b.time)
}

/**
 * @dev Fetch OHLCV candle data from GeckoTerminal API v2.
 *
 * Flow:
 *   1. Resolve cache state:
 *        in-memory hit              → tail fetch (5 candles)
 *        localStorage hit (fresh)   → seed memory, tail fetch (5)
 *        localStorage hit (stale)   → seed memory, wider tail fetch (20)
 *        no cache at all            → cold start, full fetch (300)
 *   2. Throttle: claim the next request slot before awaiting to prevent
 *      concurrent callers from both passing the gap check simultaneously
 *   3. Fetch from GeckoTerminal, merge into cached history
 *   4. Persist merged result to localStorage (capped at 300)
 *   5. Return merged candle array sorted by time, duplicates removed
 *
 * Always throws "RATE_LIMITED" on HTTP 429 or a CORS-blocked TypeError so the
 * caller (use-ohlcv.ts) applies exponential backoff and triggers the
 * DexScreener fallback; even if cached data is available, because returning
 * cached data silently would reset the backoff and cause immediate re-polling
 * against a rate-limited API.
 */
export async function fetchOhlcv(
   timeframe: "minute" | "hour" | "day",
   aggregate: number
): Promise<Candle[]> {
   const cacheKey = `${timeframe}-${aggregate}`

   // --- resolve cache state ---
   // In-memory first (zero cost). On miss, try localStorage so the chart can
   // render from persisted data without waiting for a network round-trip.
   let cached = candleCache.get(cacheKey)
   let tailLimit = 5

   if (!cached) {
      const stored = readStorage(cacheKey)
      if (stored) {
         cached = { candles: stored.candles }
         candleCache.set(cacheKey, cached)
         // Stale: fetch a wider tail to catch up on potentially missed candles
         tailLimit = stored.stale ? 20 : 5
      }
   }

   const limit = cached ? tailLimit : 300 // cold start → full history

   // --- throttle (race-safe) ---
   // Update lastRequestAt BEFORE the await so that any concurrent caller
   // reading this value sees the slot as already reserved and waits its own gap.
   const now = Date.now()
   const gap = MIN_REQUEST_GAP_MS - (now - lastRequestAt)
   if (gap > 0) {
      lastRequestAt = now + gap // reserve slot immediately
      await new Promise<void>((res) => setTimeout(res, gap))
   } else {
      lastRequestAt = now
   }
   // ----------------------------

   const url = `${GT_API_BASE}/networks/solana/pools/${GT_POOL_ADDR}/ohlcv/${timeframe}?aggregate=${aggregate}&limit=${limit}&currency=usd&token=base`

   let res: Response
   try {
      res = await fetch(url, { headers: { Accept: "application/json" } })
   } catch {
      // Network error or CORS-blocked 429 (GT drops CORS header on 429 so the
      // browser surfaces a TypeError instead of a 429 status).
      // Always throw so the caller applies backoff; returning cached data here
      // would reset the backoff timer and immediately re-poll the rate-limited API.
      throw new Error("RATE_LIMITED")
   }

   if (res.status === 429) throw new Error("RATE_LIMITED")
   if (!res.ok) throw new Error(`GT API ${res.status}`)

   const json = await res.json()
   // Guard against unexpected GT response shape (e.g. empty / maintenance response)
   const rawList: unknown[] = json?.data?.attributes?.ohlcv_list ?? []

   const incoming: Candle[] = (rawList as number[][])
      .filter((row) => Array.isArray(row) && row.length >= 6 && row.every(isFiniteNumber))
      .map(([time, open, high, low, close, volume]) => ({ time, open, high, low, close, volume }))
      .sort((a, b) => a.time - b.time)
      .filter((c, i, arr) => i === 0 || c.time !== arr[i - 1].time) // drop any GT-side dupes

   // Merge tail into history (or use incoming directly on cold start)
   const merged = cached ? mergeCandles(cached.candles, incoming) : incoming
   candleCache.set(cacheKey, { candles: merged })

   // Persist to localStorage so the next page load renders immediately
   writeStorage(cacheKey, merged)

   return merged
}

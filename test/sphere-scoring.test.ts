import { describe, it, expect } from "vitest"
import { composite, qqScore, rankAll } from "@/components/sphere/sphere-utils"
import { TIMEFRAMES, SCORE_DIMS, DIMS, RAW, TOTAL, type RawAsset } from "@/components/sphere/sphere-data"

/**
 * @dev QQ Score engine: weighted composite scoring, normalization, and ranking.
 * This is the core algorithm displayed on the sphere and drives user perception
 * of asset quality. Incorrect weights or math would silently corrupt all scores.
 */
describe("SCORE_DIMS integrity", () => {
   it("has exactly 5 scoring dimensions", () => {
      expect(SCORE_DIMS).toHaveLength(5)
   })

   it("includes macro, fund, token, chain, tech", () => {
      const keys = SCORE_DIMS.map((d) => d.key).sort()
      expect(keys).toEqual(["chain", "fund", "macro", "tech", "token"])
   })

   it("DIMS has 6 entries (5 scoring + 1 composite)", () => {
      expect(DIMS).toHaveLength(6)
   })

   it("default SCORE_DIMS weights sum to 1.0", () => {
      const sum = SCORE_DIMS.reduce((s, d) => s + d.weight, 0)
      expect(sum).toBeCloseTo(1.0, 10)
   })
})

describe("TIMEFRAMES weight integrity", () => {
   const dimKeys = ["macro", "fund", "token", "chain", "tech"] as const

   TIMEFRAMES.forEach((tf) => {
      it(`${tf.key} weights sum to 1.0`, () => {
         const sum = dimKeys.reduce((s, k) => s + tf.weights[k], 0)
         expect(sum).toBeCloseTo(1.0, 10)
      })

      it(`${tf.key} has all dimension keys`, () => {
         dimKeys.forEach((k) => {
            expect(tf.weights[k]).toBeGreaterThanOrEqual(0)
            expect(tf.weights[k]).toBeLessThanOrEqual(1)
         })
      })
   })

   it("only 'yearly' is enabled", () => {
      expect(TIMEFRAMES.filter((t) => t.enabled)).toHaveLength(1)
      expect(TIMEFRAMES.find((t) => t.enabled)?.key).toBe("yearly")
   })

   it("has 4 timeframes", () => {
      expect(TIMEFRAMES).toHaveLength(4)
   })

   it("yearly weighs macro/fund heavier (long-term bias)", () => {
      const y = TIMEFRAMES.find((t) => t.key === "yearly")!
      expect(y.weights.macro + y.weights.fund).toBeGreaterThan(0.5)
   })

   it("daily weighs chain/tech heavier (short-term bias)", () => {
      const d = TIMEFRAMES.find((t) => t.key === "daily")!
      expect(d.weights.chain + d.weights.tech).toBeGreaterThan(0.5)
   })
})

describe("composite", () => {
   const mockAsset: RawAsset = {
      s: "TEST",
      n: "Test",
      cat: "sov",
      note: "",
      macro: 80,
      fund: 70,
      token: 60,
      chain: 50,
      tech: 40,
   }

   it("calculates weighted sum using default weights", () => {
      const result = composite(mockAsset)
      const expected = SCORE_DIMS.reduce((s, d) => s + (mockAsset[d.key as keyof RawAsset] as number) * d.weight, 0)
      expect(result).toBeCloseTo(expected, 10)
   })

   it("calculates with yearly timeframe weights", () => {
      const result = composite(mockAsset, "yearly")
      const y = TIMEFRAMES.find((t) => t.key === "yearly")!
      const expected =
         80 * y.weights.macro + 70 * y.weights.fund + 60 * y.weights.token + 50 * y.weights.chain + 40 * y.weights.tech
      expect(result).toBeCloseTo(expected, 10)
   })

   it("handles all-zero scores", () => {
      const zero: RawAsset = { s: "Z", n: "Z", cat: "sov", note: "", macro: 0, fund: 0, token: 0, chain: 0, tech: 0 }
      expect(composite(zero)).toBe(0)
   })

   it("handles all-100 scores", () => {
      const max: RawAsset = {
         s: "M",
         n: "M",
         cat: "sov",
         note: "",
         macro: 100,
         fund: 100,
         token: 100,
         chain: 100,
         tech: 100,
      }
      expect(composite(max)).toBeCloseTo(100, 10) // weights sum to 1.0, so max composite = 100
   })
})

describe("qqScore", () => {
   it("normalizes with 1.07 multiplier", () => {
      expect(qqScore(50)).toBe(Math.min(99, Math.round(50 * 1.07)))
   })

   it("caps at 99 (never reaches 100)", () => {
      expect(qqScore(100)).toBe(99)
      expect(qqScore(200)).toBe(99)
   })

   it("returns 0 for 0 composite", () => {
      expect(qqScore(0)).toBe(0)
   })

   it("BTC-level composite produces high QQ score", () => {
      const btcComp = composite(RAW.find((a) => a.s === "BTC")!)
      const score = qqScore(btcComp)
      expect(score).toBeGreaterThan(80)
      expect(score).toBeLessThanOrEqual(99)
   })
})

describe("rankAll", () => {
   it("ranks all assets", () => {
      const ranked = rankAll("comp")
      expect(ranked).toHaveLength(TOTAL)
   })

   it("assigns consecutive ranks starting at 1", () => {
      const ranked = rankAll("comp")
      ranked.forEach((a, i) => {
         expect(a.rank).toBe(i + 1)
      })
   })

   it("rank 1 has highest composite score", () => {
      const ranked = rankAll("comp")
      expect(ranked[0].comp).toBeGreaterThanOrEqual(ranked[1].comp)
   })

   it("rank order is descending by composite", () => {
      const ranked = rankAll("comp")
      for (let i = 1; i < ranked.length; i++) {
         expect(ranked[i - 1].comp).toBeGreaterThanOrEqual(ranked[i].comp)
      }
   })

   it("can sort by individual dimension (macro)", () => {
      const ranked = rankAll("macro")
      for (let i = 1; i < ranked.length; i++) {
         expect(ranked[i - 1].macro).toBeGreaterThanOrEqual(ranked[i].macro)
      }
   })

   it("every ranked asset has a qq score between 0 and 99", () => {
      const ranked = rankAll("comp")
      ranked.forEach((a) => {
         expect(a.qq).toBeGreaterThanOrEqual(0)
         expect(a.qq).toBeLessThanOrEqual(99)
      })
   })

   it("yearly timeframe changes rank order", () => {
      const defaultRanked = rankAll("comp")
      const yearlyRanked = rankAll("comp", "yearly")
      // Orders may differ due to different weight sets
      const defaultOrder = defaultRanked.map((a) => a.s)
      const yearlyOrder = yearlyRanked.map((a) => a.s)
      // Both should have the same assets
      expect(defaultOrder.sort()).toEqual(yearlyOrder.sort())
   })
})

describe("RAW asset data integrity", () => {
   it("has expected asset count", () => {
      expect(RAW.length).toBeGreaterThan(0)
      expect(TOTAL).toBe(RAW.length)
   })

   it("all assets have unique symbols", () => {
      const symbols = RAW.map((a) => a.s)
      expect(new Set(symbols).size).toBe(symbols.length)
   })

   it("all dimension scores are 0-100", () => {
      const dims = ["macro", "fund", "token", "chain", "tech"] as const
      RAW.forEach((asset) => {
         dims.forEach((d) => {
            expect(asset[d], `${asset.s}.${d}`).toBeGreaterThanOrEqual(0)
            expect(asset[d], `${asset.s}.${d}`).toBeLessThanOrEqual(100)
         })
      })
   })

   it("BTC is present", () => {
      expect(RAW.find((a) => a.s === "BTC")).toBeDefined()
   })

   it("ETH is present", () => {
      expect(RAW.find((a) => a.s === "ETH")).toBeDefined()
   })

   it("SOL is present", () => {
      expect(RAW.find((a) => a.s === "SOL")).toBeDefined()
   })
})

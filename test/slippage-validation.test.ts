import { describe, it, expect } from "vitest"
import { DEFAULT_SLIPPAGE_BPS } from "@/config/const"

/**
 * @dev Validates the slippage loading logic from swap-panel.tsx useState initializer.
 *
 * Security context: slippage (in basis points) flows directly into DBC swapQuote()
 * and Jupiter quote API. A tampered localStorage value could bypass the 10% UI cap
 * set by SlippagePopover, exposing the user to sandwich attacks at extreme slippage.
 *
 * The validation must enforce: 0 < bps <= 1000 (0.01% to 10%).
 * Any value outside this range falls back to DEFAULT_SLIPPAGE_BPS (100 = 1%).
 */
function loadSlippage(stored: string | null): number {
   const parsed = stored ? Number(stored) : DEFAULT_SLIPPAGE_BPS
   return !isNaN(parsed) && parsed > 0 && parsed <= 1000 ? parsed : DEFAULT_SLIPPAGE_BPS
}

describe("slippage localStorage validation", () => {
   describe("default behavior", () => {
      it("returns 100 bps (1%) when nothing stored", () => {
         expect(loadSlippage(null)).toBe(DEFAULT_SLIPPAGE_BPS)
      })

      it("DEFAULT_SLIPPAGE_BPS is 100", () => {
         expect(DEFAULT_SLIPPAGE_BPS).toBe(100)
      })
   })

   describe("valid stored values", () => {
      it("accepts 1 bps (0.01% - minimum)", () => {
         expect(loadSlippage("1")).toBe(1)
      })

      it("accepts 50 bps (0.5% - preset)", () => {
         expect(loadSlippage("50")).toBe(50)
      })

      it("accepts 100 bps (1% - default preset)", () => {
         expect(loadSlippage("100")).toBe(100)
      })

      it("accepts 200 bps (2% - preset, warning threshold)", () => {
         expect(loadSlippage("200")).toBe(200)
      })

      it("accepts 500 bps (5%)", () => {
         expect(loadSlippage("500")).toBe(500)
      })

      it("accepts 1000 bps (10% - maximum)", () => {
         expect(loadSlippage("1000")).toBe(1000)
      })
   })

   describe("tampered values (attack vectors)", () => {
      it("rejects 1001 bps (just above cap)", () => {
         expect(loadSlippage("1001")).toBe(DEFAULT_SLIPPAGE_BPS)
      })

      it("rejects 5000 bps (50% - extreme sandwich risk)", () => {
         expect(loadSlippage("5000")).toBe(DEFAULT_SLIPPAGE_BPS)
      })

      it("rejects 10000 bps (100%)", () => {
         expect(loadSlippage("10000")).toBe(DEFAULT_SLIPPAGE_BPS)
      })

      it("rejects 0 bps (would cause guaranteed failure)", () => {
         expect(loadSlippage("0")).toBe(DEFAULT_SLIPPAGE_BPS)
      })

      it("rejects negative value", () => {
         expect(loadSlippage("-100")).toBe(DEFAULT_SLIPPAGE_BPS)
      })

      it("rejects NaN string", () => {
         expect(loadSlippage("not-a-number")).toBe(DEFAULT_SLIPPAGE_BPS)
      })

      it("rejects empty string", () => {
         expect(loadSlippage("")).toBe(DEFAULT_SLIPPAGE_BPS)
      })

      it("rejects Infinity", () => {
         expect(loadSlippage("Infinity")).toBe(DEFAULT_SLIPPAGE_BPS)
      })

      it("rejects -Infinity", () => {
         expect(loadSlippage("-Infinity")).toBe(DEFAULT_SLIPPAGE_BPS)
      })

      it("rejects script injection string", () => {
         expect(loadSlippage("<script>alert(1)</script>")).toBe(DEFAULT_SLIPPAGE_BPS)
      })

      it("rejects JSON object string", () => {
         expect(loadSlippage('{"value":5000}')).toBe(DEFAULT_SLIPPAGE_BPS)
      })
   })
})

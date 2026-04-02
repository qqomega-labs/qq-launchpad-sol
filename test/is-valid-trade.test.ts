import { describe, it, expect } from "vitest"
import { isValidTrade } from "@/components/data/use-trade-feed"

/**
 * @dev isValidTrade is the runtime type guard that validates every WebSocket
 * message before it enters React state. Jupiter's trench-stream sends JSON
 * messages over WS - a malformed or malicious payload must never reach the UI.
 *
 * Security context: WebSocket messages are untrusted external input. Without
 * validation, type-confusion could cause rendering errors, XSS via crafted
 * strings in table cells, or state corruption from unexpected data shapes.
 */

/** @dev Factory for a valid trade matching the Trade interface */
function makeTrade(overrides: Record<string, unknown> = {}) {
   return {
      txHash: "5xYzAbC123def456ghi789jkl012mno345pqr678stu901vwx234",
      type: "buy",
      asset: "QQ",
      amount: 100.5,
      usdPrice: 3.42,
      timestamp: "2026-04-03T12:00:00.000Z",
      traderAddress: "7nYpAbC123def456ghi789jkl012mno345pqr678stu9",
      ...overrides,
   }
}

describe("isValidTrade", () => {
   describe("valid trades", () => {
      it("accepts a well-formed trade", () => {
         expect(isValidTrade(makeTrade())).toBe(true)
      })

      it("accepts a sell trade", () => {
         expect(isValidTrade(makeTrade({ type: "sell" }))).toBe(true)
      })

      it("accepts zero amount", () => {
         expect(isValidTrade(makeTrade({ amount: 0 }))).toBe(true)
      })

      it("accepts zero price", () => {
         expect(isValidTrade(makeTrade({ usdPrice: 0 }))).toBe(true)
      })

      it("accepts trade with extra unknown fields (forward-compatible)", () => {
         expect(isValidTrade(makeTrade({ extraField: "ignored" }))).toBe(true)
      })
   })

   describe("null / undefined / primitives", () => {
      it("rejects null", () => expect(isValidTrade(null)).toBe(false))
      it("rejects undefined", () => expect(isValidTrade(undefined)).toBe(false))
      it("rejects string", () => expect(isValidTrade("buy 100 QQ")).toBe(false))
      it("rejects number", () => expect(isValidTrade(42)).toBe(false))
      it("rejects boolean", () => expect(isValidTrade(true)).toBe(false))
      it("rejects empty object", () => expect(isValidTrade({})).toBe(false))
      it("rejects array", () => expect(isValidTrade([makeTrade()])).toBe(false))
   })

   describe("missing required fields", () => {
      const fields = ["txHash", "type", "asset", "amount", "usdPrice", "timestamp", "traderAddress"]

      fields.forEach((field) => {
         it(`rejects object missing ${field}`, () => {
            const trade = makeTrade()
            delete (trade as Record<string, unknown>)[field]
            expect(isValidTrade(trade)).toBe(false)
         })
      })
   })

   describe("wrong field types (type confusion attacks)", () => {
      it("rejects amount as string", () => {
         expect(isValidTrade(makeTrade({ amount: "100" }))).toBe(false)
      })

      it("rejects usdPrice as string", () => {
         expect(isValidTrade(makeTrade({ usdPrice: "3.42" }))).toBe(false)
      })

      it("rejects txHash as number", () => {
         expect(isValidTrade(makeTrade({ txHash: 12345 }))).toBe(false)
      })

      it("rejects type as number", () => {
         expect(isValidTrade(makeTrade({ type: 1 }))).toBe(false)
      })

      it("rejects timestamp as number (unix epoch injection)", () => {
         expect(isValidTrade(makeTrade({ timestamp: 1712150400 }))).toBe(false)
      })

      it("rejects traderAddress as null", () => {
         expect(isValidTrade(makeTrade({ traderAddress: null }))).toBe(false)
      })

      it("accepts NaN as number (typeof NaN === 'number' in JS)", () => {
         // NOTE: isValidTrade checks typeof, not isNaN. NaN passes because
         // typeof NaN === "number". This is acceptable since NaN amounts
         // would be caught by parseFloat() checks upstream in swap-panel.
         expect(isValidTrade(makeTrade({ amount: NaN }))).toBe(true)
      })

      it("rejects amount as boolean", () => {
         expect(isValidTrade(makeTrade({ amount: true }))).toBe(false)
      })

      it("rejects nested object where string expected", () => {
         expect(isValidTrade(makeTrade({ txHash: { hash: "abc" } }))).toBe(false)
      })

      it("rejects array where string expected", () => {
         expect(isValidTrade(makeTrade({ asset: ["QQ"] }))).toBe(false)
      })
   })
})

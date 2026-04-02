import { describe, it, expect } from "vitest"
import { parseTokenAmount } from "@/lib/utils"

/**
 * @dev parseTokenAmount converts human-readable token strings to BN (base units)
 * without floating-point arithmetic. This is critical for Solana transactions where
 * JS float precision bugs like 0.1 * 1e9 = 100000000.00000001 would produce
 * invalid lamport amounts and fail on-chain.
 *
 * Security context: amounts flow directly into DBC pool swapQuote() and Jupiter
 * quote API calls. A precision error here means wrong token amounts on-chain.
 */
describe("parseTokenAmount", () => {
   describe("SOL (9 decimals)", () => {
      const D = 9

      it("1 SOL = 1_000_000_000 lamports", () => {
         expect(parseTokenAmount("1", D).toString()).toBe("1000000000")
      })

      it("0.1 SOL = 100_000_000 lamports (no float drift)", () => {
         // JS float: 0.1 * 1e9 = 100000000.00000001
         expect(parseTokenAmount("0.1", D).toString()).toBe("100000000")
      })

      it("0.000000001 SOL = 1 lamport (smallest unit)", () => {
         expect(parseTokenAmount("0.000000001", D).toString()).toBe("1")
      })

      it("0.5 SOL = 500_000_000 lamports", () => {
         expect(parseTokenAmount("0.5", D).toString()).toBe("500000000")
      })
   })

   describe("USDC (6 decimals)", () => {
      const D = 6

      it("100 USDC = 100_000_000 base units", () => {
         expect(parseTokenAmount("100", D).toString()).toBe("100000000")
      })

      it("0.01 USDC = 10_000 base units", () => {
         expect(parseTokenAmount("0.01", D).toString()).toBe("10000")
      })

      it("0.000001 USDC = 1 base unit (smallest)", () => {
         expect(parseTokenAmount("0.000001", D).toString()).toBe("1")
      })

      it("25.50 USDC = 25_500_000 base units", () => {
         expect(parseTokenAmount("25.50", D).toString()).toBe("25500000")
      })
   })

   describe("QQ (9 decimals)", () => {
      const D = 9

      it("0.3 QQ avoids JS 0.3 * 1e9 = 299999999.99999994 bug", () => {
         expect(parseTokenAmount("0.3", D).toString()).toBe("300000000")
      })

      it("0.7 QQ avoids JS 0.7 * 1e9 = 699999999.9999999 bug", () => {
         expect(parseTokenAmount("0.7", D).toString()).toBe("700000000")
      })
   })

   describe("decimal truncation", () => {
      it("truncates excess decimals beyond token precision (9)", () => {
         expect(parseTokenAmount("1.1234567899999", 9).toString()).toBe("1123456789")
      })

      it("truncates excess decimals beyond token precision (6)", () => {
         expect(parseTokenAmount("1.12345678", 6).toString()).toBe("1123456")
      })
   })

   describe("edge cases", () => {
      it("handles zero", () => {
         expect(parseTokenAmount("0", 9).toString()).toBe("0")
      })

      it("handles 0.0", () => {
         expect(parseTokenAmount("0.0", 9).toString()).toBe("0")
      })

      it("handles integer with no fractional part", () => {
         expect(parseTokenAmount("42", 6).toString()).toBe("42000000")
      })

      it("handles leading zeros in integer part", () => {
         expect(parseTokenAmount("007", 9).toString()).toBe("7000000000")
      })

      it("handles trailing zeros in fractional part", () => {
         expect(parseTokenAmount("1.500", 9).toString()).toBe("1500000000")
      })

      it("handles 0 decimals (no fractional precision)", () => {
         expect(parseTokenAmount("42", 0).toString()).toBe("42")
      })

      it("handles large amounts within maxLength=20", () => {
         expect(parseTokenAmount("99999999999999999999", 0).toString()).toBe("99999999999999999999")
      })

      it("handles quick-amount preset 0.1 SOL", () => {
         expect(parseTokenAmount("0.1", 9).toString()).toBe("100000000")
      })

      it("handles quick-amount preset 0.5 SOL", () => {
         expect(parseTokenAmount("0.5", 9).toString()).toBe("500000000")
      })

      it("handles quick-amount preset 5 USDC", () => {
         expect(parseTokenAmount("5", 6).toString()).toBe("5000000")
      })

      it("handles quick-amount preset 50 USDC", () => {
         expect(parseTokenAmount("50", 6).toString()).toBe("50000000")
      })
   })
})

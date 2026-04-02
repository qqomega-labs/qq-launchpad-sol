import { describe, it, expect } from "vitest"
import { formatNumber, formatPrice, truncateAddress, lamportsToSol, solToLamports } from "@/lib/utils"

/**
 * @dev Display utilities used across the launchpad UI.
 * formatPrice appears next to buy/sell buttons - incorrect output could
 * mislead users about token value. solToLamports uses float multiplication
 * which is a known precision risk (parseTokenAmount was built to avoid this).
 */
describe("formatNumber", () => {
   it("formats integer with commas", () => {
      expect(formatNumber(10000)).toBe("10,000")
   })

   it("formats with specified decimal places", () => {
      expect(formatNumber(1234.5678, 2)).toBe("1,234.57")
   })

   it("formats zero", () => {
      expect(formatNumber(0)).toBe("0")
   })

   it("formats small number without commas", () => {
      expect(formatNumber(999)).toBe("999")
   })

   it("formats large number", () => {
      expect(formatNumber(1000000)).toBe("1,000,000")
   })

   it("pads with trailing zeros when decimals specified", () => {
      expect(formatNumber(100, 2)).toBe("100.00")
   })
})

describe("formatPrice", () => {
   describe("micro prices (< 0.01) - 6 decimals", () => {
      it("formats very small price", () => {
         expect(formatPrice(0.001234)).toBe("0.001234")
      })

      it("formats smallest displayable price", () => {
         expect(formatPrice(0.000001)).toBe("0.000001")
      })
   })

   describe("small prices (0.01 to < 1) - 4 decimals", () => {
      it("formats at boundary 0.01", () => {
         expect(formatPrice(0.01)).toBe("0.0100")
      })

      it("formats typical sub-dollar price", () => {
         expect(formatPrice(0.5432)).toBe("0.5432")
      })
   })

   describe("normal prices (1 to < 1000) - 2 decimals", () => {
      it("formats at boundary 1", () => {
         expect(formatPrice(1)).toBe("1.00")
      })

      it("formats typical token price", () => {
         expect(formatPrice(3.42)).toBe("3.42")
      })

      it("formats near thousand", () => {
         expect(formatPrice(999.99)).toBe("999.99")
      })
   })

   describe("large prices (>= 1000) - comma formatted", () => {
      it("formats at boundary 1000", () => {
         expect(formatPrice(1000)).toBe("1,000.00")
      })

      it("formats BTC-scale price", () => {
         expect(formatPrice(68432.15)).toBe("68,432.15")
      })
   })
})

describe("truncateAddress", () => {
   const addr = "7nYpAbC123def456ghi789jkl012mno345pqr678stu9"

   it("truncates with default 4 chars", () => {
      const result = truncateAddress(addr)
      expect(result).toBe("7nYp...stu9")
   })

   it("truncates with custom chars", () => {
      expect(truncateAddress(addr, 8)).toBe("7nYpAbC1...r678stu9")
   })

   it("works with typical tx signature display", () => {
      const sig = "5xYzAbC123def456ghi789jkl012mno345pqr678stu901vwx234"
      const result = truncateAddress(sig, 8)
      expect(result).toMatch(/^.{8}\.\.\..{8}$/)
   })

   it("handles short string", () => {
      expect(truncateAddress("abcd", 2)).toBe("ab...cd")
   })
})

describe("lamportsToSol", () => {
   it("converts 1 SOL worth of lamports", () => {
      expect(lamportsToSol(1_000_000_000)).toBe(1)
   })

   it("converts 0 lamports", () => {
      expect(lamportsToSol(0)).toBe(0)
   })

   it("converts 1 lamport (smallest unit)", () => {
      expect(lamportsToSol(1)).toBe(0.000000001)
   })

   it("converts large balance", () => {
      expect(lamportsToSol(100_000_000_000)).toBe(100)
   })
})

describe("solToLamports", () => {
   it("converts 1 SOL", () => {
      expect(solToLamports(1)).toBe(1_000_000_000)
   })

   it("converts 0 SOL", () => {
      expect(solToLamports(0)).toBe(0)
   })

   it("floors fractional lamports", () => {
      // 0.0000000015 SOL = 1.5 lamports -> Math.floor = 1
      expect(solToLamports(0.0000000015)).toBe(1)
   })

   it("converts 0.005 SOL (fee reserve)", () => {
      expect(solToLamports(0.005)).toBe(5_000_000)
   })
})

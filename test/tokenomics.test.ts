import { describe, it, expect } from "vitest"
import {
   TOTAL_SUPPLY,
   SOLANA_SUPPLY,
   DBC_SUPPLY,
   SOLANA_NON_DBC_SUPPLY,
   TOKEN_DECIMALS,
   QUOTE_DECIMALS,
   GRADUATION_THRESHOLD_USDC,
} from "@/config/const"

/**
 * @dev Validates tokenomics constants that are critical for on-chain correctness.
 *
 * Security context: these constants drive pool state calculations, remaining seats
 * formula, and swap amount scaling. A wrong decimal count would produce amounts
 * off by orders of magnitude. Wrong supply numbers would display incorrect
 * availability, misleading users.
 *
 * Source of truth: Solana explorer for on-chain token config, Meteora pool state
 * for DBC parameters.
 */
describe("tokenomics constants", () => {
   describe("supply allocation", () => {
      it("total supply is 10,000 QQ (Solana + Ethereum)", () => {
         expect(TOTAL_SUPPLY).toBe(10_000)
      })

      it("Solana supply is 6,000 QQ", () => {
         expect(SOLANA_SUPPLY).toBe(6_000)
      })

      it("DBC supply is 2,600 QQ (sold via bonding curve)", () => {
         expect(DBC_SUPPLY).toBe(2_600)
      })

      it("non-DBC supply is 3,400 QQ (LP + airdrop + core + partnerships)", () => {
         expect(SOLANA_NON_DBC_SUPPLY).toBe(3_400)
      })

      it("DBC + non-DBC = Solana supply", () => {
         expect(DBC_SUPPLY + SOLANA_NON_DBC_SUPPLY).toBe(SOLANA_SUPPLY)
      })

      it("Solana supply is less than total supply", () => {
         expect(SOLANA_SUPPLY).toBeLessThan(TOTAL_SUPPLY)
      })

      it("Ethereum allocation is 4,000 QQ (total - Solana)", () => {
         expect(TOTAL_SUPPLY - SOLANA_SUPPLY).toBe(4_000)
      })
   })

   describe("token precision", () => {
      it("QQ token has 9 decimals (matches on-chain SPL mint)", () => {
         expect(TOKEN_DECIMALS).toBe(9)
      })

      it("DBC quote token (USDC) has 6 decimals", () => {
         expect(QUOTE_DECIMALS).toBe(6)
      })

      it("graduation threshold is 20,000 USDC", () => {
         expect(GRADUATION_THRESHOLD_USDC).toBe(20_000)
      })
   })

   describe("remaining seats formula integrity", () => {
      // remainingSeats = Math.floor(baseRemaining) - SOLANA_NON_DBC_SUPPLY
      // where baseRemaining = pool.baseReserve / 10^TOKEN_DECIMALS

      it("at launch (no sales), remaining seats = DBC_SUPPLY", () => {
         const baseRemaining = SOLANA_SUPPLY // full pool
         const seats = Math.floor(baseRemaining) - SOLANA_NON_DBC_SUPPLY
         expect(seats).toBe(DBC_SUPPLY)
      })

      it("when all DBC tokens sold, remaining seats = 0", () => {
         const baseRemaining = SOLANA_NON_DBC_SUPPLY // only non-DBC tokens left
         const seats = Math.floor(baseRemaining) - SOLANA_NON_DBC_SUPPLY
         expect(seats).toBe(0)
      })

      it("seats never exceeds DBC_SUPPLY", () => {
         const maxSeats = SOLANA_SUPPLY - SOLANA_NON_DBC_SUPPLY
         expect(maxSeats).toBe(DBC_SUPPLY)
         expect(maxSeats).toBeLessThanOrEqual(DBC_SUPPLY)
      })
   })
})

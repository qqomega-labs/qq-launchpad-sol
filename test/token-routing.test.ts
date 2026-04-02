import { describe, it, expect } from "vitest"
import {
   SOL_MINT,
   USDC_MINT,
   USDT_MINT,
   QQ_MINT,
   isSOL,
   isUSDC,
   isQQ,
   isDirectPath,
   getToken,
   TOKENS,
} from "@/config/tokens"

/**
 * @dev Token routing determines whether a swap uses:
 *   - Direct path: single-leg via Meteora DBC (USDC <-> QQ only)
 *   - Hybrid path: two-leg via Jupiter + DBC (SOL/USDT <-> QQ)
 *
 * Security context: incorrect routing could send funds to the wrong pool,
 * use wrong decimals, or attempt Jupiter swaps for tokens it can't route.
 * QQ is NOT listed on Jupiter (pre-graduation), so direct Jupiter swaps
 * with QQ would fail and potentially lock user funds.
 */
describe("token routing", () => {
   describe("mint address constants", () => {
      it("SOL_MINT is wrapped SOL (So111...112)", () => {
         expect(SOL_MINT).toBe("So11111111111111111111111111111111111111112")
      })

      it("USDC_MINT is correct mainnet USDC", () => {
         expect(USDC_MINT).toBe("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
      })

      it("USDT_MINT is correct mainnet USDT", () => {
         expect(USDT_MINT).toBe("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB")
      })

      it("QQ_MINT matches the deployed token", () => {
         expect(QQ_MINT).toBe("76vURLKDqAMhiX2wvoedoWRNvwqSjsZ7EtrJKJiKArDN")
      })
   })

   describe("token identification helpers", () => {
      it("isSOL identifies only SOL mint", () => {
         expect(isSOL(SOL_MINT)).toBe(true)
         expect(isSOL(USDC_MINT)).toBe(false)
         expect(isSOL(QQ_MINT)).toBe(false)
      })

      it("isUSDC identifies only USDC mint", () => {
         expect(isUSDC(USDC_MINT)).toBe(true)
         expect(isUSDC(SOL_MINT)).toBe(false)
         expect(isUSDC(QQ_MINT)).toBe(false)
      })

      it("isQQ identifies only QQ mint", () => {
         expect(isQQ(QQ_MINT)).toBe(true)
         expect(isQQ(SOL_MINT)).toBe(false)
         expect(isQQ(USDC_MINT)).toBe(false)
      })

      it("rejects empty string for all helpers", () => {
         expect(isSOL("")).toBe(false)
         expect(isUSDC("")).toBe(false)
         expect(isQQ("")).toBe(false)
      })

      it("rejects arbitrary string for all helpers", () => {
         expect(isSOL("not-a-mint")).toBe(false)
         expect(isUSDC("not-a-mint")).toBe(false)
         expect(isQQ("not-a-mint")).toBe(false)
      })
   })

   describe("isDirectPath (DBC pool routing)", () => {
      it("USDC -> QQ is direct (DBC buy)", () => {
         expect(isDirectPath(USDC_MINT, QQ_MINT)).toBe(true)
      })

      it("QQ -> USDC is direct (DBC sell)", () => {
         expect(isDirectPath(QQ_MINT, USDC_MINT)).toBe(true)
      })

      it("SOL -> QQ is NOT direct (requires hybrid Jupiter + DBC)", () => {
         expect(isDirectPath(SOL_MINT, QQ_MINT)).toBe(false)
      })

      it("QQ -> SOL is NOT direct (requires hybrid DBC + Jupiter)", () => {
         expect(isDirectPath(QQ_MINT, SOL_MINT)).toBe(false)
      })

      it("USDT -> QQ is NOT direct (requires hybrid Jupiter + DBC)", () => {
         expect(isDirectPath(USDT_MINT, QQ_MINT)).toBe(false)
      })

      it("QQ -> USDT is NOT direct (requires hybrid DBC + Jupiter)", () => {
         expect(isDirectPath(QQ_MINT, USDT_MINT)).toBe(false)
      })

      it("SOL -> USDC is NOT direct (no QQ involved)", () => {
         expect(isDirectPath(SOL_MINT, USDC_MINT)).toBe(false)
      })

      it("same token is NOT direct", () => {
         expect(isDirectPath(SOL_MINT, SOL_MINT)).toBe(false)
         expect(isDirectPath(QQ_MINT, QQ_MINT)).toBe(false)
      })
   })

   describe("token registry (decimals)", () => {
      it("SOL has 9 decimals", () => {
         expect(getToken(SOL_MINT)?.decimals).toBe(9)
      })

      it("USDC has 6 decimals (DBC quote token)", () => {
         expect(getToken(USDC_MINT)?.decimals).toBe(6)
      })

      it("USDT has 6 decimals", () => {
         expect(getToken(USDT_MINT)?.decimals).toBe(6)
      })

      it("QQ has 9 decimals (DBC base token)", () => {
         expect(getToken(QQ_MINT)?.decimals).toBe(9)
      })

      it("unknown mint returns undefined", () => {
         expect(getToken("unknown-mint")).toBeUndefined()
      })

      it("all registered tokens have required fields", () => {
         for (const [mint, token] of Object.entries(TOKENS)) {
            expect(token.mint).toBe(mint)
            expect(token.symbol).toBeTruthy()
            expect(token.name).toBeTruthy()
            expect(token.decimals).toBeGreaterThanOrEqual(0)
            expect(token.icon).toBeTruthy()
         }
      })
   })
})

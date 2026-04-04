import { describe, it, expect, vi } from "vitest"
import { PublicKey } from "@solana/web3.js"
import BN from "bn.js"
import { fetchSplBalance } from "@/lib/solana"

/**
 * @dev Tests for fetchSplBalance: on-chain SPL token balance lookup.
 * Used by hybrid swap to get actual USDC balance after leg 1,
 * preventing TOCTOU attacks where estimated amounts diverge from reality.
 */

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
const QQ_MINT = "76vURLKDqAMhiX2wvoedoWRNvwqSjsZ7EtrJKJiKArDN"

function mockConnection(accounts: Array<{ mint: string; amount: string }>) {
   return {
      getParsedTokenAccountsByOwner: vi.fn().mockResolvedValue({
         value: accounts.map((a) => ({
            account: {
               data: {
                  parsed: {
                     info: {
                        mint: a.mint,
                        tokenAmount: { amount: a.amount },
                     },
                  },
               },
            },
         })),
      }),
   } as any
}

describe("fetchSplBalance", () => {
   const owner = PublicKey.unique()

   it("returns the correct USDC balance", async () => {
      const conn = mockConnection([{ mint: USDC_MINT, amount: "5000000" }])
      const result = await fetchSplBalance(conn, owner, USDC_MINT)
      expect(result.eq(new BN("5000000"))).toBe(true)
   })

   it("returns BN(0) when no token account exists", async () => {
      const conn = mockConnection([])
      const result = await fetchSplBalance(conn, owner, USDC_MINT)
      expect(result.isZero()).toBe(true)
   })

   it("returns BN(0) when the target mint is not in the account list", async () => {
      const conn = mockConnection([{ mint: QQ_MINT, amount: "1000000000" }])
      const result = await fetchSplBalance(conn, owner, USDC_MINT)
      expect(result.isZero()).toBe(true)
   })

   it("returns the correct mint when multiple accounts exist", async () => {
      const conn = mockConnection([
         { mint: QQ_MINT, amount: "999000000000" },
         { mint: USDC_MINT, amount: "12345678" },
      ])
      const result = await fetchSplBalance(conn, owner, USDC_MINT)
      expect(result.eq(new BN("12345678"))).toBe(true)
   })

   it("handles zero balance account correctly", async () => {
      const conn = mockConnection([{ mint: USDC_MINT, amount: "0" }])
      const result = await fetchSplBalance(conn, owner, USDC_MINT)
      expect(result.isZero()).toBe(true)
   })
})

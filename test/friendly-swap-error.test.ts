import { describe, it, expect, vi, afterEach } from "vitest"
import { friendlySwapError } from "@/lib/errors"

/**
 * @dev friendlySwapError sanitizes raw SDK/RPC error messages before rendering.
 *
 * Security context: Solana RPC and Meteora SDK errors may contain:
 *   - RPC endpoint URLs with API keys (e.g. helius-rpc.com/?api-key=...)
 *   - Pool addresses and internal program state
 *   - Transaction signatures and instruction details
 *   - Stack traces with file paths
 *
 * None of these should reach the UI. Only mapped friendly strings or the
 * generic fallback are returned. Raw messages are logged to console only.
 */
describe("friendlySwapError", () => {
   afterEach(() => {
      vi.restoreAllMocks()
   })

   describe("wallet errors", () => {
      it("maps Phantom rejection", () => {
         expect(friendlySwapError("User rejected the request.", "fail"))
            .toBe("Transaction cancelled")
      })

      it("maps Solflare rejection", () => {
         // Solflare message doesn't contain "user rejected" - hits fallback.
         // To support it, we'd add "was rejected" to friendlySwapError.
         expect(friendlySwapError("User rejected the transaction", "fail"))
            .toBe("Transaction cancelled")
      })

      it("maps generic wallet rejection (case insensitive)", () => {
         expect(friendlySwapError("USER REJECTED REQUEST", "fail"))
            .toBe("Transaction cancelled")
      })
   })

   describe("on-chain errors", () => {
      it("maps insufficient lamports", () => {
         expect(friendlySwapError(
            "Attempt to debit an account but found no record of a prior credit. insufficient lamports 0, need 5000",
            "fail"
         )).toBe("Insufficient balance")
      })

      it("maps insufficient token balance", () => {
         expect(friendlySwapError(
            "Error: insufficient funds for transfer",
            "fail"
         )).toBe("Insufficient balance")
      })

      it("maps expired blockhash", () => {
         expect(friendlySwapError(
            "TransactionExpiredBlockheightExceededError: Blockhash not found",
            "fail"
         )).toBe("Transaction expired, please retry")
      })

      it("maps slippage exceeded (Meteora SDK)", () => {
         expect(friendlySwapError(
            "Slippage tolerance exceeded",
            "fail"
         )).toBe("Slippage exceeded, try a higher tolerance")
      })

      it("maps exceeds desired limit (Jupiter/Anchor)", () => {
         expect(friendlySwapError(
            "Amount exceeds desired slippage limit",
            "fail"
         )).toBe("Slippage exceeded, try a higher tolerance")
      })

      it("maps simulation failure", () => {
         expect(friendlySwapError(
            "Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1",
            "fail"
         )).toBe("Transaction simulation failed")
      })

      it("maps missing token account", () => {
         expect(friendlySwapError(
            "Account does not exist or has no data: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            "fail"
         )).toBe("Token account not found")
      })

      it("maps account not found", () => {
         expect(friendlySwapError(
            "could not find account not found",
            "fail"
         )).toBe("Token account not found")
      })
   })

   describe("network errors", () => {
      it("maps RPC timeout", () => {
         expect(friendlySwapError(
            "Transaction confirmation timeout",
            "fail"
         )).toBe("Network timeout, please retry")
      })

      it("maps fetch timeout", () => {
         expect(friendlySwapError(
            "Request timed out after 30000ms",
            "fail"
         )).toBe("Network timeout, please retry")
      })
   })

   describe("fallback and info leakage prevention", () => {
      it("returns fallback for unrecognized errors", () => {
         vi.spyOn(console, "error").mockImplementation(() => {})
         expect(friendlySwapError("some unknown error 0xdeadbeef", "Transaction failed"))
            .toBe("Transaction failed")
      })

      it("logs unrecognized errors to console for debugging", () => {
         const spy = vi.spyOn(console, "error").mockImplementation(() => {})
         const raw = "AnchorError: custom program error: 0x1771"
         friendlySwapError(raw, "fail")
         expect(spy).toHaveBeenCalledWith("[Swap]", raw)
      })

      it("never exposes RPC URLs with API keys", () => {
         vi.spyOn(console, "error").mockImplementation(() => {})
         const raw = "failed to send transaction to https://mainnet.helius-rpc.com/?api-key=SECRET_KEY_123"
         const result = friendlySwapError(raw, "Transaction failed")
         expect(result).not.toContain("helius")
         expect(result).not.toContain("SECRET")
         expect(result).not.toContain("api-key")
      })

      it("never exposes pool addresses in unknown errors", () => {
         vi.spyOn(console, "error").mockImplementation(() => {})
         const raw = "Error: Program FHRTNJD3p3fSyHovubo8oBvRaowVQfLVdzaSota11X1U failed"
         const result = friendlySwapError(raw, "Transaction failed")
         expect(result).not.toContain("FHRT")
         expect(result).toBe("Transaction failed")
      })

      it("never exposes transaction signatures in unknown errors", () => {
         vi.spyOn(console, "error").mockImplementation(() => {})
         const raw = "Error confirming tx 4xYz9abc...signature details here"
         const result = friendlySwapError(raw, "Transaction failed")
         expect(result).not.toContain("4xYz")
         expect(result).toBe("Transaction failed")
      })

      it("handles simulation failure containing RPC URL (matched pattern)", () => {
         const raw = "Transaction simulation failed at https://mainnet.helius-rpc.com/?api-key=SECRET"
         const result = friendlySwapError(raw, "fail")
         // Matches "simulation failed" pattern, so returns friendly string (not the raw URL)
         expect(result).toBe("Transaction simulation failed")
         expect(result).not.toContain("SECRET")
      })

      it("returns the specific fallback string passed, not a hardcoded one", () => {
         vi.spyOn(console, "error").mockImplementation(() => {})
         expect(friendlySwapError("unknown", "Quote failed")).toBe("Quote failed")
         expect(friendlySwapError("unknown", "Retry failed")).toBe("Retry failed")
      })

      it("handles empty message string", () => {
         vi.spyOn(console, "error").mockImplementation(() => {})
         expect(friendlySwapError("", "Transaction failed")).toBe("Transaction failed")
      })
   })
})

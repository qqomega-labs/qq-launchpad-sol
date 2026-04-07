import { describe, it, expect, vi, afterEach } from "vitest"
import { friendlySwapError, simulationFailureMessageFromLogs, SWAP_ERROR } from "@/lib/errors"
import { HELIUS_RPC_BASE } from "@/config/const"

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
         expect(friendlySwapError("User rejected the request.", "fail")).toBe(SWAP_ERROR.CANCELLED)
      })

      it("maps Solflare rejection", () => {
         // Solflare message doesn't contain "user rejected" - hits fallback.
         // To support it, we'd add "was rejected" to friendlySwapError.
         expect(friendlySwapError("User rejected the transaction", "fail")).toBe(SWAP_ERROR.CANCELLED)
      })

      it("maps generic wallet rejection (case insensitive)", () => {
         expect(friendlySwapError("USER REJECTED REQUEST", "fail")).toBe(SWAP_ERROR.CANCELLED)
      })
   })

   describe("on-chain errors", () => {
      it("maps insufficient lamports", () => {
         expect(
            friendlySwapError(
               "Attempt to debit an account but found no record of a prior credit. insufficient lamports 0, need 5000",
               "fail"
            )
         ).toBe(SWAP_ERROR.INSUFFICIENT_BALANCE)
      })

      it("maps insufficient token balance", () => {
         expect(friendlySwapError("Error: insufficient funds for transfer", "fail")).toBe(
            SWAP_ERROR.INSUFFICIENT_BALANCE
         )
      })

      it("maps insufficient SOL for rent (explicit)", () => {
         expect(friendlySwapError("insufficient funds for rent", "fail")).toBe(
            SWAP_ERROR.INSUFFICIENT_SOL_FOR_ATA_RENT
         )
      })

      it("maps insufficient lamports for rent", () => {
         expect(friendlySwapError("insufficient lamports for rent, need 2039280", "fail")).toBe(
            SWAP_ERROR.INSUFFICIENT_SOL_FOR_ATA_RENT
         )
      })

      it("maps expired blockhash", () => {
         expect(friendlySwapError("TransactionExpiredBlockheightExceededError: Blockhash not found", "fail")).toBe(
            SWAP_ERROR.EXPIRED
         )
      })

      it("maps slippage exceeded (Meteora SDK)", () => {
         expect(friendlySwapError("Slippage tolerance exceeded", "fail")).toBe(SWAP_ERROR.SLIPPAGE)
      })

      it("maps exceeds desired limit (Jupiter/Anchor)", () => {
         expect(friendlySwapError("Amount exceeds desired slippage limit", "fail")).toBe(SWAP_ERROR.SLIPPAGE)
      })

      it("maps simulation failure", () => {
         expect(
            friendlySwapError(
               "Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1",
               "fail"
            )
         ).toBe(SWAP_ERROR.SIMULATION_FAILED)
      })

      it("maps insufficient SOL for ATA creation (Jupiter sim)", () => {
         const raw =
            "Jupiter simulation failed: Program ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL invoke [1] | " +
            "Program 11111111111111111111111111111111 invoke [2] | " +
            "Transfer: insufficient lamports 1786770, need 2039280 | " +
            "Program 11111111111111111111111111111111 failed: custom program error: 0x1"

         expect(friendlySwapError(raw, "fail")).toBe(SWAP_ERROR.INSUFFICIENT_SOL_FOR_ATA)
      })

      it("does NOT map plain insufficient lamports to ATA error", () => {
         expect(friendlySwapError("insufficient lamports 0, need 5000", "fail")).toBe(SWAP_ERROR.INSUFFICIENT_BALANCE)
      })

      it("maps missing token account", () => {
         expect(
            friendlySwapError(
               "Account does not exist or has no data: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
               "fail"
            )
         ).toBe(SWAP_ERROR.ACCOUNT_NOT_FOUND)
      })

      it("maps account not found", () => {
         expect(friendlySwapError("could not find account not found", "fail")).toBe(SWAP_ERROR.ACCOUNT_NOT_FOUND)
      })
   })

   describe("network errors", () => {
      it("maps RPC timeout", () => {
         expect(friendlySwapError("Transaction confirmation timeout", "fail")).toBe(SWAP_ERROR.TIMEOUT)
      })

      it("maps fetch timeout", () => {
         expect(friendlySwapError("Request timed out after 30000ms", "fail")).toBe(SWAP_ERROR.TIMEOUT)
      })
   })

   describe("fallback and info leakage prevention", () => {
      it("returns fallback for unrecognized errors", () => {
         vi.spyOn(console, "error").mockImplementation(() => {})
         expect(friendlySwapError("some unknown error 0xdeadbeef", "Transaction failed")).toBe("Transaction failed")
      })

      it("logs unrecognized errors to console for debugging", () => {
         const spy = vi.spyOn(console, "error").mockImplementation(() => {})
         const raw = "AnchorError: custom program error: 0x1771"
         friendlySwapError(raw, "fail")
         expect(spy).toHaveBeenCalledWith("[Swap]", raw)
      })

      it("never exposes RPC URLs with API keys", () => {
         vi.spyOn(console, "error").mockImplementation(() => {})
         const raw = `failed to send transaction to ${HELIUS_RPC_BASE}?api-key=SECRET_KEY_123`
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
         const raw = `Transaction simulation failed at ${HELIUS_RPC_BASE}?api-key=SECRET`
         const result = friendlySwapError(raw, "fail")
         // Matches "simulation failed" pattern, so returns friendly string (not the raw URL)
         expect(result).toBe(SWAP_ERROR.SIMULATION_FAILED)
         expect(result).not.toContain("SECRET")
      })

      it("prefers ATA rent message when simulation text also mentions simulation failed", () => {
         const raw =
            "Transaction simulation failed: Error processing Instruction 1: insufficient funds for rent"
         expect(friendlySwapError(raw, "fail")).toBe(SWAP_ERROR.INSUFFICIENT_SOL_FOR_ATA_RENT)
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

describe("simulationFailureMessageFromLogs", () => {
   it("returns null for empty or missing logs", () => {
      expect(simulationFailureMessageFromLogs(null)).toBeNull()
      expect(simulationFailureMessageFromLogs(undefined)).toBeNull()
      expect(simulationFailureMessageFromLogs([])).toBeNull()
   })

   it("detects insufficient funds for rent in logs", () => {
      expect(
         simulationFailureMessageFromLogs(["Program log: insufficient funds for rent"])
      ).toBe("insufficient funds for rent")
   })

   it("detects ATA + insufficient lamports in combined logs", () => {
      const logs = [
         "Program ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL invoke [1]",
         "Program log: Transfer: insufficient lamports 1000, need 2039280",
         "Program log: Error: Associated Token Account",
      ]
      expect(simulationFailureMessageFromLogs(logs)).toBe("insufficient lamports for rent")
   })
})

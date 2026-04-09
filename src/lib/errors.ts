/**
 * @dev Map raw SDK/RPC error messages to user-friendly strings.
 * Prevents internal state leakage (RPC URLs, pool addresses, tx details) in the UI.
 */

// PUBLIC
export const SWAP_ERROR = {
   CANCELLED: "Transaction cancelled",
   INSUFFICIENT_BALANCE: "Insufficient balance",
   /** @dev SOL needed to create or fund an SPL associated token account (rent), not swap size */
   INSUFFICIENT_SOL_FOR_ATA_RENT:
      "Not enough SOL for token account rent: keep about 0.002 SOL in your wallet and try again",
   EXPIRED: "Transaction expired, please retry",
   SLIPPAGE: "Slippage exceeded, try a higher tolerance",
   TIMEOUT: "Network timeout, please retry",
   SIMULATION_FAILED: "Transaction simulation failed",
   ACCOUNT_NOT_FOUND: "Token account not found",
} as const

/**
 * @dev When simulateTransaction fails, RPC logs often explain rent/ATA issues while the
 * top-level error is generic. Returns a short phrase that friendlySwapError maps, or null.
 */
export function simulationFailureMessageFromLogs(logs: readonly string[] | null | undefined): string | null {
   if (!logs?.length) return null
   const t = logs.join("\n").toLowerCase()
   if (t.includes("insufficient funds for rent")) return "insufficient funds for rent"
   if (t.includes("insufficient lamports for rent")) return "insufficient lamports for rent"
   if (t.includes("account is not rent exempt")) return "insufficient lamports for rent"
   if (t.includes("failed to allocate account")) return "insufficient lamports for rent"
   if (t.includes("insufficient lamports") && t.includes("associated token")) return "insufficient lamports for rent"
   return null
}

export function friendlySwapError(msg: string, fallback: string): string {
   const lower = msg.toLowerCase()
   if (lower.includes("user rejected")) return SWAP_ERROR.CANCELLED
   if (
      lower.includes("insufficient funds for rent") ||
      lower.includes("insufficient lamports for rent") ||
      (lower.includes("account is not rent exempt") && lower.includes("insufficient"))
   ) {
      return SWAP_ERROR.INSUFFICIENT_SOL_FOR_ATA_RENT
   }
   if (lower.includes("insufficient")) return SWAP_ERROR.INSUFFICIENT_BALANCE
   if (lower.includes("blockhash")) return SWAP_ERROR.EXPIRED
   if (lower.includes("slippage") || lower.includes("exceeds desired")) return SWAP_ERROR.SLIPPAGE
   if (lower.includes("timeout") || lower.includes("timed out")) return SWAP_ERROR.TIMEOUT
   if (lower.includes("simulation failed")) return SWAP_ERROR.SIMULATION_FAILED
   if (lower.includes("not found") || lower.includes("account does not exist")) return SWAP_ERROR.ACCOUNT_NOT_FOUND
   // Log unrecognized errors for debugging, show generic message to user
   console.error("[Swap]", msg)
   return fallback
}

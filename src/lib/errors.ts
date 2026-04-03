/**
 * @dev Map raw SDK/RPC error messages to user-friendly strings.
 * Prevents internal state leakage (RPC URLs, pool addresses, tx details) in the UI.
 */

// PUBLIC
export const SWAP_ERROR = {
   CANCELLED: "Transaction cancelled",
   INSUFFICIENT_BALANCE: "Insufficient balance",
   EXPIRED: "Transaction expired, please retry",
   SLIPPAGE: "Slippage exceeded, try a higher tolerance",
   TIMEOUT: "Network timeout, please retry",
   SIMULATION_FAILED: "Transaction simulation failed",
   ACCOUNT_NOT_FOUND: "Token account not found",
} as const

export function friendlySwapError(msg: string, fallback: string): string {
   const lower = msg.toLowerCase()
   if (lower.includes("user rejected")) return SWAP_ERROR.CANCELLED
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

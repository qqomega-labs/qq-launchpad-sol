/**
 * @dev Map raw SDK/RPC error messages to user-friendly strings.
 * Prevents internal state leakage (RPC URLs, pool addresses, tx details) in the UI.
 */
export function friendlySwapError(msg: string, fallback: string): string {
   const lower = msg.toLowerCase()
   if (lower.includes("user rejected")) return "Transaction cancelled"
   if (lower.includes("insufficient")) return "Insufficient balance"
   if (lower.includes("blockhash")) return "Transaction expired, please retry"
   if (lower.includes("slippage") || lower.includes("exceeds desired")) return "Slippage exceeded, try a higher tolerance"
   if (lower.includes("timeout") || lower.includes("timed out")) return "Network timeout, please retry"
   if (lower.includes("simulation failed")) return "Transaction simulation failed"
   if (lower.includes("not found") || lower.includes("account does not exist")) return "Token account not found"
   // Log unrecognized errors for debugging, show generic message to user
   console.error("[Swap]", msg)
   return fallback
}

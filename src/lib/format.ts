/**
 * @dev Format a number with locale-specific thousands separators
 */
export function formatNumber(n: number, decimals = 0): string {
   return n.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
   })
}

/**
 * @dev Format a price with appropriate decimal places
 */
export function formatPrice(n: number): string {
   if (n < 0.01) return n.toFixed(6)
   if (n < 1) return n.toFixed(4)
   if (n < 1000) return n.toFixed(2)
   return formatNumber(n, 2)
}

/**
 * @dev Truncate a Solana address for display
 */
export function truncateAddress(addr: string, chars = 4): string {
   return `${addr.slice(0, chars)}...${addr.slice(-chars)}`
}

/**
 * @dev Format SOL amount from lamports
 */
export function lamportsToSol(lamports: number): number {
   return lamports / 1e9
}

/**
 * @dev Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
   return Math.floor(sol * 1e9)
}

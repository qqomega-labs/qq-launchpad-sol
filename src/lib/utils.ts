import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import BN from "bn.js"

/**
 * @dev Merge Tailwind classes safely, resolving conflicts via tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
   return twMerge(clsx(inputs))
}

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
 * @dev Convert lamports to SOL
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

/**
 * @dev Convert a human-readable token amount string to BN without floating-point arithmetic.
 * Parses the decimal string directly: avoids JS float precision issues like 0.1 * 1e9 = 100000000.00000001.
 */
export function parseTokenAmount(amount: string, decimals: number): BN {
   const [intPart = "0", fracPart = ""] = amount.split(".")
   const paddedFrac = fracPart.slice(0, decimals).padEnd(decimals, "0")
   const raw = (intPart + paddedFrac).replace(/^0+/, "") || "0"
   return new BN(raw)
}

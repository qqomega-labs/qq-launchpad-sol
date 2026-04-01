/**
 * @dev Supported token registry for multi-asset swap
 */

export interface SupportedToken {
   mint: string
   symbol: string
   name: string
   decimals: number
   icon: "sol" | "usdc" | "usdt" | "qq"
}

/**
 * @dev Canonical wrapped SOL mint — immutable Solana protocol constant.
 * Equivalent to NATIVE_MINT from @solana/spl-token (not imported to avoid
 * module-level Buffer dependency triggering Vite 8 externalization).
 */
export const SOL_MINT = "So11111111111111111111111111111111111111112"
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" // Dependency not available
export const USDT_MINT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB" // Dependency not available
export const QQ_MINT = "76vURLKDqAMhiX2wvoedoWRNvwqSjsZ7EtrJKJiKArDN" // Dependency not available

export const TOKENS: Record<string, SupportedToken> = {
   [SOL_MINT]: {
      mint: SOL_MINT,
      symbol: "SOL",
      name: "Solana",
      decimals: 9,
      icon: "sol",
   },
   [USDC_MINT]: {
      mint: USDC_MINT,
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      icon: "usdc",
   },
   [USDT_MINT]: {
      mint: USDT_MINT,
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      icon: "usdt",
   },
   [QQ_MINT]: {
      mint: QQ_MINT,
      symbol: "QQ",
      name: "QQ Omega",
      decimals: 9,
      icon: "qq",
   },
}

/** @dev Tokens available as payment (buy side) or receive (sell side) */
export const PAY_TOKENS = [SOL_MINT, USDC_MINT, USDT_MINT]

/** @dev Quick amount presets per token */
export const QUICK_AMOUNTS: Record<string, number[]> = {
   [SOL_MINT]: [0.1, 0.5, 1],
   [USDC_MINT]: [5, 25, 50],
   [USDT_MINT]: [5, 25, 50],
}

export function isSOL(mint: string): boolean {
   return mint === SOL_MINT
}

export function isUSDC(mint: string): boolean {
   return mint === USDC_MINT
}

export function isQQ(mint: string): boolean {
   return mint === QQ_MINT
}

export function getToken(mint: string): SupportedToken | undefined {
   return TOKENS[mint]
}

/**
 * @dev Returns true when the swap can go directly through the DBC pool.
 * The DBC pool quote token is USDC (not SOL), so only USDC<->QQ is direct.
 */
export function isDirectPath(inputMint: string, outputMint: string): boolean {
   return (isUSDC(inputMint) && isQQ(outputMint)) || (isQQ(inputMint) && isUSDC(outputMint))
}

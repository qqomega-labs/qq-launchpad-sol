/**
 * @dev Global constants
 */

import { PublicKey } from "@solana/web3.js"

export const POOL_ADDRESS = new PublicKey("FHRTNJD3p3fSyHovubo8oBvRaowVQfLVdzaSota11X1U")
export const TOKEN_MINT = new PublicKey("76vURLKDqAMhiX2wvoedoWRNvwqSjsZ7EtrJKJiKArDN")

export const TOTAL_SUPPLY = 10_000
export const SOLANA_SUPPLY = 6_000 // Total tokens minted into the DBC pool
export const DBC_SUPPLY = 2_600
export const SOLANA_NON_DBC_SUPPLY = 3_400 // LP migration 2400 + airdrop 750 + core 200 + partnerships 50
export const TOKEN_DECIMALS = 9
export const QUOTE_DECIMALS = 6 // DBC quote token is USDC (6 decimals)
export const GRADUATION_THRESHOLD_USDC = 20_000

export const HELIUS_RPC_BASE = "https://mainnet.helius-rpc.com/"

export const GT_BASE = "https://api.geckoterminal.com/api/v2"
export const GT_POOL_ADDR = "FHRTNJD3p3fSyHovubo8oBvRaowVQfLVdzaSota11X1U"

export const JUPITER_QUOTE_API = "https://api.jup.ag/swap/v1"
export const JUPITER_DATA_API = "https://datapi.jup.ag/v1"
export const JUPITER_WS = "wss://trench-stream.jup.ag/ws"

export const DEXSCREENER_URL = `https://dexscreener.com/solana/${GT_POOL_ADDR}`
export const GECKOTERMINAL_URL = `https://www.geckoterminal.com/solana/pools/${GT_POOL_ADDR}`

export const SOCIAL_LINKS = {
   twitter: "https://x.com/QQomega_labs",
   github: "https://github.com/qqomega-labs",
   website: "https://qqomega.xyz",
   docs: "https://docs.qqomega.xyz/docs/about/why",
   dexscreener: DEXSCREENER_URL,
   geckoterminal: GECKOTERMINAL_URL,
} as const

export const AUTHOR = {
   href: SOCIAL_LINKS.website,
   key: "QQ_Omega_labs",
   label: "QQ Omega Labs",
} as const

export const TIMEFRAMES = [
   { label: "1m", timeframe: "minute" as const, aggregate: 1, pollMs: 10_000 },
   { label: "5m", timeframe: "minute" as const, aggregate: 5, pollMs: 15_000 },
   { label: "15m", timeframe: "minute" as const, aggregate: 15, pollMs: 30_000 },
   { label: "1h", timeframe: "hour" as const, aggregate: 1, pollMs: 30_000 },
   { label: "4h", timeframe: "hour" as const, aggregate: 4, pollMs: 60_000 },
   { label: "1D", timeframe: "day" as const, aggregate: 1, pollMs: 60_000 },
] as const

export const DEFAULT_SLIPPAGE_BPS = 100 // 1%

export const SLIPPAGE_STORAGE_KEY = "qq-slippage"

// PRIVATE - Design tokens (raw values for JS contexts where Tailwind classes aren't usable)

export const COLORS = {
   accent: "#fd015a",
   accentDark: "#c70046",
   accentLight: "#ff3d7a",
   fomoSoft: "#ff9db8",
   green: "#00dc78",
   red: "#ff3d57",
   warning: "#ffc800",
   white: "#ffffff",
   textPrimary: "#f0e8f0",
   /** @dev Tailwind arbitrary class strings for glass accent elements */
   tw: {
      accentBg: "bg-[rgba(253,1,90,0.15)]",
      accentBgHover: "hover:bg-[rgba(253,1,90,0.25)]",
      accentGlow: "shadow-[0_0_20px_rgba(253,1,90,0.08)]",
      accentGlowSm: "shadow-[0_0_10px_rgba(253,1,90,0.12)]",
      accentTabActive: "bg-[rgba(253,1,90,0.12)]",
      skeletonBg: "bg-[rgba(253,1,90,0.08)]",
      headerBg: "bg-[rgba(4,1,8,0.8)]",
      fomoSoft: "text-[#ff9db8]",
      fomoWarm: "text-[#ff3d7a]",
      fomoHot: "text-[#fd015a]",
      warningText: "text-[#ffc800]",
      warningBg: "bg-[rgba(255,200,0,0.08)]",
      warningBorder: "border-[rgba(255,200,0,0.3)]",
      warningBtnBg: "bg-[rgba(255,200,0,0.15)]",
      warningBtnBgHover: "hover:bg-[rgba(255,200,0,0.25)]",
      successBorder: "!border-[rgba(0,220,120,0.4)]",
      errorBorder: "!border-[rgba(255,61,87,0.4)]",
   },
   /** @dev Raw rgba strings for style props and chart config */
   raw: {
      accentBg: "rgba(253, 1, 90, 0.15)",
      accentBgHover: "rgba(253, 1, 90, 0.25)",
      accentGlow: "rgba(253, 1, 90, 0.08)",
      accentTabActive: "rgba(253, 1, 90, 0.12)",
      accentGrid: "rgba(253, 1, 90, 0.06)",
      accentBorder: "rgba(253, 1, 90, 0.15)",
      accentBorderStrong: "rgba(253, 1, 90, 0.25)",
      accentSubtle: "rgba(253, 1, 90, 0.04)",
      accentFaint: "rgba(253, 1, 90, 0.02)",
      volumeUp: "rgba(253, 1, 90, 0.25)",
      volumeDown: "rgba(255, 255, 255, 0.15)",
      textSecondary: "rgba(240, 232, 240, 0.55)",
      glassBg: "rgba(10, 3, 18, 0.85)",
      shadow: "rgba(0, 0, 0, 0.5)",
      shadowDeep: "rgba(0, 0, 0, 0.6)",
      shadowText: "rgba(0, 0, 0, 0.7)",
      shadowLight: "rgba(0, 0, 0, 0.4)",
      shadowVignette: "rgba(0, 0, 0, 0.35)",
   },
} as const

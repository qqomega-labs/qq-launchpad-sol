/**
 * @dev Global constants
 */

import { PublicKey } from "@solana/web3.js";

export const POOL_ADDRESS = new PublicKey(
  "FHRTNJD3p3fSyHovubo8oBvRaowVQfLVdzaSota11X1U",
);
export const TOKEN_MINT = new PublicKey(
  "76vURLKDqAMhiX2wvoedoWRNvwqSjsZ7EtrJKJiKArDN",
);

export const TOTAL_SUPPLY = 10_000;
export const DBC_SUPPLY = 2_600;
export const TOKEN_DECIMALS = 6;
export const GRADUATION_THRESHOLD_USDC = 20_000;

export const GT_BASE = "https://api.geckoterminal.com/api/v2";
export const GT_POOL_ADDR = "FHRTNJD3p3fSyHovubo8oBvRaowVQfLVdzaSota11X1U";

export const DEXSCREENER_URL = `https://dexscreener.com/solana/${GT_POOL_ADDR}`;
export const GECKOTERMINAL_URL = `https://www.geckoterminal.com/solana/pools/${GT_POOL_ADDR}`;

export const SOCIAL_LINKS = {
  twitter: "https://x.com/QQomega_labs",
  github: "https://github.com/qqomega-labs",
  website: "https://qqomega.xyz",
  docs: "https://docs.qqomega.xyz/docs/about/why",
  dexscreener: DEXSCREENER_URL,
  geckoterminal: GECKOTERMINAL_URL,
} as const;

export const TIMEFRAMES = [
  { label: "1m", timeframe: "minute" as const, aggregate: 1, pollMs: 10_000 },
  { label: "5m", timeframe: "minute" as const, aggregate: 5, pollMs: 15_000 },
  { label: "15m", timeframe: "minute" as const, aggregate: 15, pollMs: 30_000 },
  { label: "1h", timeframe: "hour" as const, aggregate: 1, pollMs: 30_000 },
  { label: "4h", timeframe: "hour" as const, aggregate: 4, pollMs: 60_000 },
  { label: "1D", timeframe: "day" as const, aggregate: 1, pollMs: 60_000 },
] as const;

export const DEFAULT_SLIPPAGE_BPS = 100; // 1%

export const SLIPPAGE_STORAGE_KEY = "qq-slippage";

// PRIVATE - Design tokens (raw values for JS contexts where Tailwind classes aren't usable)

export const COLORS = {
  accent: '#fd015a',
  accentDark: '#c70046',
  accentLight: '#ff3d7a',
  green: '#00dc78',
  white: '#ffffff',
  /** @dev Tailwind arbitrary class strings for glass accent elements */
  tw: {
    accentBg: 'bg-[rgba(253,1,90,0.15)]',
    accentBgHover: 'hover:bg-[rgba(253,1,90,0.25)]',
    accentGlow: 'shadow-[0_0_20px_rgba(253,1,90,0.08)]',
    accentTabActive: 'bg-[rgba(253,1,90,0.12)]',
    skeletonBg: 'bg-[rgba(253,1,90,0.08)]',
    headerBg: 'bg-[rgba(4,1,8,0.7)]',
  },
  /** @dev Raw rgba strings for style props and chart config */
  raw: {
    accentBg: 'rgba(253, 1, 90, 0.15)',
    accentBgHover: 'rgba(253, 1, 90, 0.25)',
    accentGlow: 'rgba(253, 1, 90, 0.08)',
    accentTabActive: 'rgba(253, 1, 90, 0.12)',
    accentGrid: 'rgba(253, 1, 90, 0.06)',
    accentBorder: 'rgba(253, 1, 90, 0.15)',
    volumeUp: 'rgba(253, 1, 90, 0.25)',
    volumeDown: 'rgba(255, 255, 255, 0.15)',
    textSecondary: 'rgba(240, 232, 240, 0.55)',
  },
} as const;

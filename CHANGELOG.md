# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2026-03-28 (QQAlpha)

### Added

- **Project scaffolding** with Vite 8, React 19, TypeScript 5, Tailwind CSS 4
  - `@tailwindcss/vite` plugin (Tailwind 4 CSS-first config with `@theme` block)
  - Code-split chunks: `solana`, `wallet`, `chart`, `main`
  - `Buffer` polyfill for Solana browser compatibility
  - Cloudflare Pages deploy target (`es2020` build)
  - kebab-case file and folder naming convention
- **Glassmorphism design system** ported from qq-omega-landing
  - Deep purple background (`#040108`) with multi-layer radial pink glows
  - Honeycomb filigree SVG pattern at low opacity
  - Vignette overlay darkening edges
  - `.glass-panel` / `.glass-panel-accent` utility classes: `backdrop-blur: 40px`, translucent bg (`rgba(10,3,18,0.35)`), pink borders, inset highlight, glow shadows
  - Brand tokens: `--color-accent` (`#fd015a`), `--color-bg-primary` (`#040108`), `--color-text-primary` (`#f0e8f0`)
  - Centralized `COLORS` constant in `config/constants.ts` with `tw` (Tailwind class strings) and `raw` (rgba for style props / chart config) sub-objects, eliminating sparse color strings across components
  - Typography: Inter (headings/body), JetBrains Mono (numbers/addresses/stats)
  - `pulse-edge` keyframe animation for bonding curve progress bar
- **Wallet integration** via `@jup-ag/wallet-adapter` (Unified Wallet Kit)
  - `Header` with connect/disconnect flow, address truncation, copy-to-clipboard dropdown
  - Connect button styled as glass accent (translucent pink fill, glow, scale on press)
  - Auto-connect, dark theme, 20+ wallet support (Phantom, Solflare, Backpack, etc.)
- **Hero section** (`src/components/hero/`)
  - Value proposition: "1 QQ = 1 Dashboard Access" with utility-driven copy
  - Three live stat cards (glass panels): Total Supply, Burned (on-chain), Seats Remaining (derived)
  - `useBurnedSupply` hook reading `getTokenSupply` every 60s, deriving burn count from immutable 10K cap
  - Color thresholds on Seats Remaining: default > 9,000, accent < 9,000, red < 8,000
- **Swap panel** (`src/components/swap/`)
  - Buy/Sell tabs with Meteora DBC SDK integration (`@meteora-ag/dynamic-bonding-curve-sdk`)
  - `useSwap` hook: fetches pool + config state, resolves `currentPoint`, calls `pool.swapQuote()` and `pool.swap()`
  - Debounced quote fetching (500ms) with loading skeleton
  - Quick amount buttons (0.1 / 0.5 / 1 SOL)
  - Proper token icons: Solana three-stripe logo (SVG) and QQ Omega favicon
  - Slippage popover (glass panel) with presets (0.5%, 1%, 2%) + custom input, persisted to `localStorage`
  - CTA states: Connect Wallet, Enter Amount, Secure Your Seat, Confirming..., Confirmed
  - Fallback link: "Buy on DexScreener" with `ArrowUpRight` icon
- **Bonding curve progress bar** (`src/components/progress/`)
  - `usePoolState` hook polling DBC pool state every 15s via `state.getPool()` / `state.getPoolConfig()`
  - QQ-branded gradient fill (`#c70046` to `#fd015a` to `#ff3d7a`) with animated pulse on leading edge
  - Graduation detection: bar turns green (`#00dc78`) with "Graduated" messaging when threshold reached
  - Labels: `{sold} / 2,600 QQ sold` and `Graduates at $20K raised`
- **Chart panel** (`src/components/chart/`)
  - TradingView `lightweight-charts` v5 candlestick + volume histogram
  - 6 timeframes: 1m, 5m, 15m, 1h, 4h, 1D with per-timeframe polling intervals
  - QQ-branded candle colors: pink (`#fd015a`) up, white (`#ffffff`) down
  - Transparent chart background with pink-tinted grid lines
  - `useOhlcv` hook consuming GeckoTerminal API v2 with `setTimeout` chain for proper exponential backoff
  - CORS-blocked 429 handling (browser strips headers on rate-limited responses)
- **UI primitives** (`src/components/ui/`)
  - `Button` with glass-style `accent`, `ghost`, `tab` variants (translucent pink fills, glow shadows, scale on press)
  - `Skeleton` loading placeholder with pink-tinted pulse animation
  - `Toast` notification system (success/error) with auto-dismiss at 5s, bottom-right positioning
- **Icons** (`src/components/icons.tsx`)
  - `SolanaIcon`: three-stripe SVG from qq-omega-landing
  - `QQIcon`: favicon.svg reference
  - `XIcon` / `GithubIcon`: brand SVGs from qq-omega-landing (not in lucide)
  - `lucide-react` for all other icons: `Settings`, `Loader2`, `ArrowUpRight`, `Globe`, `BookOpen`, `Activity`, `Clock`
- **Footer** with social links (hover: accent pink): X, GitHub, Website, Docs, DexScreener, GeckoTerminal
- **Lib utilities** (`src/lib/`)
  - `gecko.ts`: GeckoTerminal OHLCV client with CORS-safe error handling
  - `format.ts`: `formatNumber`, `formatPrice`, `truncateAddress`, `lamportsToSol`, `solToLamports`
  - `solana.ts`: `getTokenSupply` helper
- **Config** (`src/config/const.ts`)
  - Pool address: `FHRTNJD3p3fSyHovubo8oBvRaowVQfLVdzaSota11X1U`
  - Token mint: `76vURLKDqAMhiX2wvoedoWRNvwqSjsZ7EtrJKJiKArDN`
  - Social links (matching qq-omega-landing URLs), timeframe definitions, slippage defaults
- **Assets** copied from qq-omega-landing
  - `public/logo.svg`: QQ Omega logo
  - `public/favicon.svg`: QQ Omega favicon with rounded corners
- **Responsive layout** (mobile-first)
  - Desktop (>=1024px): Hero 55% / Swap 45% side-by-side
  - Tablet/Mobile: single column stack (Hero, Swap, Progress, Chart)

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
- **Design system** (`src/styles/index.css`)
  - Brand tokens: `--color-accent` (#FE246C), `--color-bg-primary` (#0A0A0A), green/red candle colors
  - Typography: Inter (headings/body), JetBrains Mono (numbers/addresses/stats)
  - `pulse-edge` keyframe animation for bonding curve progress bar
- **Wallet integration** via `@jup-ag/wallet-adapter` (Unified Wallet Kit)
  - `Header` with connect/disconnect flow, address truncation, copy-to-clipboard dropdown
  - Auto-connect, dark theme, 20+ wallet support (Phantom, Solflare, Backpack, etc.)
- **Hero section** (`src/components/Hero/`)
  - Value proposition: "1 QQ = 1 Dashboard Access" with utility-driven copy
  - Three live stat cards: Total Supply (hardcoded 10,000), Burned (on-chain), Seats Remaining (derived)
  - `useBurnedSupply` hook reading `getTokenSupply` every 60s, deriving burn count from immutable 10K cap
  - Color thresholds on Seats Remaining: default > 9,000, accent < 9,000, red < 8,000
- **Swap panel** (`src/components/Swap/`)
  - Buy/Sell tabs with Meteora DBC SDK integration (`@meteora-ag/dynamic-bonding-curve-sdk`)
  - `useSwap` hook: fetches pool + config state, resolves `currentPoint`, calls `pool.swapQuote()` and `pool.swap()`
  - Debounced quote fetching (500ms) with loading skeleton
  - Quick amount buttons (0.1 / 0.5 / 1 SOL)
  - Slippage popover with presets (0.5%, 1%, 2%) + custom input, persisted to `localStorage`
  - CTA states: Connect Wallet, Enter Amount, Secure Your Seat, Confirming..., Confirmed
  - Fallback link: "Buy on DexScreener" for users preferring existing aggregators
- **Bonding curve progress bar** (`src/components/Progress/`)
  - `usePoolState` hook polling DBC pool state every 15s via `state.getPool()` / `state.getPoolConfig()`
  - Linear gradient fill (#FE246C to #FF4D8A) with animated pulse on leading edge
  - Graduation detection: bar turns green (#00E676) with "Graduated" messaging when threshold reached
  - Labels: `{sold} / 2,600 QQ sold` and `Graduates at $20K raised`
- **Chart panel** (`src/components/Chart/`)
  - TradingView `lightweight-charts` v5 candlestick + volume histogram
  - 6 timeframes: 1m, 5m, 15m, 1h, 4h, 1D with per-timeframe polling intervals
  - `useOhlcv` hook consuming GeckoTerminal API v2 with exponential backoff on 429 rate limits
  - Green/red candle colors matching design system
- **UI primitives** (`src/components/ui/`)
  - `Button` with `accent`, `ghost`, `tab` variants
  - `Skeleton` loading placeholder with pulse animation
  - `Toast` notification system (success/error) with auto-dismiss at 5s, bottom-right positioning
- **Footer** with social links: X, Website, Docs, DexScreener, GeckoTerminal
- **Lib utilities** (`src/lib/`)
  - `gecko.ts`: GeckoTerminal OHLCV client
  - `format.ts`: `formatNumber`, `formatPrice`, `truncateAddress`, `lamportsToSol`, `solToLamports`
  - `solana.ts`: `getTokenSupply` helper
- **Config** (`src/config/constants.ts`)
  - Pool address: `FHRTNJD3p3fSyHovubo8oBvRaowVQfLVdzaSota11X1U`
  - Token mint: `76vURLKDqAMhiX2wvoedoWRNvwqSjsZ7EtrJKJiKArDN`
  - Social links, timeframe definitions, slippage defaults
- **Responsive layout** (mobile-first)
  - Desktop (>=1024px): Hero 55% / Swap 45% side-by-side
  - Tablet/Mobile: single column stack (Hero, Swap, Progress, Chart)

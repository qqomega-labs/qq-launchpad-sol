# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2026-04-02 (QQAlpha)

### Added

- **Timeframe scoring system**: `TimeframeKey` type (`daily`, `weekly`, `monthly`, `yearly`), `Timeframe` interface, and `TIMEFRAMES` constant in `sphere-data.ts` with per-dimension weights from QQ Omega architecture; order is `1Y → 1M → 1W → 1D` (long-term first)
- **Timeframe chips UI**: `TimeframeChips` component in `qq-hex-sphere.tsx` rendered below dimension chips; only Yearly is selectable, others show lock icon and `cursor-not-allowed`; selected state defaults to `yearly`
- **`Dimension.enabled` flag**: `enabled` property added to `Dimension` interface; QQ composite added as first `DIMS` entry (`key: "comp"`, `enabled: true`); all five scoring dimensions set to `enabled: false`; `SCORE_DIMS` derived constant filters out the composite entry for use in calculations
- **Dimension chips lock UI**: disabled dims show lock icon, reduced opacity, and `cursor-not-allowed`; enabled dims are clickable

### Changed

- **`DimChips`**: renders all entries from `DIMS` uniformly (no hardcoded QQ chip); accepts `onSelect` callback; `sortKey` is now component state (was hardcoded `"comp"`)
- **`composite()` / `rankAll()`**: use `SCORE_DIMS` to exclude the composite entry from weight calculations; accept optional `timeframe` parameter for timeframe-specific dimension weights
- **Detail card scores**: individual dimension values blurred (`filter: blur(3px)`) — demo preview, real data gated behind QQ access; final `=` value now shows `data.qq` to match the score on the sphere tile
- **Swap panel fallback link**: replaced DexScreener link with GeckoTerminal; label changed from "or buy on DexScreener" to "see on GeckoTerminal"; import switched from `DEXSCREENER_URL` to `GECKOTERMINAL_URL`

## [Unreleased] - 2026-04-01 (QQAlpha)

### Added

- **Wallet balance display**: connected wallet balances shown in swap inputs (pay and receive sides), matching standard DEX UX; `use-wallet-balances.ts` hook fetches SOL via `getBalance` and SPL tokens (USDC, USDT, QQ) via `getParsedTokenAccountsByOwner`; resets on disconnect
- **HALF / MAX buttons**: appear on the pay input when wallet is connected; MAX reserves 0.005 SOL for fees when paying with SOL
- **`@solana/spl-token` dependency**: added as explicit dep for future token account operations; `SOL_MINT` and `TOKEN_PROGRAM_ID` defined as named constants (not imported at module level — see Changed)
- **`pnpm.peerDependencyRules`**: suppressed two known-safe peer dep warnings — `ws>utf-8-validate@6` (Node addon, irrelevant in browser) and `eslint-plugin-react-hooks>eslint@10` (compatible in practice, plugin range not yet updated)
- **Background aura**: increased radial glow opacity and spread across all breakpoints; responsive per screen size — mobile glow positioned higher (`50% 30%`), tablet (`50% 38%`), desktop (`50% 45%`) with extra top-edge layer; landscape phone override with wider horizontal ellipse; vignette reduced from `0.65` to `0.50/0.45` to let aura breathe
- **`COLORS` expansions**: `textPrimary` (`#f0e8f0`); `tw.accentGlowSm`, `tw.successBorder`, `tw.errorBorder`; `raw.accentBorderStrong`, `raw.glassBg`; `warning` (`#ffc800`) with `tw.warningText/warningBg/warningBorder/warningBtnBg/warningBtnBgHover`

### Changed

- **`tokens.ts`**: `SOL_MINT` defined as a named constant with inline doc — not imported from `@solana/spl-token` to avoid module-level `Buffer` dependency that triggers Vite 8 externalization
- **`use-wallet-balances.ts`**: `TOKEN_PROGRAM_ID` defined as a local `PublicKey` constant — same reason; `@solana/spl-token` import removed from critical path
- **`vite.config.ts`**: restored `resolve.alias: { buffer: "buffer" }` and `optimizeDeps.include: ["buffer"]`; removed `vite-plugin-node-polyfills` (incompatible with Vite 8 oxc — esbuild banner option is ignored)
- **`main.tsx`**: restored `window.Buffer = Buffer` polyfill (works for runtime code; module-level spl-token Buffer issue resolved by removing eager import)
- **`cn()` enforcement**: all `className` strings longer than ~80 chars across the entire codebase now use `cn()` split by logical group — `footer.tsx`, `header.tsx`, `tx-history.tsx`, `quick-amounts.tsx`, `slippage-popover.tsx`, `swap-panel.tsx`, `token-selector.tsx`, `qq-hex-sphere.tsx`, `hero-stat.tsx`, `swap-input.tsx`
- **Zero hardcoded color strings**: all remaining `#hex` and `rgba(...)` literals removed from JSX/components and replaced with `COLORS.tw.*` or `COLORS.raw.*` — `app.tsx`, `slippage-popover.tsx`, `qq-hex-sphere.tsx`, `swap-panel.tsx`

## [Unreleased] - 2026-03-31 (QQAlpha)

### Added

- **Prettier config**: `.prettierrc` with project overrides
- **`COLORS` expansions**: added `fomoSoft` (`#ff9db8`), `red` (`#ff3d57`); `tw.fomoSoft/fomoWarm/fomoHot` Tailwind text classes; `raw.accentSubtle/accentFaint`, `raw.shadow/shadowDeep/shadowText/shadowLight/shadowVignette`
- **Sonner** (`sonner@2.0.7`): replaced custom `ToastProvider`/`useToast` with Sonner `<Toaster>` mounted in `app.tsx`, glassmorphism-styled (`backdrop-filter: blur(12px)`, semi-transparent dark bg, accent border); success toasts use `--color-green` border, error toasts use `--color-red` border
- **`landscape:` Tailwind variant**: `@custom-variant landscape` targeting `orientation: landscape` + `max-height: 600px`, enabling height-aware responsive classes across all components

### Changed

- **Bundle split**: `index` entry chunk reduced from 646 kB to 33 kB
  - `react-dom` extracted into `vendor-react` chunk (222 kB)
  - `@meteora-ag/dynamic-bonding-curve-sdk` extracted into `meteora` chunk (705 kB) and made lazy via dynamic `import()` inside `getDbcQuoteRaw` and `executeDbcSwap` — SDK only loads when the first swap quote is requested
  - `QQHexSphere`, `ChartPanel`, `DataTabs` converted to `React.lazy` with `Suspense` fallbacks — deferred until after initial render
  - `chunkSizeWarningLimit` raised to 750 kB to reflect the Meteora SDK's fixed size
- **`src/lib/utils.ts`**: merged all format utilities (`formatNumber`, `formatPrice`, `truncateAddress`, `lamportsToSol`, `solToLamports`) into `utils.ts` alongside `cn`; `format.ts` reduced to a re-export shim
- **`cn` adoption**: replaced all template literal `className` constructions with `cn()` across `button.tsx`, `skeleton.tsx`, `tx-history.tsx`, `trade-feed.tsx`, `holders-table.tsx`, `bonding-progress.tsx`, `slippage-popover.tsx`, `token-selector.tsx`, `icons.tsx`, `header.tsx`, `hero-stat.tsx`, `qq-hex-sphere.tsx`
- **Format scripts**: `format` and `format:check` now use `prettier --write .` / `prettier --check .` instead of explicit glob patterns
- **`hero-stat.tsx`**: FOMO color classes now reference `COLORS.tw.fomoSoft/fomoWarm/fomoHot` instead of hardcoded Tailwind arbitrary values
- **`qq-hex-sphere.tsx`**: accent `rgba` and black shadow values replaced with `COLORS.raw.*` references
- **`swap-panel.tsx`**: `useToast` replaced with direct `toast.success` / `toast.error` calls from sonner
- **Landscape layout**: all components adapted for landscape phones and small tablets (`max-height: 600px`)
  - `trading-chart.tsx`: `landscape:h-[240px]`, chart JS `height` now reads `clientHeight` instead of hardcoded 400
  - `chart-panel.tsx`: skeleton `landscape:h-[240px]`
  - `qq-hex-sphere.tsx`: `landscape:max-h-[320px]` on root, `landscape:max-h-[260px]` on SVG
  - `header.tsx`: `landscape:h-12`, wallet dropdown gap `mt-6 → mt-2`
  - `swap-panel.tsx`: all vertical gaps tightened with `landscape:` variants (`p-3`, `mb-3`, `mt-2`, etc.)
  - `quick-amounts.tsx`: `py-2.5 min-h-[44px]` — 44px touch targets
  - `slippage-popover.tsx`: `py-3 min-h-[44px]` on presets, `max-h-[50vh]` on panel
  - `token-selector.tsx`: `max-h-[50vh] overflow-y-auto` on dropdown
  - `app.tsx`: `min-h-screen → min-h-dvh` for mobile browser chrome
  - `hero-section.tsx`: `landscape:flex-row landscape:items-center` for horizontal layout on landscape phones

### Removed

- **`.glass-panel-accent`**: Unused CSS class removed
- **`.stat-card`**: Hover lift CSS removed (no longer needed with borderless counters)
- **`DimChipsProps`** interface, `handleSort`, `setSortKey`, `setAnimKey` - unused after making chips non-interactive
- **Price impact UI**: Removed fee/price impact display from swap panel

### Fixed

- **`confirmTransaction` deprecation**: both DBC and Jupiter swap legs now use the `{ signature, blockhash, lastValidBlockHeight }` strategy via `connection.getLatestBlockhash()` before each send, replacing the deprecated string-signature overload
- **`TOKEN_DECIMALS`**: Corrected from `6` to `9` to match on-chain QQ token mint decimals
- **QQ token decimals in `tokens.ts`**: Corrected from `6` to `9` in token registry (affected swap input/output calculations)
- **Swap pricing**: 1 SOL was showing ~136 QQ instead of ~11 QQ because SOL lamports were sent to a USDC-denominated DBC pool
- **Swap input validation**: Only accepts numbers and dot as decimal separator, commas auto-converted to dots, rejects letters and symbols
- **Swap output clearing**: Output resets immediately when input is emptied or invalid
- **Header social icons**: hidden on mobile due to `hidden md:flex` — now always visible; "Launchpad -" label moved to `hidden md:inline` to free horizontal space on small screens
- **Token icons**: Replaced inline SVG `USDCIcon` and `USDTIcon` with official brand SVGs (`public/usdc.svg`, `public/usdt.svg`) loaded as `<img>` tags
- **Header**: New `.glass-header` CSS class replacing `glass-panel` overrides, translucent pseudo-element with `backdrop-filter: blur(5px)` and `rgba(21,16,29,0.15)` background matching qq-docs navbar style, bottom border uses `--color-border`
- **Hero stats**: Redesigned from bordered glass-panel cards to raw counter display with big bold numbers (`text-2xl md:text-3xl`), `/` separator between counters, no borders or card wrapping; renamed `StatCard` to `HeroStat`, moved from `stat-card.tsx` to `hero-stat.tsx`
- **Remaining seats**: Live counter showing `baseRemaining - 3,400` (pool reserve minus non-DBC allocations: LP 2,400 + airdrop 750 + core 200 + partnerships 50), powered by `usePoolState` hook
- **FOMO color system**: Four-level pink gradient for remaining seats counter: `default` (white), `fomo` (#ff9db8), `warm` (#ff3d7a), `hot` (#fd015a)
- **Header dropdown**: New `.glass-panel-solid` CSS class with solid background (`#0a0312`) for wallet popover
- **Glass panel**: Replaced `position: relative` with `isolation: isolate` for `backdrop-filter` stacking context without position side-effects
- **Sphere chips**: Converted `DimChips` from interactive buttons to display-only spans with `cursor-not-allowed` (demo preview)
- **React Compiler**: Removed all `useCallback` and `useMemo` from `qq-hex-sphere.tsx`, `swap-panel.tsx`, `toast.tsx`, `app.tsx` — React Compiler handles memoization automatically
- **Sphere detail panel**: Changed from flow layout (below sphere) to absolute overlay at bottom, eliminating vertical layout shift when selecting an asset
- **Swap routing**: Hybrid two-leg swap for SOL/USDT (Jupiter SOL/USDT->USDC, then DBC USDC->QQ); DBC pool quote token is USDC, not SOL; QQ is not listed on Jupiter pre-graduation
- **Swap routing**: USDC<->QQ goes direct via Meteora DBC; `isDirectPath` now checks USDC<->QQ instead of SOL<->QQ
- **Bonding progress**: `tokensSold` uses `SOLANA_SUPPLY (6,000) - baseRemaining` instead of `DBC_SUPPLY (2,600)` since the pool holds all 6,000 Solana tokens
- **Jupiter API**: Migrated from deprecated `quote-api.jup.ag/v6` to `api.jup.ag/swap/v1`, added `x-api-key` header from `VITE_JUPITER_API_KEY` env var

### Security

- **Content Security Policy**: `<meta http-equiv="Content-Security-Policy">` added to `index.html`, allowlisting Helius RPC, Jupiter API/WS, and GeckoTerminal; `frame-src` and `object-src` set to `none`
- **Slippage cap**: custom slippage input capped at 10% (was 50%); warning rendered when tolerance exceeds 2% to alert users of sandwich attack risk
- **Meteora SDK pinned**: `@meteora-ag/dynamic-bonding-curve-sdk` pinned to exact version `1.5.7` (was `latest`) to prevent silent supply-chain updates to the package that constructs on-chain transactions
- **Float-to-BN fix**: `parseTokenAmount(amount, decimals)` added to `utils.ts` — converts input strings to `BN` via integer string arithmetic, eliminating JS float precision errors (e.g. `0.1 * 1e9 = 100000000.00000001`); replaces all `new BN(Math.floor(parseFloat(...) * 10 ** decimals))` call sites in `swap-panel.tsx`
- **Stale quote guard**: `SwapQuote` now carries `quotedAt` timestamp; `handleSwap` re-fetches the quote before execution if it is older than 30 seconds, preventing execution against stale pricing
- **Partial execution recovery**: `PartialExecution` interface and `partialExecution` state added to `useSwap`; if leg 1 of a hybrid swap succeeds but leg 2 fails, a dismissible warning banner appears in `swap-panel.tsx` with a Retry button that re-quotes and re-executes the second leg via `retrySecondLeg()`
- **WebSocket schema validation**: `isValidTrade()` type guard added to `use-trade-feed.ts`; Jupiter WebSocket messages are filtered before entering React state, rejecting malformed or injected payloads
- **Jupiter error sanitization**: raw Jupiter API response bodies are now logged to `console.error` only; the UI receives a mapped user-friendly message (`friendlyJupiterError`) instead of potentially sensitive server internals
- **Amount input length cap**: `maxLength={20}` added to `SwapInput` to prevent absurdly large values that could cause `Infinity`/`NaN` in numeric conversions
- **RPC fallback warning**: `app.tsx` emits a `console.warn` when `VITE_RPC_ENDPOINT` is not set and the app falls back to the rate-limited public Solana RPC

## [Unreleased] - 2026-03-30 (QQAlpha)

### Added

- **QQ Hex Sphere** (`src/components/sphere/`): 3D interactive Fibonacci sphere with hexagonal crypto asset tiles
  - `sphere-data.ts`: typed dimension/category/asset data for 50 crypto assets scored across 5 dimensions (Macro, Fundamentals, Tokenomics, On-Chain, Technical)
  - `sphere-utils.ts`: geometry (Fibonacci sphere, surface repulsion, 3D rotation, hex path), scoring (`composite`, `qqScore`, `rankAll`), rank-based HSL coloring
  - `qq-hex-sphere.tsx`: main component with `DimChips` dimension selector, SVG sphere renderer, `Detail` card for selected asset
  - Drag-to-rotate with momentum decay (friction `0.94`, velocity tracking per frame)
  - Idle auto-rotation at `0.0012` rad/frame, pauses on hover, resumes on leave
  - Mobile touch support: `onTouchStart`/`onTouchMove`/`onTouchEnd`, `touch-action: none` on SVG, `preventDefault` to block scroll during drag
  - Wrapped in `glass-panel` card with header ("QQ Score", asset count, "drag to explore" hint)
  - Detail card flows below the sphere (not absolute overlay), uses `glass-panel` + `animate-fade-up`
- **Prettier** added as dev dependency with `format` and `format:check` scripts

### Changed

- **Page layout**: Sphere replaces hero paragraph next to swap panel
  - Hero section condensed to compact horizontal banner (tagline + 3 stat cards in a row)
  - Two-column section: Sphere (left 55%) + Swap panel + Bonding progress (right 45%), columns stretch to equal height via `lg:items-stretch`
  - Mobile order: hero banner, swap panel, sphere, bonding, chart, data
  - Bonding progress moved into swap column with `h-full flex flex-col justify-center` to fill remaining height
- **Unified border intensity**: Swap panel changed from `glass-panel-accent` to `glass-panel` so all widgets share `--color-border` (`rgba(253,1,90,0.15)`)
- **Text size audit and fixes** across all components
  - Minimum `text-xs` (12px) for all readable text, eliminated all sub-10px sizes
  - Hero headline bumped to `text-2xl md:text-3xl`, description to `text-sm md:text-base`
  - Stat card values bumped to `text-lg md:text-xl`, labels to `text-xs`
  - Data tab buttons: removed `text-xs` override, restored `text-sm` from Button `tab` variant
  - Table headers (`holders`, `trade-feed`, `tx-history`): `text-[10px]` bumped to `text-xs`
  - Swap route label: `text-[10px]` bumped to `text-xs`
  - DimChips: unified to `text-xs`, increased padding for touch targets
  - Detail panel: category badge `text-[10px] md:text-xs`, dimension scores `text-xs`, note `text-xs`
  - Touch targets improved: quick-amount buttons `py-1` to `py-2`, slippage presets `py-1.5` to `py-2`, load-more `py-2` to `py-2.5`
- **SVG hex text vertical spacing**: score y-offset `-0.30` to `-0.42`, rank `0.35` to `0.45` for better breathing room
- **Logo**: Replaced 1.2MB `public/logo.svg` with 7.8KB transparent SVG from qq-docs (`QQOmega_logo_transparent.svg`)

## [Unreleased] - 2026-03-29 (QQAlpha)

### Changed

- **Glass panels**: Removed frost gradient overlays and SVG noise grain for cleaner translucent panels
- **Header**: Sticky top with translucent blur background (`rgba(10,3,18,0.15)`), content blurs through on scroll

## [Unreleased] - 2026-03-28 (QQAlpha)

### Added

- **Multi-asset swap** with dual-path routing
  - Token selector dropdown on pay/receive inputs (SOL, USDC, USDT)
  - SOL <-> QQ swaps go direct via Meteora DBC SDK (unchanged, lowest latency)
  - USDC/USDT <-> QQ swaps route via Jupiter Quote API v6 + Swap API (headless `fetch`, no widget/iframe)
  - `VersionedTransaction` signing for Jupiter-routed swaps
  - Dynamic quick-amount presets per token: SOL [0.1, 0.5, 1], USDC/USDT [5, 25, 50]
  - Route indicator below output: "via Meteora DBC" or "via Jupiter"
  - Price impact display for Jupiter-routed swaps
- **Token registry** (`src/config/tokens.ts`)
  - `SupportedToken` type with mint, symbol, decimals, icon
  - Helpers: `isSOL()`, `isQQ()`, `getToken()`, `isDirectPath()`
  - `PAY_TOKENS` allowlist and `QUICK_AMOUNTS` per-token presets
- **Jupiter API clients** (zero new dependencies, pure `fetch`)
  - `src/lib/jupiter.ts`: Quote API + Swap API with typed responses and 429 retry
  - `src/lib/jupiter-data.ts`: Data API client for holders and transaction history
- **Token icons** (`src/components/icons.tsx`): `USDCIcon`, `USDTIcon` SVG components, `TokenIcon` mapper
- **Token selector** (`src/components/swap/token-selector.tsx`): glass-panel dropdown with click-outside dismiss
- **Live data feeds** (`src/components/data/`)
  - `useTradeFeed` hook: WebSocket to `wss://trench-stream.jup.ag/ws` with auto-reconnect and exponential backoff
  - `useHolders` hook: top holders polling every 60s from `datapi.jup.ag`
  - `useTxHistory` hook: cursor-based paginated transaction history with `loadMore`, `loadingMore`, `hasMore` state
  - `TradeFeed` component: live trade table with buy/sell color coding and Solscan tx links
  - `HoldersTable` component: top 20 holders with rank, address, amount, % of supply
  - `TxHistory` component: historical transactions with wallet + tx links, cursor pagination with "Load more" button
  - `DataTabs` container: tabbed UI (Live Trades | Top Holders | Transactions) below chart panel
- **Jupiter API constants** in `src/config/const.ts`: `JUPITER_QUOTE_API`, `JUPITER_DATA_API`, `JUPITER_WS`
- **LICENSE** file (proprietary, QQ Omega Labs)
- **README.md** with dev-friendly documentation: tech stack, setup, project structure, design system, build optimizations
- `package.json`: added `description`, `license`, `author`, `repository` fields
- **Project scaffolding** with Vite 8, React 19, TypeScript 5, Tailwind CSS 4
  - `@tailwindcss/vite` plugin (Tailwind 4 CSS-first config with `@theme` block)
  - Code-split chunks: `solana`, `wallet`, `chart`, `main`
  - `Buffer` polyfill for Solana browser compatibility
  - Cloudflare Pages deploy target (`es2020` build)
  - kebab-case file and folder naming convention
  - `@/` path alias for all cross-directory imports
  - Single `tsconfig.json` (merged app + node configs), `tsBuildInfoFile` in `node_modules/.tmp/`
  - `.gitignore`: `*.tsbuildinfo` excluded from repo
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

### Changed

- **Typography**: Inter replaced with **Outfit** (geometric, sharp, luxury feel)
  - Hero headline: 32px mobile / 38px desktop, bold, tight tracking, "Dashboard" keyword highlighted in accent
  - Stat card labels: uppercase with letter-spacing
  - Supply tagline: uppercase tracking-wider
- **UX layout**: Mobile-first swap priority
  - Swap panel renders first on mobile (order-1), hero second; desktop keeps hero left / swap right
  - Accent divider line between hero+swap and data sections
  - Staggered entrance animations (`fade-up`) on each section (0s to 0.4s delay)
- **CTA button**: Animated gradient shimmer (`btn-cta`), hover glow + lift (-1px), press scale, disabled state without animation
- **Progress bar**: Flowing animated gradient (`progress-gradient`) replacing static gradient
- **Stat cards**: Hover lift (-2px) with border glow transition (`stat-card` class)
- **Glass panels**: Border glow transition on hover
- **Header**: Uses `.glass-panel` class for frosted glass effect (blur + grain + frost gradient), replacing opaque `rgba(4,1,8,0.8)` background
- **Glassmorphism** upgraded: `backdrop-blur` 40px -> 64px with `saturate(120%)`, denser backgrounds (card 0.35 -> 0.55, input 0.3 -> 0.4, accent 0.4 -> 0.6), frost gradient, SVG noise grain overlay at 3% opacity, deeper shadows with glass rim highlight
- Global `cursor: pointer` on all clickable elements (`button`, `a`, `[role="button"]`, `select`, `summary`) via `@layer base`
- `SwapInput` now accepts `tokenMint` + optional `onTokenSelect` instead of static `tokenSymbol`/`tokenIcon` props
- `useSwap` hook signature: `getQuote(amountIn, inputMint, outputMint, slippageBps)` replaces `getQuote(amountIn, isSell, slippageBps)`
- `SwapPanel` manages `selectedPayMint`/`selectedReceiveMint` state; decimals resolved from token registry
- Layout: `DataTabs` added below `ChartPanel` in `app.tsx`

### Fixed

- `Buffer` externalization error in Jupiter swap path (explicit `import { Buffer } from 'buffer'` polyfill)
- Duplicate OHLCV timestamps from GeckoTerminal crashing `lightweight-charts` (deduplicate after sort)
- Jupiter Data API response mapping: `address`/`amount` for holders, `txHash`/`traderAddress`/`usdPrice`/`timestamp` (ISO) for transactions
- WebSocket cleanup in React StrictMode double-mount (deferred 100ms init + nullify `onclose` before teardown)

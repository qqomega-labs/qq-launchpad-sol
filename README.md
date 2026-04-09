# QQ Launchpad Sol

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Build in Public](https://img.shields.io/badge/Build-in%20Public-brightgreen.svg)](https://github.com/qqomegalabs)
[![Tests](https://github.com/qqomega-labs/qq-launchpad-sol/actions/workflows/test.yml/badge.svg)](https://github.com/qqomega-labs/qq-launchpad-sol/actions/workflows/test.yml)
[![Version](https://img.shields.io/github/package-json/v/qqomega-labs/qq-launchpad-sol?color=blue)](package.json)
[![React](https://img.shields.io/github/package-json/dependency-version/qqomega-labs/qq-launchpad-sol/react?logo=react&logoColor=white&color=61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/github/package-json/dependency-version/qqomega-labs/qq-launchpad-sol/dev/typescript?logo=typescript&logoColor=white&color=3178c6)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/github/package-json/dependency-version/qqomega-labs/qq-launchpad-sol/dev/vite?logo=vite&logoColor=white&color=646cff)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/github/package-json/dependency-version/qqomega-labs/qq-launchpad-sol/dev/tailwindcss?logo=tailwindcss&logoColor=white&color=38bdf8)](https://tailwindcss.com)
[![Vitest](https://img.shields.io/github/package-json/dependency-version/qqomega-labs/qq-launchpad-sol/dev/vitest?logo=vitest&logoColor=white&color=6e9f18)](https://vitest.dev)
[![Solana web3.js](https://img.shields.io/github/package-json/dependency-version/qqomega-labs/qq-launchpad-sol/@solana/web3.js?logo=solana&logoColor=white&color=9945ff)](https://solana.com)
[![pnpm](https://img.shields.io/badge/pnpm-package%20manager-f69220.svg?logo=pnpm&logoColor=white)](https://pnpm.io)

Solana launchpad for the QQ Omega token.
Users connect a wallet, buy/sell QQ through a Meteora Dynamic Bonding Curve (DBC), and track price action via TradingView-style charts.

## Tech Stack

| Layer     | Tech                                                         |
| --------- | ------------------------------------------------------------ |
| Framework | React 19, TypeScript 5, Vite 8                               |
| Styling   | Tailwind CSS 4 (CSS-first `@theme`, glassmorphism utilities) |
| Wallet    | `@jup-ag/wallet-adapter` (Unified Wallet Kit, 20+ wallets)   |
| Solana    | `@solana/web3.js` v1, `@solana/wallet-adapter-react`         |
| DBC       | `@meteora-ag/dynamic-bonding-curve-sdk`                      |
| Charts    | `lightweight-charts` v5 (TradingView) + GeckoTerminal OHLCV  |
| Icons     | `lucide-react` + custom SVG components                       |

## Getting Started

```bash
# install dependencies
pnpm install

# start dev server (http://localhost:5173)
pnpm dev

# type-check + production build
pnpm build

# preview production build
pnpm preview

# lint
pnpm lint

# run tests
pnpm test

# run tests in watch mode
pnpm test:watch
```

## Environment Variables

Create a `.env` file at the project root:

```env
VITE_RPC_API_KEY=your-helius-api-key
VITE_JUPITER_API_KEY=your-jupiter-api-key
```

## Key Constants

Defined in `src/config/const.ts`:

- **Pool address**: `FHRTNJD3p3fSyHovubo8oBvRaowVQfLVdzaSota11X1U`
- **Token mint**: `76vURLKDqAMhiX2wvoedoWRNvwqSjsZ7EtrJKJiKArDN`
- **Total supply**: 10,000 QQ (9 decimals)
- **DBC supply**: 2,600 QQ (sold through bonding curve)
- **Graduation threshold**: $20,000 USDC

## Testing

Vitest 4 with jsdom. All pure-function unit tests (no mocks, no flaky renders).

| Test file               | What it covers                                                                    |
| ----------------------- | --------------------------------------------------------------------------------- |
| `csp`                   | CSP meta tag validation (no `unsafe-eval`, wallet domains, `base-uri`)            |
| `token-routing`         | Mint constants, DBC direct vs hybrid routing, decimal registry                    |
| `sphere-scoring`        | Timeframe weight sums, composite scoring, ranking, data integrity                 |
| `utils`                 | `formatPrice` boundaries, `truncateAddress`, lamport conversion                   |
| `slippage-validation`   | localStorage tamper protection (caps at 10%, prevents sandwich attacks)           |
| `is-valid-trade`        | WebSocket type guard (rejects malformed / injected messages)                      |
| `parse-token-amount`    | Float-to-BN precision (prevents 0.1 \* 1e9 bugs on-chain)                         |
| `jupiter-tx-validation` | Program allowlist validation (rejects unknown programs before signing)            |
| `friendly-swap-error`   | SDK error sanitization (RPC URL / key leakage) + ATA rent detection from sim logs |
| `swap-input-validation` | Input regex (blocks script injection, scientific notation, negative amounts)      |
| `tokenomics`            | Supply allocation math, remaining seats formula                                   |
| `fetch-spl-balance`     | On-chain SPL token balance lookup (actual vs estimated USDC)                      |

## Build Optimizations

Vite is configured with manual chunk splitting for optimal caching:

| Chunk          | Contains                                  |
| -------------- | ----------------------------------------- |
| `vendor-react` | `react-dom`                               |
| `wallet`       | `@jup-ag/wallet-adapter`, wallet adapters |
| `meteora`      | `@meteora-ag/dynamic-bonding-curve-sdk`   |
| `chart`        | `lightweight-charts`                      |
| `index`        | Application code                          |

A custom Vite plugin (`bufferGlobalPlugin`) injects the `Buffer` polyfill directly into the `buffer` module at transform time, guaranteeing it runs before any chunk that depends on it (fixes Safari/Firefox).

Path alias `@/` maps to `src/` for clean imports.

## License

Copyright © 2026 QQ Omega Labs. All rights reserved.
See [LICENSE](LICENSE) for details.

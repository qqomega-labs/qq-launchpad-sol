# QQ Launchpad Sol

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

| Variable            | Description             | Default                               |
| ------------------- | ----------------------- | ------------------------------------- |
| `VITE_RPC_ENDPOINT` | Solana RPC endpoint URL | `https://api.mainnet-beta.solana.com` |

Create a `.env` file at the project root:

```env
VITE_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

## Key Constants

Defined in `src/config/const.ts`:

- **Pool address**: `FHRTNJD3p3fSyHovubo8oBvRaowVQfLVdzaSota11X1U`
- **Token mint**: `76vURLKDqAMhiX2wvoedoWRNvwqSjsZ7EtrJKJiKArDN`
- **Total supply**: 10,000 QQ (9 decimals)
- **DBC supply**: 2,600 QQ (sold through bonding curve)
- **Graduation threshold**: $20,000 USDC

## Testing

Vitest 4 with jsdom. **10 test files, 235 tests**, all pure-function unit tests (no mocks, no flaky renders).

| Test file               | Tests | What it covers                                                               |
| ----------------------- | ----: | ---------------------------------------------------------------------------- |
| `parse-token-amount`    |    18 | Float-to-BN precision (prevents 0.1 \* 1e9 bugs on-chain)                    |
| `friendly-swap-error`   |    21 | SDK error sanitization (blocks RPC URL / key leakage in UI)                  |
| `is-valid-trade`        |    29 | WebSocket type guard (rejects malformed / injected messages)                 |
| `slippage-validation`   |    19 | localStorage tamper protection (caps at 10%, prevents sandwich attacks)      |
| `swap-input-validation` |    25 | Input regex (blocks script injection, scientific notation, negative amounts) |
| `token-routing`         |    27 | Mint constants, DBC direct vs hybrid routing, decimal registry               |
| `tokenomics`            |    12 | Supply allocation math, remaining seats formula                              |
| `csp`                   |    19 | CSP meta tag validation (no `unsafe-eval`, wallet domains, `base-uri`)       |
| `utils`                 |    27 | `formatPrice` boundaries, `truncateAddress`, lamport conversion              |
| `sphere-scoring`        |    58 | Timeframe weight sums, composite scoring, ranking, data integrity            |

Every security fix from the [2026-04-03 audit](CHANGELOG.md) has matching test coverage.

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

## Responsive Layout

Mobile-first design:

- **Desktop** (> 1024px): Hero and Swap panels side-by-side
- **Mobile**: Vertically stacked, full-width components
- Touch targets minimum 44x44px

## License

Proprietary - Copyright © 2026 QQ Omega Labs. All rights reserved. See [LICENSE](LICENSE) for details.

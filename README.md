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
- **Total supply**: 10,000 QQ (6 decimals)
- **DBC supply**: 2,600 QQ (sold through bonding curve)
- **Graduation threshold**: $20,000 USDC

## Build Optimizations

Vite is configured with manual chunk splitting for optimal caching:

| Chunk    | Contains                                  |
| -------- | ----------------------------------------- |
| `solana` | `@solana/web3.js`                         |
| `wallet` | `@jup-ag/wallet-adapter`, wallet adapters |
| `chart`  | `lightweight-charts`                      |
| `main`   | Application code                          |

Path alias `@/` maps to `src/` for clean imports.

## Responsive Layout

Mobile-first design:

- **Desktop** (> 1024px): Hero and Swap panels side-by-side
- **Mobile**: Vertically stacked, full-width components
- Touch targets minimum 44x44px

## License

Proprietary - Copyright © 2026 QQ Omega Labs. All rights reserved. See [LICENSE](LICENSE) for details.

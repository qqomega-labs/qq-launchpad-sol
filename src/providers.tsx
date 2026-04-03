import type { ReactNode } from "react"
import { ConnectionProvider } from "@solana/wallet-adapter-react"
import { UnifiedWalletProvider } from "@jup-ag/wallet-adapter"
import { Toaster } from "sonner"
import { COLORS, HELIUS_RPC_BASE } from "@/config/const"

/** @dev Wallet + UI providers wrapper. */
export function Providers({ children }: { children: ReactNode }) {
   const endpoint = (() => {
      const apiKey = import.meta.env.VITE_RPC_API_KEY
      if (apiKey) return `${HELIUS_RPC_BASE}?api-key=${apiKey}`
      console.warn(
         "[QQ] VITE_RPC_API_KEY not set - falling back to rate-limited public RPC. Set a Helius API key in .env."
      )
      return "https://api.mainnet-beta.solana.com"
   })()

   return (
      <ConnectionProvider endpoint={endpoint}>
         <UnifiedWalletProvider
            wallets={[]}
            config={{
               autoConnect: true,
               env: "mainnet-beta",
               metadata: {
                  name: "QQ Launchpad",
                  description: "Secure your access to QQ Omega",
                  url: "https://launchpad.qqomega.xyz",
                  iconUrls: ["https://qqomega.xyz/logo.svg"],
               },
               theme: "dark",
            }}
         >
            {children}
            <Toaster
               theme="dark"
               position="bottom-right"
               toastOptions={{
                  style: {
                     background: COLORS.raw.glassBg,
                     backdropFilter: "blur(12px)",
                     border: `1px solid ${COLORS.raw.accentBorderStrong}`,
                     color: COLORS.textPrimary,
                     borderRadius: "8px",
                  },
                  classNames: {
                     success: COLORS.tw.successBorder,
                     error: COLORS.tw.errorBorder,
                  },
               }}
               style={
                  {
                     "--success-bg": COLORS.raw.glassBg,
                     "--success-border": COLORS.green,
                     "--success-text": COLORS.green,
                     "--error-bg": COLORS.raw.glassBg,
                     "--error-border": COLORS.red,
                     "--error-text": COLORS.red,
                  } as React.CSSProperties
               }
            />
         </UnifiedWalletProvider>
      </ConnectionProvider>
   )
}

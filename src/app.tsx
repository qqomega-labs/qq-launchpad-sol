import { lazy, Suspense } from "react"
import { ConnectionProvider } from "@solana/wallet-adapter-react"
import { UnifiedWalletProvider } from "@jup-ag/wallet-adapter"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero/hero-section"
import { SwapPanel } from "@/components/swap/swap-panel"
import { BondingProgress } from "@/components/progress/bonding-progress"
import { Footer } from "@/components/footer"
import { NotFoundPage } from "@/pages/not-found"
import { Toaster } from "sonner"
import { COLORS } from "@/config/const"

const QQHexSphere = lazy(() => import("@/components/sphere/qq-hex-sphere").then((m) => ({ default: m.QQHexSphere })))
const ChartPanel = lazy(() => import("@/components/chart/chart-panel").then((m) => ({ default: m.ChartPanel })))
const DataTabs = lazy(() => import("@/components/data/data-tabs").then((m) => ({ default: m.DataTabs })))

/**
 * @dev LaunchpadPage.
 */
function LaunchpadPage() {
   return (
      <div className="min-h-dvh flex flex-col relative bg-bg-primary">
         <div className="fixed inset-0 bg-radial-deep" />
         <div className="fixed inset-0 bg-filigree" />
         <div className="fixed inset-0 bg-vignette" />

         <div className="relative z-10 min-h-dvh flex flex-col">
            <Header />
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-6">
               {/* Hero banner - compact value prop + stats */}
               <div className="animate-fade-up mb-6">
                  <HeroSection />
               </div>

               {/* Sphere + Swap side by side, stretched to equal height */}
               <div className="flex flex-col lg:flex-row lg:items-stretch gap-5">
                  <div className="lg:w-[55%] order-2 lg:order-1 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                     <Suspense fallback={<div className="glass-panel rounded-[12px] aspect-square" />}>
                        <QQHexSphere />
                     </Suspense>
                  </div>
                  <div
                     className="lg:w-[45%] order-1 lg:order-2 flex flex-col gap-5 animate-fade-up"
                     style={{ animationDelay: "0s" }}
                  >
                     <SwapPanel />
                     <div className="flex-1">
                        <BondingProgress />
                     </div>
                  </div>
               </div>

               <div className="accent-divider my-6" />

               <div className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
                  <Suspense fallback={<div className="glass-panel rounded-[12px] h-[320px]" />}>
                     <ChartPanel />
                  </Suspense>
               </div>

               <div className="mt-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
                  <Suspense fallback={null}>
                     <DataTabs />
                  </Suspense>
               </div>
            </main>
            <Footer />
         </div>
      </div>
   )
}

/**
 * @dev App - renders NotFoundPage for any path other than "/".
 */
export default function App() {
   if (typeof window !== "undefined" && window.location.pathname !== "/") {
      return <NotFoundPage />
   }

   const endpoint =
      import.meta.env.VITE_RPC_ENDPOINT ||
      (() => {
         console.warn(
            "[QQ] VITE_RPC_ENDPOINT not set — falling back to rate-limited public RPC. Set a dedicated endpoint in .env."
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
            <LaunchpadPage />
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

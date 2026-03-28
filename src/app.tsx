import { useMemo } from "react";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { UnifiedWalletProvider } from "@jup-ag/wallet-adapter";
import { Header } from "./components/header";
import { HeroSection } from "./components/hero/hero-section";
import { SwapPanel } from "./components/swap/swap-panel";
import { BondingProgress } from "./components/progress/bonding-progress";
import { ChartPanel } from "./components/chart/chart-panel";
import { Footer } from "./components/footer";
import { ToastProvider } from "./components/ui/toast";

/**
 * @dev LaunchpadPage.
 */
function LaunchpadPage() {
  return (
    <div className="min-h-screen flex flex-col relative bg-bg-primary">
      {/* Background layers from qq-omega-landing */}
      <div className="fixed inset-0 bg-radial-deep" />
      <div className="fixed inset-0 bg-filigree" />
      <div className="fixed inset-0 bg-vignette" />

      <div className="relative z-10 min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-6 space-y-6">
        {/* Hero + Swap side by side on desktop */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-[55%]">
            <HeroSection />
          </div>
          <div className="lg:w-[45%]">
            <SwapPanel />
          </div>
        </div>

        <BondingProgress />
        <ChartPanel />
      </main>
      <Footer />
      </div>
    </div>
  );
}

/**
 * @dev App.
 */
export default function App() {
  const endpoint = useMemo(
    () =>
      import.meta.env.VITE_RPC_ENDPOINT ||
      "https://api.mainnet-beta.solana.com",
    [],
  );

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
        <ToastProvider>
          <LaunchpadPage />
        </ToastProvider>
      </UnifiedWalletProvider>
    </ConnectionProvider>
  );
}

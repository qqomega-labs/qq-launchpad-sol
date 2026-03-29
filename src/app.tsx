import { useMemo } from "react";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { UnifiedWalletProvider } from "@jup-ag/wallet-adapter";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero/hero-section";
import { SwapPanel } from "@/components/swap/swap-panel";
import { BondingProgress } from "@/components/progress/bonding-progress";
import { ChartPanel } from "@/components/chart/chart-panel";
import { DataTabs } from "@/components/data/data-tabs";
import { Footer } from "@/components/footer";
import { ToastProvider } from "@/components/ui/toast";

/**
 * @dev LaunchpadPage - reorganized for buy/sell-first UX.
 * Mobile: Swap at top, then hero context, then data.
 * Desktop: Swap panel pinned right, hero left, data below.
 */
function LaunchpadPage() {
  return (
    <div className="min-h-screen flex flex-col relative bg-bg-primary">
      <div className="fixed inset-0 bg-radial-deep" />
      <div className="fixed inset-0 bg-filigree" />
      <div className="fixed inset-0 bg-vignette" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-6">
          {/* Swap-first layout: swap panel is the hero on mobile */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Mobile: swap first, desktop: hero left */}
            <div className="lg:w-[55%] order-2 lg:order-1 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <HeroSection />
            </div>
            <div className="lg:w-[45%] order-1 lg:order-2 animate-fade-up" style={{ animationDelay: '0s' }}>
              <SwapPanel />
            </div>
          </div>

          <div className="accent-divider my-6" />

          <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <BondingProgress />
          </div>

          <div className="mt-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <ChartPanel />
          </div>

          <div className="mt-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <DataTabs />
          </div>
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

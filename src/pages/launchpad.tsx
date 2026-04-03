import { lazy, Suspense } from "react"
import { Header } from "@/components/header/header"
import { HeroSection } from "@/components/hero/hero-section"
import { SwapPanel } from "@/components/swap/swap-panel"
import { BondingProgress } from "@/components/progress/bonding-progress"
import { Footer } from "@/components/footer"
import { SphereSkeleton } from "@/components/sphere/sphere-skeleton"
import { ChartSkeleton } from "@/components/chart/chart-skeleton"
import { DataSkeleton } from "@/components/data/data-skeleton"
import { FEATURES } from "@/config/const"

const QQHexSphere = lazy(() => import("@/components/sphere/qq-hex-sphere").then((m) => ({ default: m.QQHexSphere })))
// Lazy import is guarded by FEATURES.CHART; when false the module is never loaded
// and useOhlcv never starts polling
const ChartPanel = lazy(() => import("@/components/chart/chart-panel").then((m) => ({ default: m.ChartPanel })))
const DataTabs = lazy(() => import("@/components/data/data-tabs").then((m) => ({ default: m.DataTabs })))

/** @dev Main launchpad page layout with lazy-loaded heavy sections. */
export function LaunchpadPage() {
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
                  <div className="lg:w-[55%] order-1 lg:order-1 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                     <Suspense fallback={<SphereSkeleton />}>
                        <QQHexSphere />
                     </Suspense>
                  </div>
                  <div
                     className="lg:w-[45%] order-2 lg:order-2 flex flex-col gap-5 animate-fade-up"
                     style={{ animationDelay: "0s" }}
                  >
                     <SwapPanel />
                     <div className="flex-1">
                        <BondingProgress />
                     </div>
                  </div>
               </div>

               <div className="accent-divider my-6" />

               {FEATURES.CHART && (
                  <div className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
                     <Suspense fallback={<ChartSkeleton />}>
                        <ChartPanel />
                     </Suspense>
                  </div>
               )}

               <div className="mt-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
                  <Suspense fallback={<DataSkeleton />}>
                     <DataTabs />
                  </Suspense>
               </div>
            </main>
            <Footer />
         </div>
      </div>
   )
}

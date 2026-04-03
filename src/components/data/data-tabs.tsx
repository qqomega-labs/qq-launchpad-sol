import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TxHistory } from "./tx-history"
import { TradeFeed } from "./trade-feed"
import { HoldersTable } from "./holders-table"
import { FEATURES } from "@/config/const"

// Build the active tab list from feature flags so the UI adapts automatically
const TABS = [
   "Tx History",
   ...(FEATURES.LIVE_TRADES ? ["Live Trades"] : []),
   ...(FEATURES.TOP_HOLDERS ? ["Top Holders"] : []),
] as const

type Tab = (typeof TABS)[number]

/**
 * @dev Tabbed container for data feed panels.
 * Active tabs are driven by FEATURES flags in src/config/const.ts
 * set LIVE_TRADES or TOP_HOLDERS to true to re-enable post-graduation.
 */
export function DataTabs() {
   const [activeTab, setActiveTab] = useState<Tab>(TABS[0])

   return (
      <div className="glass-panel rounded-[12px] p-4 md:p-5">
         {/* Tab bar: only rendered when more than one tab is active */}
         {TABS.length > 1 && (
            <div className="flex gap-1 mb-4 bg-bg-input rounded-[8px] p-1">
               {TABS.map((tab) => (
                  <Button
                     key={tab}
                     variant="tab"
                     active={activeTab === tab}
                     onClick={() => setActiveTab(tab)}
                     className="flex-1"
                  >
                     {tab}
                  </Button>
               ))}
            </div>
         )}

         {activeTab === "Tx History" && <TxHistory />}
         {FEATURES.LIVE_TRADES && activeTab === "Live Trades" && <TradeFeed />}
         {FEATURES.TOP_HOLDERS && activeTab === "Top Holders" && <HoldersTable />}
      </div>
   )
}

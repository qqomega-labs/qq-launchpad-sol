import { Button } from "@/components/ui/button"
// TODO: Re-enable Live Trades tab and WebSocket feed after graduation
// import { TradeFeed } from "./trade-feed";
// TODO: Re-enable Top Holders tab after graduation
// import { HoldersTable } from "./holders-table";
import { TxHistory } from "./tx-history"

/**
 * @dev Tabbed container for data feed panels.
 * Live Trades and Top Holders tabs disabled pre-graduation.
 * TODO: Add "Live Trades" and "Top Holders" back post-graduation.
 */
export function DataTabs() {
   return (
      <div className="glass-panel rounded-[12px] p-5">
         {/* TODO: Re-enable tab bar when multiple tabs are active */}
         {/* <div className="flex gap-1 mb-4 bg-bg-input rounded-[8px] p-1"> */}
         {/*   {TABS.map((tab) => ( */}
         {/*     <Button key={tab} variant="tab" active={activeTab === tab} onClick={() => setActiveTab(tab)} className="flex-1">{tab}</Button> */}
         {/*   ))} */}
         {/* </div> */}

         {/* Tab content */}
         {/* {activeTab === "Live Trades" && <TradeFeed />} */}
         {/* {activeTab === "Top Holders" && <HoldersTable />} */}
         <TxHistory />
      </div>
   )
}

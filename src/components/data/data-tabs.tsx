import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TradeFeed } from './trade-feed';
import { HoldersTable } from './holders-table';
import { TxHistory } from './tx-history';

const TABS = ['Live Trades', 'Top Holders', 'Transactions'] as const;
type Tab = (typeof TABS)[number];

/**
 * @dev Tabbed container for data feed panels (trades, holders, tx history)
 */
export function DataTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('Live Trades');

  return (
    <div className="glass-panel rounded-[12px] p-5">
      {/* Tab bar */}
      <div className="flex gap-1 mb-4 bg-bg-input rounded-[8px] p-1">
        {TABS.map((tab) => (
          <Button
            key={tab}
            variant="tab"
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 text-xs"
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Live Trades' && <TradeFeed />}
      {activeTab === 'Top Holders' && <HoldersTable />}
      {activeTab === 'Transactions' && <TxHistory />}
    </div>
  );
}

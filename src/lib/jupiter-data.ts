/**
 * @dev Jupiter Data API client for holders, transactions, and token info
 */

import { JUPITER_DATA_API } from '@/config/const';

// PUBLIC

export interface TopHolder {
  address: string;
  amount: number;
  pct: number;
}

export interface TxRecord {
  txHash: string;
  type: string;
  asset: string;
  amount: number;
  usdPrice: number;
  usdVolume: number;
  traderAddress: string;
  timestamp: string;
}

export interface TxHistoryResponse {
  txs: TxRecord[];
  next: string | null;
}

/**
 * @dev Fetch top token holders
 */
export async function fetchTopHolders(mint: string): Promise<TopHolder[]> {
  const res = await fetch(`${JUPITER_DATA_API}/holders/${mint}`);
  if (!res.ok) return [];
  const data = await res.json();
  const raw: Array<Record<string, unknown>> = Array.isArray(data) ? data : data.holders ?? [];
  return raw.map((h) => ({
    address: (h.address as string) ?? '',
    amount: (h.amount as number) ?? 0,
    pct: (h.pct as number) ?? 0,
  }));
}

/**
 * @dev Fetch paginated transaction history
 */
export async function fetchTxHistory(
  mint: string,
  offset?: string,
): Promise<TxHistoryResponse> {
  const url = new URL(`${JUPITER_DATA_API}/txs/${mint}`);
  if (offset) url.searchParams.set('offset', offset);

  const res = await fetch(url.toString());
  if (!res.ok) return { txs: [], next: null };

  const data = await res.json();
  return {
    txs: data.txs ?? [],
    next: data.next ?? null,
  };
}

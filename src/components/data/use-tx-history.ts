import { useState, useEffect, useCallback } from "react";
import { TOKEN_MINT } from "@/config/const";
import { fetchTxHistory, type TxRecord } from "@/lib/jupiter-data";

/**
 * @dev Hook for paginated transaction history via Jupiter Data API
 */
export function useTxHistory() {
  const [transactions, setTransactions] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await fetchTxHistory(TOKEN_MINT.toBase58());
        if (active) {
          setTransactions(data.txs);
          setNextCursor(data.next);
          setHasMore(!!data.next);
        }
      } catch {
        // Will show empty state
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchTxHistory(TOKEN_MINT.toBase58(), nextCursor);
      setTransactions((prev) => [...prev, ...data.txs]);
      setNextCursor(data.next);
      setHasMore(!!data.next);
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore]);

  return { transactions, loading, loadingMore, hasMore, loadMore };
}

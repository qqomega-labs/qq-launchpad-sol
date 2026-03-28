import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk';
import { POOL_ADDRESS, DBC_SUPPLY, TOKEN_DECIMALS } from '@/config/const';

interface PoolState {
  tokensSold: number;
  progressPct: number;
  graduated: boolean;
  loading: boolean;
}

/**
 * @dev Reads DBC pool state to determine bonding curve progress.
 * Uses client.state.getPool() and client.state.getPoolConfig() per SDK API.
 * Polls every 15 seconds.
 */
export function usePoolState(): PoolState {
  const { connection } = useConnection();
  const [state, setState] = useState<PoolState>({
    tokensSold: 0,
    progressPct: 0,
    graduated: false,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    const fetchState = async () => {
      try {
        const client = new DynamicBondingCurveClient(connection, 'confirmed');
        const poolState = await client.state.getPool(POOL_ADDRESS);
        const configState = await client.state.getPoolConfig(poolState.config);

        const progressPct =
          (Number(poolState.quoteReserve.toString()) /
            Number(configState.migrationQuoteThreshold.toString())) *
          100;

        const tokensSold =
          DBC_SUPPLY - Number(poolState.baseReserve.toString()) / 10 ** TOKEN_DECIMALS;

        const graduated = progressPct >= 100;

        if (mounted) {
          setState({ tokensSold, progressPct: Math.min(progressPct, 100), graduated, loading: false });
        }
      } catch {
        if (mounted) setState((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 15_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [connection]);

  return state;
}

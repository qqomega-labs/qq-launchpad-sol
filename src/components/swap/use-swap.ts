import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import BN from 'bn.js';
import {
  DynamicBondingCurveClient,
  getCurrentPoint,
} from '@meteora-ag/dynamic-bonding-curve-sdk';
import { POOL_ADDRESS } from '../../config/const';

export interface SwapQuote {
  outputAmount: BN;
  minimumAmountOut: BN;
  tradingFee: BN;
}

/**
 * @dev Hook for DBC swap quotes and execution.
 * Fetches pool + config state, resolves currentPoint, then calls swapQuote.
 */
export function useSwap() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getQuote = useCallback(
    async (amountIn: BN, isSell: boolean, slippageBps: number) => {
      setError(null);
      setQuoteLoading(true);
      try {
        const client = new DynamicBondingCurveClient(connection, 'confirmed');
        const virtualPool = await client.state.getPool(POOL_ADDRESS);
        const config = await client.state.getPoolConfig(virtualPool.config);
        const currentPoint = await getCurrentPoint(
          connection,
          config.activationType,
        );

        const q = client.pool.swapQuote({
          virtualPool,
          config,
          swapBaseForQuote: isSell,
          amountIn,
          slippageBps,
          hasReferral: false,
          eligibleForFirstSwapWithMinFee: false,
          currentPoint,
        });

        const result: SwapQuote = {
          outputAmount: q.outputAmount,
          minimumAmountOut: q.minimumAmountOut,
          tradingFee: q.tradingFee,
        };
        setQuote(result);
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Quote failed';
        setError(msg);
        setQuote(null);
        return null;
      } finally {
        setQuoteLoading(false);
      }
    },
    [connection],
  );

  const executeSwap = useCallback(
    async (amountIn: BN, minimumAmountOut: BN, isSell: boolean) => {
      if (!wallet.publicKey || !wallet.sendTransaction) {
        throw new Error('Wallet not connected');
      }
      setLoading(true);
      setError(null);
      try {
        const client = new DynamicBondingCurveClient(connection, 'confirmed');
        const tx = await client.pool.swap({
          pool: POOL_ADDRESS,
          amountIn,
          minimumAmountOut,
          swapBaseForQuote: isSell,
          owner: wallet.publicKey,
          referralTokenAccount: null,
        });
        const sig = await wallet.sendTransaction(tx, connection);
        await connection.confirmTransaction(sig, 'confirmed');
        return sig;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Transaction failed';
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet],
  );

  return { quote, getQuote, executeSwap, loading, quoteLoading, error };
}

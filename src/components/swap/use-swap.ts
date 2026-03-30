import { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { Buffer } from "buffer";
import BN from "bn.js";
import {
  DynamicBondingCurveClient,
  getCurrentPoint,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import { POOL_ADDRESS } from "@/config/const";
import { isDirectPath, isQQ } from "@/config/tokens";
import { fetchJupiterQuote, fetchJupiterSwapTx } from "@/lib/jupiter";
import type { JupiterQuoteResponse } from "@/lib/jupiter";

export interface SwapQuote {
  outputAmount: BN;
  minimumAmountOut: BN;
  tradingFee: BN;
  route: "dbc" | "jupiter";
  priceImpactPct?: string;
  /** @dev Cached Jupiter quote for execution (avoids re-fetching) */
  jupiterQuote?: JupiterQuoteResponse;
}

/**
 * @dev Hook for dual-path swap: DBC direct (SOL<->QQ) or Jupiter routed (USDC/USDT<->QQ).
 */
export function useSwap() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [error, setError] = useState<string | null>(null);

  // PUBLIC

  const getQuote = useCallback(
    async (
      amountIn: BN,
      inputMint: string,
      outputMint: string,
      slippageBps: number,
    ) => {
      setError(null);
      setQuoteLoading(true);
      try {
        if (isDirectPath(inputMint, outputMint)) {
          return await getDbcQuote(amountIn, inputMint, slippageBps);
        }
        return await getJupiterQuote(
          amountIn,
          inputMint,
          outputMint,
          slippageBps,
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Quote failed";
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
    async (
      amountIn: BN,
      inputMint: string,
      _outputMint: string,
      currentQuote: SwapQuote,
    ) => {
      if (
        !wallet.publicKey ||
        !wallet.signTransaction ||
        !wallet.sendTransaction
      ) {
        throw new Error("Wallet not connected");
      }
      setLoading(true);
      setError(null);
      try {
        if (currentQuote.route === "dbc") {
          return await executeDbcSwap(
            amountIn,
            currentQuote.minimumAmountOut,
            isQQ(inputMint),
          );
        }
        return await executeJupiterSwap(currentQuote);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Transaction failed";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet],
  );

  // PRIVATE - DBC path (SOL <-> QQ)

  async function getDbcQuote(
    amountIn: BN,
    inputMint: string,
    slippageBps: number,
  ): Promise<SwapQuote> {
    const isSell = isQQ(inputMint);
    const client = new DynamicBondingCurveClient(connection, "confirmed");
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
      route: "dbc",
    };
    setQuote(result);
    return result;
  }

  async function executeDbcSwap(
    amountIn: BN,
    minimumAmountOut: BN,
    isSell: boolean,
  ): Promise<string> {
    const client = new DynamicBondingCurveClient(connection, "confirmed");
    const tx = await client.pool.swap({
      pool: POOL_ADDRESS,
      amountIn,
      minimumAmountOut,
      swapBaseForQuote: isSell,
      owner: wallet.publicKey!,
      referralTokenAccount: null,
    });
    const sig = await wallet.sendTransaction!(tx, connection);
    await connection.confirmTransaction(sig, "confirmed");
    return sig;
  }

  // PRIVATE - Jupiter path (USDC/USDT <-> QQ)

  async function getJupiterQuote(
    amountIn: BN,
    inputMint: string,
    outputMint: string,
    slippageBps: number,
  ): Promise<SwapQuote> {
    const jupQuote = await fetchJupiterQuote({
      inputMint,
      outputMint,
      amount: amountIn.toString(),
      slippageBps,
    });

    const result: SwapQuote = {
      outputAmount: new BN(jupQuote.outAmount),
      minimumAmountOut: new BN(jupQuote.otherAmountThreshold),
      tradingFee: new BN(0), // Jupiter fees are embedded in the route
      route: "jupiter",
      priceImpactPct: jupQuote.priceImpactPct,
      jupiterQuote: jupQuote,
    };
    setQuote(result);
    return result;
  }

  async function executeJupiterSwap(currentQuote: SwapQuote): Promise<string> {
    if (!currentQuote.jupiterQuote) throw new Error("Missing Jupiter quote");

    const { swapTransaction } = await fetchJupiterSwapTx(
      currentQuote.jupiterQuote,
      wallet.publicKey!.toBase58(),
    );

    const txBuf = Buffer.from(swapTransaction, "base64");
    const tx = VersionedTransaction.deserialize(txBuf);
    const signed = await wallet.signTransaction!(tx);
    const sig = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      maxRetries: 2,
    });
    await connection.confirmTransaction(sig, "confirmed");
    return sig;
  }

  return { quote, getQuote, executeSwap, loading, quoteLoading, error };
}

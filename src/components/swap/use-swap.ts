import { useState } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { VersionedTransaction } from "@solana/web3.js"
import { Buffer } from "buffer"
import BN from "bn.js"
import { DynamicBondingCurveClient, getCurrentPoint } from "@meteora-ag/dynamic-bonding-curve-sdk"

import { POOL_ADDRESS } from "@/config/const"
import { isDirectPath, isQQ, USDC_MINT } from "@/config/tokens"
import { fetchJupiterQuote, fetchJupiterSwapTx } from "@/lib/jupiter"
import type { JupiterQuoteResponse } from "@/lib/jupiter"

export interface SwapQuote {
   outputAmount: BN
   minimumAmountOut: BN
   tradingFee: BN
   route: "dbc" | "hybrid"
   slippageBps: number
   quotedAt: number
   priceImpactPct?: string
   /** @dev Cached Jupiter quote for the SOL/USDT <-> USDC leg */
   jupiterQuote?: JupiterQuoteResponse
   /** @dev Intermediate USDC amount between Jupiter and DBC legs */
   intermediateUsdcAmount?: BN
}

/**
 * @dev Partial execution state when leg 1 of a hybrid swap succeeds but leg 2 fails.
 * User holds intermediate USDC and can retry the second leg via retrySecondLeg().
 */
export interface PartialExecution {
   direction: "buy" | "sell"
   leg1Sig: string
   /** Approximate USDC amount user holds after leg 1 (from quote estimate) */
   estimatedUsdcAmount: BN
   slippageBps: number
   /** For sell direction: the target output mint (SOL/USDT) */
   outputMint?: string
}

/**
 * @dev Hook for swap execution.
 * QQ is not listed on Jupiter (pre-graduation), so all swaps go through the
 * Meteora DBC pool which uses USDC as quote token.
 *
 * Routing:
 * - USDC <-> QQ: Direct via Meteora DBC
 * - SOL/USDT -> QQ: Hybrid (Jupiter SOL/USDT->USDC, then DBC USDC->QQ)
 * - QQ -> SOL/USDT: Hybrid (DBC QQ->USDC, then Jupiter USDC->SOL/USDT)
 */
export function useSwap() {
   const { connection } = useConnection()
   const wallet = useWallet()
   const [loading, setLoading] = useState(false)
   const [quoteLoading, setQuoteLoading] = useState(false)
   const [quote, setQuote] = useState<SwapQuote | null>(null)
   const [error, setError] = useState<string | null>(null)
   const [partialExecution, setPartialExecution] = useState<PartialExecution | null>(null)

   // PUBLIC

   const getQuote = async (amountIn: BN, inputMint: string, outputMint: string, slippageBps: number) => {
      setError(null)
      setQuoteLoading(true)
      try {
         if (isDirectPath(inputMint, outputMint)) {
            // USDC <-> QQ: single-leg DBC swap
            return await getDbcQuote(amountIn, inputMint, slippageBps)
         }
         // SOL/USDT <-> QQ: two-leg hybrid (Jupiter + DBC)
         return await getHybridQuote(amountIn, inputMint, outputMint, slippageBps)
      } catch (e) {
         const msg = e instanceof Error ? e.message : "Quote failed"
         setError(msg)
         setQuote(null)
         return null
      } finally {
         setQuoteLoading(false)
      }
   }

   const executeSwap = async (amountIn: BN, inputMint: string, outputMint: string, currentQuote: SwapQuote) => {
      if (!wallet.publicKey || !wallet.signTransaction || !wallet.sendTransaction) {
         throw new Error("Wallet not connected")
      }
      setLoading(true)
      setError(null)
      try {
         if (currentQuote.route === "dbc") {
            return await executeDbcSwap(amountIn, currentQuote.minimumAmountOut, isQQ(inputMint))
         }
         return await executeHybridSwap(amountIn, inputMint, outputMint, currentQuote)
      } catch (e) {
         const msg = e instanceof Error ? e.message : "Transaction failed"
         setError(msg)
         throw e
      } finally {
         setLoading(false)
      }
   }

   /**
    * @dev Retry the second leg of a failed hybrid swap.
    * Re-quotes fresh and re-executes with the stored intermediate USDC amount.
    */
   const retrySecondLeg = async (): Promise<string> => {
      if (!partialExecution) throw new Error("No partial execution to retry")
      setLoading(true)
      setError(null)
      try {
         const { direction, estimatedUsdcAmount, slippageBps, outputMint } = partialExecution
         if (direction === "buy") {
            // Re-quote DBC for USDC -> QQ with fresh pool state
            const dbcQ = await getDbcQuoteRaw(estimatedUsdcAmount, false, slippageBps)
            const sig = await executeDbcSwap(estimatedUsdcAmount, dbcQ.minimumAmountOut, false)
            setPartialExecution(null)
            return sig
         } else {
            // Re-quote Jupiter for USDC -> SOL/USDT
            const jupQ = await fetchJupiterQuote({
               inputMint: USDC_MINT,
               outputMint: outputMint!,
               amount: estimatedUsdcAmount.toString(),
               slippageBps,
            })
            const sig = await executeJupiterLeg(jupQ)
            setPartialExecution(null)
            return sig
         }
      } catch (e) {
         const msg = e instanceof Error ? e.message : "Retry failed"
         setError(msg)
         throw e
      } finally {
         setLoading(false)
      }
   }

   const dismissPartialExecution = () => setPartialExecution(null)

   // PRIVATE - DBC direct path (USDC <-> QQ)
   // The Meteora DBC pool uses USDC as quote token (not SOL).
   // base = QQ (9 decimals), quote = USDC (6 decimals).
   // swapBaseForQuote=true means sell QQ for USDC, false means buy QQ with USDC.

   /** @dev Fetch a quote from the Meteora DBC for USDC<->QQ swaps. */
   async function getDbcQuote(amountIn: BN, inputMint: string, slippageBps: number): Promise<SwapQuote> {
      const isSell = isQQ(inputMint)
      const q = await getDbcQuoteRaw(amountIn, isSell, slippageBps)

      const result: SwapQuote = {
         outputAmount: q.outputAmount,
         minimumAmountOut: q.minimumAmountOut,
         tradingFee: q.tradingFee,
         route: "dbc",
         slippageBps,
         quotedAt: Date.now(),
      }
      setQuote(result)
      return result
   }

   /** @dev Execute a DBC swap on-chain. Signs and sends the transaction. */
   async function executeDbcSwap(amountIn: BN, minimumAmountOut: BN, isSell: boolean): Promise<string> {
      const client = new DynamicBondingCurveClient(connection, "confirmed")
      const tx = await client.pool.swap({
         pool: POOL_ADDRESS,
         amountIn,
         minimumAmountOut,
         swapBaseForQuote: isSell,
         owner: wallet.publicKey!,
         referralTokenAccount: null,
      })
      const sig = await wallet.sendTransaction!(tx, connection)
      await connection.confirmTransaction(sig, "confirmed")
      return sig
   }

   // PRIVATE - Hybrid path (SOL/USDT <-> QQ)
   // QQ is not listed on Jupiter (pre-graduation), so SOL/USDT swaps
   // require two legs: Jupiter handles SOL/USDT<->USDC, DBC handles USDC<->QQ.

   /**
    * @dev Two-leg quote for non-USDC tokens.
    * Buy: SOL/USDT -> USDC (Jupiter) -> QQ (DBC)
    * Sell: QQ -> USDC (DBC) -> SOL/USDT (Jupiter)
    */
   async function getHybridQuote(
      amountIn: BN,
      inputMint: string,
      outputMint: string,
      slippageBps: number
   ): Promise<SwapQuote> {
      const isBuy = isQQ(outputMint)

      if (isBuy) {
         // Leg 1: SOL/USDT -> USDC via Jupiter
         const jupQuote = await fetchJupiterQuote({
            inputMint,
            outputMint: USDC_MINT,
            amount: amountIn.toString(),
            slippageBps,
         })

         // Leg 2: USDC -> QQ via DBC (using Jupiter's USDC output as input)
         const usdcAmount = new BN(jupQuote.outAmount)
         const dbcQuote = await getDbcQuoteRaw(usdcAmount, false, slippageBps)

         const result: SwapQuote = {
            outputAmount: dbcQuote.outputAmount,
            minimumAmountOut: dbcQuote.minimumAmountOut,
            tradingFee: dbcQuote.tradingFee,
            route: "hybrid",
            slippageBps,
            quotedAt: Date.now(),
            priceImpactPct: jupQuote.priceImpactPct,
            jupiterQuote: jupQuote,
            intermediateUsdcAmount: usdcAmount,
         }
         setQuote(result)
         return result
      } else {
         // Leg 1: QQ -> USDC via DBC
         const dbcQuote = await getDbcQuoteRaw(amountIn, true, slippageBps)

         // Leg 2: USDC -> SOL/USDT via Jupiter (using DBC's USDC output as input)
         const jupQuote = await fetchJupiterQuote({
            inputMint: USDC_MINT,
            outputMint,
            amount: dbcQuote.outputAmount.toString(),
            slippageBps,
         })

         const result: SwapQuote = {
            outputAmount: new BN(jupQuote.outAmount),
            minimumAmountOut: new BN(jupQuote.otherAmountThreshold),
            tradingFee: dbcQuote.tradingFee,
            route: "hybrid",
            slippageBps,
            quotedAt: Date.now(),
            priceImpactPct: jupQuote.priceImpactPct,
            jupiterQuote: jupQuote,
            intermediateUsdcAmount: dbcQuote.outputAmount,
         }
         setQuote(result)
         return result
      }
   }

   /** @dev Stateless DBC quote (no React state update). Used internally by both paths. */
   async function getDbcQuoteRaw(amountIn: BN, isSell: boolean, slippageBps: number) {
      const client = new DynamicBondingCurveClient(connection, "confirmed")
      const virtualPool = await client.state.getPool(POOL_ADDRESS)
      const config = await client.state.getPoolConfig(virtualPool.config)
      const currentPoint = await getCurrentPoint(connection, config.activationType)

      return client.pool.swapQuote({
         virtualPool,
         config,
         swapBaseForQuote: isSell,
         amountIn,
         slippageBps,
         hasReferral: false,
         eligibleForFirstSwapWithMinFee: false,
         currentPoint,
      })
   }

   /**
    * @dev Execute a two-leg hybrid swap sequentially.
    * Buy: Jupiter SOL/USDT->USDC first, then DBC USDC->QQ.
    * Sell: DBC QQ->USDC first, then Jupiter USDC->SOL/USDT.
    * If leg 1 succeeds but leg 2 fails, partialExecution state is set
    * so the UI can offer a retry via retrySecondLeg().
    */
   async function executeHybridSwap(
      amountIn: BN,
      inputMint: string,
      outputMint: string,
      currentQuote: SwapQuote
   ): Promise<string> {
      if (!currentQuote.jupiterQuote) throw new Error("Missing Jupiter quote")
      const isBuy = !isQQ(inputMint)

      if (isBuy) {
         // Step 1: Jupiter SOL/USDT -> USDC
         const leg1Sig = await executeJupiterLeg(currentQuote.jupiterQuote)

         // Step 2: DBC USDC -> QQ
         try {
            const usdcAmount = currentQuote.intermediateUsdcAmount!
            return await executeDbcSwap(usdcAmount, currentQuote.minimumAmountOut, false)
         } catch (e) {
            setPartialExecution({
               direction: "buy",
               leg1Sig,
               estimatedUsdcAmount: currentQuote.intermediateUsdcAmount!,
               slippageBps: currentQuote.slippageBps,
            })
            throw e
         }
      } else {
         // Step 1: DBC QQ -> USDC
         const dbcSig = await executeDbcSwap(amountIn, currentQuote.intermediateUsdcAmount!, true)

         // Step 2: Jupiter USDC -> SOL/USDT
         try {
            await executeJupiterLeg(currentQuote.jupiterQuote)
            return dbcSig
         } catch (e) {
            setPartialExecution({
               direction: "sell",
               leg1Sig: dbcSig,
               estimatedUsdcAmount: currentQuote.intermediateUsdcAmount!,
               slippageBps: currentQuote.slippageBps,
               outputMint,
            })
            throw e
         }
      }
   }

   /** @dev Execute a single Jupiter swap leg. Deserializes, signs, and sends. */
   async function executeJupiterLeg(jupQuote: JupiterQuoteResponse): Promise<string> {
      const { swapTransaction } = await fetchJupiterSwapTx(jupQuote, wallet.publicKey!.toBase58())

      const txBuf = Buffer.from(swapTransaction, "base64")
      const tx = VersionedTransaction.deserialize(txBuf)
      const signed = await wallet.signTransaction!(tx)
      const sig = await connection.sendRawTransaction(signed.serialize(), {
         skipPreflight: false,
         maxRetries: 2,
      })
      await connection.confirmTransaction(sig, "confirmed")
      return sig
   }

   return {
      quote,
      getQuote,
      executeSwap,
      retrySecondLeg,
      dismissPartialExecution,
      partialExecution,
      loading,
      quoteLoading,
      error,
   }
}

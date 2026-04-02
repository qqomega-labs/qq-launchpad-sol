import { useState, useEffect, useRef } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useUnifiedWalletContext } from "@jup-ag/wallet-adapter"
import { Loader2, ArrowUpRight, AlertTriangle, X } from "lucide-react"

import { toast } from "sonner"

import { useSwap } from "./use-swap"
import { useWalletBalances } from "./use-wallet-balances"
import { SwapInput } from "./swap-input"
import { QuickAmounts } from "./quick-amounts"
import { SlippagePopover } from "./slippage-popover"
import { Button } from "@/components/ui/button"

import { cn, truncateAddress, parseTokenAmount } from "@/lib/utils"
import { DEFAULT_SLIPPAGE_BPS, SLIPPAGE_STORAGE_KEY, COLORS, GECKOTERMINAL_URL } from "@/config/const"
import { SOL_MINT, QQ_MINT, QUICK_AMOUNTS, getToken } from "@/config/tokens"

/** @dev Re-fetch the quote if older than this threshold before executing */
const QUOTE_STALE_MS = 30_000

/**
 * @dev Main swap panel with buy/sell tabs, token selection, quote fetching, and swap execution.
 * SOL <-> QQ goes direct via Meteora DBC. Other tokens route via Jupiter API.
 */
export function SwapPanel() {
   const { connected } = useWallet()
   const { setShowModal } = useUnifiedWalletContext()
   const walletBalances = useWalletBalances()
   const {
      quote,
      getQuote,
      executeSwap,
      retrySecondLeg,
      dismissPartialExecution,
      partialExecution,
      loading,
      quoteLoading,
      error,
   } = useSwap()
   const [isSell, setIsSell] = useState(false)
   const [inputAmount, setInputAmount] = useState("")
   const [selectedPayMint, setSelectedPayMint] = useState(SOL_MINT)
   const [selectedReceiveMint, setSelectedReceiveMint] = useState(SOL_MINT)
   const [slippage, setSlippage] = useState(() => {
      const stored = localStorage.getItem(SLIPPAGE_STORAGE_KEY)
      return stored ? Number(stored) : DEFAULT_SLIPPAGE_BPS
   })
   const [success, setSuccess] = useState(false)

   const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

   const inputMint = isSell ? QQ_MINT : selectedPayMint
   const outputMint = isSell ? selectedReceiveMint : QQ_MINT
   const inputToken = getToken(inputMint)
   const outputToken = getToken(outputMint)
   const inputDecimals = inputToken?.decimals ?? 9
   const outputDecimals = outputToken?.decimals ?? 9

   useEffect(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      const amount = parseFloat(inputAmount)
      if (isNaN(amount) || amount <= 0) return

      debounceRef.current = setTimeout(() => {
         const amountIn = parseTokenAmount(inputAmount, inputDecimals)
         getQuote(amountIn, inputMint, outputMint, slippage)
      }, 500)

      return () => {
         if (debounceRef.current) clearTimeout(debounceRef.current)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [inputAmount, inputMint, outputMint, slippage, inputDecimals])

   const hasValidInput = inputAmount !== "" && !isNaN(parseFloat(inputAmount)) && parseFloat(inputAmount) > 0

   const outputAmount =
      hasValidInput && quote
         ? (Number(quote.outputAmount.toString()) / 10 ** outputDecimals).toFixed(outputDecimals > 6 ? 4 : 2)
         : ""

   const handleSwap = async () => {
      if (!connected) {
         setShowModal(true)
         return
      }
      if (!inputAmount) return

      // Re-fetch quote if stale (older than QUOTE_STALE_MS) to avoid executing on outdated pricing
      let activeQuote = quote
      if (!activeQuote || Date.now() - activeQuote.quotedAt > QUOTE_STALE_MS) {
         const amountIn = parseTokenAmount(inputAmount, inputDecimals)
         activeQuote = await getQuote(amountIn, inputMint, outputMint, slippage)
         if (!activeQuote) return
      }

      try {
         const amountIn = parseTokenAmount(inputAmount, inputDecimals)
         const sig = await executeSwap(amountIn, inputMint, outputMint, activeQuote)
         toast.success(`Transaction confirmed: ${truncateAddress(sig, 8)}`)
         setSuccess(true)
         setInputAmount("")
         setTimeout(() => setSuccess(false), 2000)
      } catch {
         toast.error(error || "Transaction failed")
      }
   }

   const handleRetry = async () => {
      try {
         const sig = await retrySecondLeg()
         toast.success(`Retry confirmed: ${truncateAddress(sig, 8)}`)
         setSuccess(true)
         setTimeout(() => setSuccess(false), 2000)
      } catch {
         toast.error(error || "Retry failed")
      }
   }

   const ctaText = () => {
      if (!connected) return "Connect Wallet"
      if (loading || quoteLoading) return "Confirming..."
      if (success) return "\u2713 Confirmed"
      if (!inputAmount || parseFloat(inputAmount) <= 0) return "Enter Amount"
      return isSell ? "Sell QQ" : "Secure Your Seat"
   }

   const ctaDisabled =
      loading || quoteLoading || success || (connected && (!inputAmount || parseFloat(inputAmount) <= 0))
   const quickAmounts = !isSell ? (QUICK_AMOUNTS[selectedPayMint] ?? []) : []

   const inputBalance = connected ? walletBalances[inputMint] : undefined

   const handleHalf = () => {
      if (inputBalance == null || inputBalance <= 0) return
      // Leave a small SOL reserve for fees when paying with SOL
      const half = inputMint === SOL_MINT ? Math.max(0, (inputBalance - 0.005) / 2) : inputBalance / 2
      setInputAmount(half > 0 ? String(parseFloat(half.toFixed(inputDecimals))) : "")
   }

   const handleMax = () => {
      if (inputBalance == null || inputBalance <= 0) return
      // Reserve 0.005 SOL for fees when paying with SOL
      const max = inputMint === SOL_MINT ? Math.max(0, inputBalance - 0.005) : inputBalance
      setInputAmount(max > 0 ? String(parseFloat(max.toFixed(inputDecimals))) : "")
   }

   const routeLabel = () => {
      if (!quote) return null
      if (quote.route === "dbc") return "via Meteora DBC"
      return "via Jupiter + Meteora DBC"
   }

   const priceImpact = quote?.priceImpactPct ? parseFloat(quote.priceImpactPct) : 0
   const showPriceImpact = priceImpact >= 1

   return (
      <div className="glass-panel rounded-[12px] p-4 md:p-5 landscape:p-3">
         {/* Partial execution warning - shown when leg 1 succeeded but leg 2 failed */}
         {partialExecution && (
            <div className={cn("mb-4 border rounded-[8px] p-3 text-xs", COLORS.tw.warningBg, COLORS.tw.warningBorder)}>
               <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className={cn(COLORS.tw.warningText, "shrink-0 mt-0.5")} />
                  <div className="flex-1">
                     <p className={cn(COLORS.tw.warningText, "font-medium mb-1")}>Step 1 complete, step 2 failed</p>
                     <p className="text-text-muted mb-2">
                        You received ~{(Number(partialExecution.estimatedUsdcAmount.toString()) / 1e6).toFixed(2)} USDC.
                        Retry to complete the swap.
                     </p>
                     <div className="flex gap-2">
                        <button
                           onClick={handleRetry}
                           disabled={loading}
                           className={cn(
                              COLORS.tw.warningBtnBg,
                              COLORS.tw.warningBtnBgHover,
                              COLORS.tw.warningText,
                              "rounded-[6px] px-3 py-1.5 min-h-[44px] transition-colors disabled:opacity-50"
                           )}
                        >
                           {loading ? <Loader2 size={12} className="animate-spin inline" /> : "Retry"}
                        </button>
                        <button
                           onClick={dismissPartialExecution}
                           className={cn(
                              "text-text-muted hover:text-text-secondary transition-colors",
                              "p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center"
                           )}
                           aria-label="Dismiss"
                        >
                           <X size={14} />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Buy / Sell tabs */}
         <div className="flex gap-1 mb-5 landscape:mb-3 bg-bg-input rounded-[8px] p-1">
            <Button
               variant="tab"
               active={!isSell}
               onClick={() => {
                  setIsSell(false)
                  setInputAmount("")
               }}
               className="flex-1"
            >
               Buy
            </Button>
            <Button
               variant="tab"
               active={isSell}
               onClick={() => {
                  setIsSell(true)
                  setInputAmount("")
               }}
               className="flex-1"
            >
               Sell
            </Button>
         </div>

         {/* Input */}
         <SwapInput
            label="You pay"
            value={inputAmount}
            onChange={setInputAmount}
            tokenMint={inputMint}
            onTokenSelect={isSell ? undefined : setSelectedPayMint}
            excludeMint={QQ_MINT}
            balance={inputBalance}
            onHalf={handleHalf}
            onMax={handleMax}
         />

         {/* Quick amounts */}
         {quickAmounts.length > 0 && (
            <QuickAmounts amounts={quickAmounts} onSelect={(amt) => setInputAmount(String(amt))} />
         )}

         {/* Output */}
         <div className="mt-4 landscape:mt-2">
            <SwapInput
               label="You receive (estimated)"
               value={outputAmount}
               readOnly
               loading={quoteLoading}
               tokenMint={outputMint}
               onTokenSelect={isSell ? setSelectedReceiveMint : undefined}
               excludeMint={QQ_MINT}
               balance={connected ? walletBalances[outputMint] : undefined}
            />
         </div>

         {/* Slippage + route + price impact */}
         <div className="mt-3 landscape:mt-1.5 space-y-1">
            <div className="flex items-center justify-end">
               <SlippagePopover value={slippage} onChange={setSlippage} />
            </div>
            {routeLabel() && <p className="text-text-muted text-xs text-center">{routeLabel()}</p>}
            {showPriceImpact && (
               <p className={cn("text-xs text-center", priceImpact >= 5 ? "text-red" : COLORS.tw.fomoSoft)}>
                  Price impact: {priceImpact.toFixed(2)}%{priceImpact >= 5 && " — High impact"}
               </p>
            )}
         </div>

         {/* CTA - shimmer gradient button */}
         <button
            onClick={handleSwap}
            disabled={!!ctaDisabled}
            className={cn(
               "btn-cta w-full mt-5 landscape:mt-3 rounded-[12px]",
               "px-6 py-3.5 text-white text-base font-semibold tracking-wide",
               "disabled:cursor-not-allowed"
            )}
         >
            {(loading || quoteLoading) && <Loader2 size={16} className="animate-spin -ml-1 mr-2 inline" />}
            {ctaText()}
         </button>

         {/* Error */}
         {error && <p className="text-red text-xs mt-2 text-center">{error}</p>}

         {/* Fallback */}
         <div className="mt-4 landscape:mt-2 text-center">
            <a
               href={GECKOTERMINAL_URL}
               target="_blank"
               rel="noopener noreferrer"
               className={cn(
                  "text-text-muted text-xs hover:text-accent transition-colors",
                  "inline-flex items-center gap-1"
               )}
            >
               see on GeckoTerminal <ArrowUpRight size={11} />
            </a>
         </div>
      </div>
   )
}

import { useState, useEffect, useRef } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useUnifiedWalletContext } from "@jup-ag/wallet-adapter"
import { Loader2, ArrowUpRight } from "lucide-react"
import BN from "bn.js"

import { useSwap } from "./use-swap"
import { SwapInput } from "./swap-input"
import { QuickAmounts } from "./quick-amounts"
import { SlippagePopover } from "./slippage-popover"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"

import { truncateAddress } from "@/lib/format"
import { DEXSCREENER_URL, DEFAULT_SLIPPAGE_BPS, SLIPPAGE_STORAGE_KEY } from "@/config/const"
import { SOL_MINT, QQ_MINT, QUICK_AMOUNTS, getToken } from "@/config/tokens"

/**
 * @dev Main swap panel with buy/sell tabs, token selection, quote fetching, and swap execution.
 * SOL <-> QQ goes direct via Meteora DBC. Other tokens route via Jupiter API.
 */
export function SwapPanel() {
   const { connected } = useWallet()
   const { setShowModal } = useUnifiedWalletContext()
   const { quote, getQuote, executeSwap, loading, quoteLoading, error } = useSwap()
   const { showToast } = useToast()

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
         const amountIn = new BN(Math.floor(amount * 10 ** inputDecimals))
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
      if (!quote || !inputAmount) return

      try {
         const amountIn = new BN(Math.floor(parseFloat(inputAmount) * 10 ** inputDecimals))
         const sig = await executeSwap(amountIn, inputMint, outputMint, quote)
         showToast("success", `Transaction confirmed: ${truncateAddress(sig, 8)}`)
         setSuccess(true)
         setInputAmount("")
         setTimeout(() => setSuccess(false), 2000)
      } catch {
         showToast("error", error || "Transaction failed")
      }
   }

   const ctaText = () => {
      if (!connected) return "Connect Wallet"
      if (loading) return "Confirming..."
      if (success) return "\u2713 Confirmed"
      if (!inputAmount || parseFloat(inputAmount) <= 0) return "Enter Amount"
      return isSell ? "Sell QQ" : "Secure Your Seat"
   }

   const ctaDisabled = loading || success || (connected && (!inputAmount || parseFloat(inputAmount) <= 0))
   const quickAmounts = !isSell ? (QUICK_AMOUNTS[selectedPayMint] ?? []) : []

   const routeLabel = () => {
      if (!quote) return null
      if (quote.route === "dbc") return "via Meteora DBC"
      return "via Jupiter + Meteora DBC"
   }

   return (
      <div className="glass-panel rounded-[12px] p-5">
         {/* Buy / Sell tabs */}
         <div className="flex gap-1 mb-5 bg-bg-input rounded-[8px] p-1">
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
         />

         {/* Quick amounts */}
         {quickAmounts.length > 0 && (
            <QuickAmounts amounts={quickAmounts} onSelect={(amt) => setInputAmount(String(amt))} />
         )}

         {/* Output */}
         <div className="mt-4">
            <SwapInput
               label="You receive (estimated)"
               value={outputAmount}
               readOnly
               loading={quoteLoading}
               tokenMint={outputMint}
               onTokenSelect={isSell ? setSelectedReceiveMint : undefined}
               excludeMint={QQ_MINT}
            />
         </div>

         {/* Slippage + route */}
         <div className="mt-3 space-y-1">
            <div className="flex items-center justify-end">
               <SlippagePopover value={slippage} onChange={setSlippage} />
            </div>
            {routeLabel() && <p className="text-text-muted text-xs text-center">{routeLabel()}</p>}
         </div>

         {/* CTA - shimmer gradient button */}
         <button
            onClick={handleSwap}
            disabled={!!ctaDisabled}
            className="btn-cta w-full mt-5 rounded-[12px] px-6 py-3.5 text-white text-base font-semibold tracking-wide disabled:cursor-not-allowed"
         >
            {loading && <Loader2 size={16} className="animate-spin -ml-1 mr-2 inline" />}
            {ctaText()}
         </button>

         {/* Error */}
         {error && <p className="text-red text-xs mt-2 text-center">{error}</p>}

         {/* Fallback */}
         <div className="mt-4 text-center">
            <a
               href={DEXSCREENER_URL}
               target="_blank"
               rel="noopener noreferrer"
               className="text-text-muted text-xs hover:text-accent transition-colors inline-flex items-center gap-1"
            >
               or buy on DexScreener <ArrowUpRight size={11} />
            </a>
         </div>
      </div>
   )
}

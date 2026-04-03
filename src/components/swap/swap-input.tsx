import { Wallet } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { TokenIcon } from "@/components/icons"
import { TokenSelector } from "./token-selector"
import { cn } from "@/lib/utils"
import { getToken } from "@/config/tokens"

interface SwapInputProps {
   label: string
   value: string
   onChange?: (val: string) => void
   readOnly?: boolean
   loading?: boolean
   /** Token mint address */
   tokenMint: string
   /** When provided, renders a token selector dropdown instead of static badge */
   onTokenSelect?: (mint: string) => void
   /** Mint to exclude from the selector (prevents same token on both sides) */
   excludeMint?: string
   /** Wallet balance for the token (human-readable) */
   balance?: number
   /** Called when user clicks HALF */
   onHalf?: () => void
   /** Called when user clicks MAX */
   onMax?: () => void
}

function formatBalance(n: number): string {
   if (n === 0) return "0"
   if (n < 0.0001) return n.toFixed(6)
   if (n < 1) return n.toFixed(4)
   if (n < 10_000) return n.toFixed(2)
   return n.toLocaleString("en-US", { maximumFractionDigits: 2 })
}

/**
 * @dev Amount input field with token badge or token selector dropdown
 */
export function SwapInput({
   label,
   value,
   onChange,
   readOnly = false,
   loading = false,
   tokenMint,
   onTokenSelect,
   excludeMint,
   balance,
   onHalf,
   onMax,
}: SwapInputProps) {
   const token = getToken(tokenMint)
   const showBalance = balance !== undefined
   const showActions = !readOnly && (onHalf || onMax)

   return (
      <div>
         <div className="flex items-center justify-between mb-1.5">
            <label className="text-text-muted text-xs">{label}</label>
            <div className="flex items-center gap-1.5">
               {showBalance && (
                  <span className="flex items-center gap-1 text-text-muted text-xs">
                     <Wallet size={10} className="shrink-0" />
                     <span>
                        {formatBalance(balance)} {token?.symbol}
                     </span>
                  </span>
               )}
               {showActions && (
                  <>
                     {onHalf && (
                        <button
                           type="button"
                           onClick={onHalf}
                           className={cn(
                              "text-[10px] font-medium leading-none",
                              "text-text-muted hover:text-text-secondary",
                              "border border-border hover:border-border-active",
                              "rounded px-1.5 py-0.5 transition-colors"
                           )}
                        >
                           HALF
                        </button>
                     )}
                     {onMax && (
                        <button
                           type="button"
                           onClick={onMax}
                           className={cn(
                              "text-[10px] font-medium leading-none",
                              "text-text-muted hover:text-text-secondary",
                              "border border-border hover:border-border-active",
                              "rounded px-1.5 py-0.5 transition-colors"
                           )}
                        >
                           MAX
                        </button>
                     )}
                  </>
               )}
            </div>
         </div>
         <div
            className={cn(
               "bg-bg-input border border-border rounded-[8px]",
               "px-3 py-2.5 flex items-center gap-2",
               "focus-within:border-border-active transition-colors"
            )}
         >
            {loading ? (
               <Skeleton className="h-6 flex-1" />
            ) : (
               <input
                  type="text"
                  inputMode="decimal"
                  value={value}
                  onChange={(e) => {
                     const v = e.target.value.replace(",", ".")
                     if (v === "" || /^\d*\.?\d*$/.test(v)) onChange?.(v)
                  }}
                  readOnly={readOnly}
                  placeholder="0.00"
                  maxLength={20}
                  className={cn(
                     "bg-transparent text-white font-mono text-lg",
                     "flex-1 outline-none placeholder:text-text-muted w-0"
                  )}
               />
            )}
            {onTokenSelect ? (
               <TokenSelector selectedMint={tokenMint} onSelect={onTokenSelect} excludeMint={excludeMint} />
            ) : (
               <span className="flex items-center gap-1.5 text-text-secondary text-sm font-medium shrink-0">
                  <TokenIcon mint={tokenMint} />
                  <span>{token?.symbol ?? "???"}</span>
               </span>
            )}
         </div>
      </div>
   )
}

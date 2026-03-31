import { Skeleton } from "@/components/ui/skeleton"
import { TokenIcon } from "@/components/icons"
import { TokenSelector } from "./token-selector"
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
}: SwapInputProps) {
   const token = getToken(tokenMint)

   return (
      <div>
         <label className="text-text-muted text-xs mb-1.5 block">{label}</label>
         <div className="bg-bg-input border border-border rounded-[8px] px-3 py-2.5 flex items-center gap-2 focus-within:border-border-active transition-colors">
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
                  className="bg-transparent text-white font-mono text-lg flex-1 outline-none placeholder:text-text-muted w-0"
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

import { Loader2, AlertTriangle, X } from "lucide-react"
import type { PartialExecution } from "./use-swap"
import { COLORS } from "@/config/const"
import { cn } from "@/lib/utils"

interface PartialExecutionBannerProps {
   partialExecution: PartialExecution
   loading: boolean
   onRetry: () => void
   onDismiss: () => void
}

/** @dev Warning banner shown when leg 1 succeeded but leg 2 failed in a hybrid swap. */
export function PartialExecutionBanner({ partialExecution, loading, onRetry, onDismiss }: PartialExecutionBannerProps) {
   return (
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
                     onClick={onRetry}
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
                     onClick={onDismiss}
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
   )
}

import { cn } from "@/lib/utils"

interface QuickAmountsProps {
   amounts: number[]
   onSelect: (amount: number) => void
   onMax?: () => void
}

/**
 * @dev Quick amount selection buttons
 */
export function QuickAmounts({ amounts, onSelect, onMax }: QuickAmountsProps) {
   const btnClass = cn(
      "bg-bg-input border border-border hover:border-border-active",
      "rounded-[8px] px-3 py-2.5 min-h-[44px]",
      "text-xs text-text-secondary hover:text-white transition-colors"
   )

   return (
      <div className="flex gap-2 mt-2">
         {amounts.map((amt) => (
            <button key={amt} onClick={() => onSelect(amt)} className={cn(btnClass, "font-mono")}>
               {amt}
            </button>
         ))}
         {onMax && (
            <button onClick={onMax} className={btnClass}>
               Max
            </button>
         )}
      </div>
   )
}

import { COLORS } from "@/config/const"
import { cn } from "@/lib/utils"

/**
 * @dev Loading placeholder with subtle pulse animation
 */
export function Skeleton({ className = "" }: { className?: string }) {
   return <div className={cn(COLORS.tw.skeletonBg, "rounded-sm animate-pulse", className)} />
}

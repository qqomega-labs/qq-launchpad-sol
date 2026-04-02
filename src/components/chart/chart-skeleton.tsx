import { Skeleton } from "@/components/ui/skeleton"

/** @dev Skeleton placeholder matching ChartPanel layout during lazy load. */
export function ChartSkeleton() {
   return (
      <div className="glass-panel rounded-[12px] overflow-hidden">
         <div className="flex gap-1 p-3 border-b border-border">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-7 w-10" />)}
         </div>
         <Skeleton className="h-[280px] landscape:h-[200px] rounded-none" />
      </div>
   )
}

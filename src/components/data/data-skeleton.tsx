import { Skeleton } from "@/components/ui/skeleton"

/** @dev Skeleton placeholder matching DataTabs layout during lazy load. */
export function DataSkeleton() {
   return (
      <div className="glass-panel rounded-[12px] p-4 md:p-5 space-y-2">
         <Skeleton className="h-4 w-48 mb-4" />
         {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
      </div>
   )
}

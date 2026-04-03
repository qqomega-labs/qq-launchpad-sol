import { Skeleton } from "@/components/ui/skeleton"

/** @dev Skeleton placeholder matching QQHexSphere layout during lazy load. */
export function SphereSkeleton() {
   return (
      <div className="glass-panel rounded-[12px] p-4 md:p-5 flex flex-col gap-3 aspect-square">
         <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-16" />
         </div>
         <div className="flex gap-1.5 flex-wrap">
            {Array.from({ length: 6 }).map((_, i) => (
               <Skeleton key={i} className="h-6 w-14" />
            ))}
         </div>
         <div className="flex gap-1.5 flex-wrap">
            {Array.from({ length: 4 }).map((_, i) => (
               <Skeleton key={i} className="h-6 w-10" />
            ))}
         </div>
         <Skeleton className="flex-1 rounded-full" />
      </div>
   )
}

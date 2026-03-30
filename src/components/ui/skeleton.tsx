import { COLORS } from "@/config/const";

/**
 * @dev Loading placeholder with subtle pulse animation
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`${COLORS.tw.skeletonBg} rounded-sm animate-pulse ${className}`}
    />
  );
}

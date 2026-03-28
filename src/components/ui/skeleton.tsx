/**
 * @dev Loading placeholder with subtle pulse animation
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-[rgba(253,1,90,0.08)] rounded-sm animate-pulse ${className}`}
    />
  );
}

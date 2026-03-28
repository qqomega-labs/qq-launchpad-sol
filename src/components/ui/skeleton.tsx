/**
 * @dev Loading placeholder with subtle pulse animation
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-bg-input rounded-sm animate-pulse ${className}`}
    />
  );
}

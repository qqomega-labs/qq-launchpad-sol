import { SOL_MINT, USDC_MINT, USDT_MINT, QQ_MINT } from "@/config/tokens";

/**
 * @dev Solana logo icon from qq-omega-landing
 */
export function SolanaIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 397.7 311.7"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"
        fill="currentColor"
      />
      <path
        d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"
        fill="currentColor"
      />
      <path
        d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * @dev QQ token icon - uses favicon.svg
 */
export function QQIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <img src="/favicon.svg" alt="QQ" className={`${className} rounded-sm`} />
  );
}

/**
 * @dev USDC icon (circle with $ symbol)
 */
export function USDCIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="16" fill="#2775CA" />
      <path
        d="M20.4 18.4c0-2.1-1.3-2.8-3.8-3.1-1.8-.3-2.2-.7-2.2-1.5s.7-1.3 1.8-1.3c1 0 1.6.4 1.9 1.2.1.1.2.2.3.2h.8c.2 0 .3-.1.3-.3-.3-1.2-1.1-2-2.4-2.2v-1.3c0-.2-.1-.3-.3-.3h-.7c-.2 0-.3.1-.3.3v1.3c-1.6.2-2.6 1.3-2.6 2.6 0 2 1.2 2.7 3.7 3 1.6.3 2.3.6 2.3 1.6s-.9 1.5-2 1.5c-1.5 0-2-.6-2.2-1.5 0-.1-.2-.2-.3-.2h-.8c-.2 0-.3.1-.3.3.3 1.4 1.2 2.2 2.8 2.5v1.3c0 .2.1.3.3.3h.7c.2 0 .3-.1.3-.3v-1.3c1.6-.3 2.7-1.3 2.7-2.8z"
        fill="#fff"
      />
    </svg>
  );
}

/**
 * @dev USDT icon (circle with T symbol)
 */
export function USDTIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="16" fill="#26A17B" />
      <path
        d="M17.9 17v-.1c-.1 0-.8-.1-2-.1s-1.8 0-2 .1v.1c-3.5.2-6.1.8-6.1 1.6s2.6 1.4 6.1 1.6v5h3.9v-5c3.5-.2 6.1-.8 6.1-1.6s-2.5-1.4-6-1.6zm-2 2.7c-4.3 0-7.1-.7-7.1-1.2 0-.4 2-1 5.2-1.2v1.8c.6 0 1.2.1 1.9.1s1.3 0 2-.1v-1.8c3.1.2 5.1.7 5.1 1.2 0 .5-2.8 1.2-7.1 1.2zM17.9 8.2h4.7V11h-4.7v2.5c3.7.2 6.5.9 6.5 1.8s-2.8 1.6-6.5 1.8v-1.3c-.6 0-1.3.1-2 .1-.6 0-1.3 0-1.9-.1v1.3c-3.7-.2-6.5-.9-6.5-1.8s2.8-1.6 6.5-1.8V11H9.4V8.2h4.7V6h3.8v2.2z"
        fill="#fff"
      />
    </svg>
  );
}

/**
 * @dev Maps a token mint to its icon component
 */
export function TokenIcon({
  mint,
  className = "w-5 h-5",
}: {
  mint: string;
  className?: string;
}) {
  switch (mint) {
    case SOL_MINT:
      return <SolanaIcon className={className} />;
    case USDC_MINT:
      return <USDCIcon className={className} />;
    case USDT_MINT:
      return <USDTIcon className={className} />;
    case QQ_MINT:
      return <QQIcon className={className} />;
    default:
      return <QQIcon className={className} />;
  }
}

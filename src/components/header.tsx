import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUnifiedWalletContext } from '@jup-ag/wallet-adapter';
import { truncateAddress } from '@/lib/format';
import { COLORS } from '@/config/const';

export function Header() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setShowModal } = useUnifiedWalletContext();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleWalletClick = () => {
    if (!connected) {
      setShowModal(true);
    } else {
      setShowDropdown((prev) => !prev);
    }
  };

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      setShowDropdown(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  return (
    <header className={`sticky top-0 z-40 h-16 flex items-center justify-between px-4 md:px-6 border-b border-border backdrop-blur-[64px] backdrop-saturate-[120%] ${COLORS.tw.headerBg}`}>
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="QQ" className="h-8 w-8" />
        <span className="text-text-muted text-sm font-medium">Launchpad</span>
      </div>

      <div className="relative">
        <button
          onClick={handleWalletClick}
          className={`px-4 py-2 rounded-[8px] text-sm font-medium transition-all duration-200 ${
            connected
              ? 'glass-panel hover:border-border-active text-white font-mono'
              : `${COLORS.tw.accentBg} border border-accent/35 ${COLORS.tw.accentBgHover} hover:border-accent/50 text-white ${COLORS.tw.accentGlow} active:scale-[0.98]`
          }`}
        >
          {connected && publicKey
            ? truncateAddress(publicKey.toBase58())
            : 'Connect Wallet'}
        </button>

        {showDropdown && connected && (
          <div className="absolute right-0 top-full mt-2 w-48 glass-panel rounded-[8px] py-1">
            <button
              onClick={handleCopy}
              className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-white hover:bg-bg-input transition-colors"
            >
              Copy Address
            </button>
            <button
              onClick={handleDisconnect}
              className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-white hover:bg-bg-input transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

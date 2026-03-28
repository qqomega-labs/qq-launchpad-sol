import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { PAY_TOKENS, TOKENS, getToken } from '@/config/tokens';
import { TokenIcon } from '@/components/icons';

interface TokenSelectorProps {
  selectedMint: string;
  onSelect: (mint: string) => void;
  excludeMint?: string;
}

/**
 * @dev Dropdown token selector for the swap input.
 * Uses the same click-outside pattern as SlippagePopover.
 */
export function TokenSelector({ selectedMint, onSelect, excludeMint }: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const token = getToken(selectedMint);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableTokens = PAY_TOKENS.filter((m) => m !== excludeMint);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-text-secondary text-sm font-medium hover:text-white transition-colors py-0.5 px-1 -mr-1 rounded-[6px] hover:bg-bg-input"
      >
        <TokenIcon mint={selectedMint} />
        <span>{token?.symbol ?? '???'}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 glass-panel rounded-[8px] p-1.5 w-44 z-20">
          {availableTokens.map((mint) => {
            const t = TOKENS[mint];
            const isActive = mint === selectedMint;
            return (
              <button
                key={mint}
                onClick={() => {
                  onSelect(mint);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-2.5 py-2 rounded-[6px] text-sm transition-colors ${
                  isActive
                    ? 'bg-accent/12 text-white'
                    : 'text-text-secondary hover:text-white hover:bg-bg-input'
                }`}
              >
                <TokenIcon mint={mint} className="w-4 h-4" />
                <span className="font-medium">{t.symbol}</span>
                <span className="text-text-muted text-xs ml-auto">{t.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

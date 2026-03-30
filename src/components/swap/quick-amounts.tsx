interface QuickAmountsProps {
  amounts: number[];
  onSelect: (amount: number) => void;
  onMax?: () => void;
}

/**
 * @dev Quick amount selection buttons
 */
export function QuickAmounts({ amounts, onSelect, onMax }: QuickAmountsProps) {
  return (
    <div className="flex gap-2 mt-2">
      {amounts.map((amt) => (
        <button
          key={amt}
          onClick={() => onSelect(amt)}
          className="bg-bg-input border border-border hover:border-border-active rounded-[8px] px-3 py-2 text-xs text-text-secondary hover:text-white transition-colors font-mono"
        >
          {amt}
        </button>
      ))}
      {onMax && (
        <button
          onClick={onMax}
          className="bg-bg-input border border-border hover:border-border-active rounded-[8px] px-3 py-2 text-xs text-text-secondary hover:text-white transition-colors"
        >
          Max
        </button>
      )}
    </div>
  );
}

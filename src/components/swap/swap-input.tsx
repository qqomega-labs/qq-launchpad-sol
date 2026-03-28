import { Skeleton } from '../ui/skeleton';

interface SwapInputProps {
  label: string;
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  loading?: boolean;
  tokenSymbol: string;
  tokenIcon: string;
}

/**
 * @dev Amount input field with token badge
 */
export function SwapInput({
  label,
  value,
  onChange,
  readOnly = false,
  loading = false,
  tokenSymbol,
  tokenIcon,
}: SwapInputProps) {
  return (
    <div>
      <label className="text-text-muted text-xs mb-1.5 block">{label}</label>
      <div className="bg-bg-input border border-border rounded-[8px] px-3 py-2.5 flex items-center gap-2 focus-within:border-border-active transition-colors">
        {loading ? (
          <Skeleton className="h-6 flex-1" />
        ) : (
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            readOnly={readOnly}
            placeholder="0.00"
            className="bg-transparent text-white font-mono text-lg flex-1 outline-none placeholder:text-text-muted w-0"
          />
        )}
        <span className="flex items-center gap-1.5 text-text-secondary text-sm font-medium shrink-0">
          <span>{tokenIcon}</span>
          <span>{tokenSymbol}</span>
        </span>
      </div>
    </div>
  );
}

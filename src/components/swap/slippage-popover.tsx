import { useState, useEffect, useRef } from 'react';
import { Settings } from 'lucide-react';
import { SLIPPAGE_STORAGE_KEY } from '@/config/const';

interface SlippagePopoverProps {
  value: number;
  onChange: (bps: number) => void;
}

const PRESETS = [50, 100, 200]; // 0.5%, 1%, 2%

/**
 * @dev Slippage settings popover with presets and custom input
 */
export function SlippagePopover({ value, onChange }: SlippagePopoverProps) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePreset = (bps: number) => {
    onChange(bps);
    localStorage.setItem(SLIPPAGE_STORAGE_KEY, String(bps));
    setCustom('');
  };

  const handleCustom = (val: string) => {
    setCustom(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 50) {
      const bps = Math.round(parsed * 100);
      onChange(bps);
      localStorage.setItem(SLIPPAGE_STORAGE_KEY, String(bps));
    }
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 text-text-muted hover:text-text-secondary transition-colors text-xs"
      >
        <span>Slippage: {(value / 100).toFixed(1)}%</span>
        <Settings size={14} />
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 glass-panel rounded-[8px] p-3 w-56 z-10">
          <p className="text-text-secondary text-xs mb-2">Slippage Tolerance</p>
          <div className="flex gap-1.5 mb-2">
            {PRESETS.map((bps) => (
              <button
                key={bps}
                onClick={() => handlePreset(bps)}
                className={`flex-1 py-1.5 rounded-[6px] text-xs font-medium transition-colors ${
                  value === bps && custom === ''
                    ? 'bg-accent text-white'
                    : 'bg-bg-input text-text-secondary hover:text-white'
                }`}
              >
                {(bps / 100).toFixed(1)}%
              </button>
            ))}
          </div>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Custom %"
            value={custom}
            onChange={(e) => handleCustom(e.target.value)}
            className="w-full bg-bg-input border border-border rounded-[6px] px-2 py-1.5 text-xs text-white placeholder:text-text-muted outline-none focus:border-border-active"
          />
        </div>
      )}
    </div>
  );
}

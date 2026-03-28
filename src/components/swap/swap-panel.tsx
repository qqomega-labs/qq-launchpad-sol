import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUnifiedWalletContext } from '@jup-ag/wallet-adapter';
import { Loader2, ArrowUpRight } from 'lucide-react';
import BN from 'bn.js';
import { SolanaIcon, QQIcon } from '../icons';
import { useSwap } from './use-swap';
import { SwapInput } from './swap-input';
import { QuickAmounts } from './quick-amounts';
import { SlippagePopover } from './slippage-popover';
import { Button } from '../ui/button';
import { useToast } from '../ui/toast';
import { truncateAddress } from '../../lib/format';
import { DEXSCREENER_URL, DEFAULT_SLIPPAGE_BPS, SLIPPAGE_STORAGE_KEY, TOKEN_DECIMALS } from '../../config/const';

/**
 * @dev Main swap panel with buy/sell tabs, quote fetching, and swap execution
 */
export function SwapPanel() {
  const { connected } = useWallet();
  const { setShowModal } = useUnifiedWalletContext();
  const { quote, getQuote, executeSwap, loading, quoteLoading, error } = useSwap();
  const { showToast } = useToast();

  const [isSell, setIsSell] = useState(false);
  const [inputAmount, setInputAmount] = useState('');
  const [slippage, setSlippage] = useState(() => {
    const stored = localStorage.getItem(SLIPPAGE_STORAGE_KEY);
    return stored ? Number(stored) : DEFAULT_SLIPPAGE_BPS;
  });
  const [success, setSuccess] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Debounced quote fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const amount = parseFloat(inputAmount);
    if (isNaN(amount) || amount <= 0) return;

    debounceRef.current = setTimeout(() => {
      const decimals = isSell ? TOKEN_DECIMALS : 9; // QQ decimals or SOL lamports
      const amountIn = new BN(Math.floor(amount * 10 ** decimals));
      getQuote(amountIn, isSell, slippage);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputAmount, isSell, slippage, getQuote]);

  const outputAmount = quote
    ? (Number(quote.outputAmount.toString()) / (isSell ? 1e9 : 10 ** TOKEN_DECIMALS)).toFixed(
        isSell ? 4 : 2,
      )
    : '';

  const handleSwap = useCallback(async () => {
    if (!connected) {
      setShowModal(true);
      return;
    }
    if (!quote || !inputAmount) return;

    try {
      const decimals = isSell ? TOKEN_DECIMALS : 9;
      const amountIn = new BN(Math.floor(parseFloat(inputAmount) * 10 ** decimals));
      const sig = await executeSwap(amountIn, quote.minimumAmountOut, isSell);
      showToast('success', `Transaction confirmed: ${truncateAddress(sig, 8)}`);
      setSuccess(true);
      setInputAmount('');
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      showToast('error', error || 'Transaction failed');
    }
  }, [connected, quote, inputAmount, isSell, executeSwap, setShowModal, showToast, error]);

  const ctaText = () => {
    if (!connected) return 'Connect Wallet';
    if (loading) return 'Confirming...';
    if (success) return '\u2713 Confirmed';
    if (!inputAmount || parseFloat(inputAmount) <= 0) return 'Enter Amount';
    return isSell ? 'Sell QQ' : 'Secure Your Seat';
  };

  const ctaDisabled = loading || success || (connected && (!inputAmount || parseFloat(inputAmount) <= 0));

  return (
    <div className="glass-panel-accent rounded-[12px] p-5">
      {/* Buy / Sell tabs */}
      <div className="flex gap-1 mb-5 bg-bg-input rounded-[8px] p-1">
        <Button variant="tab" active={!isSell} onClick={() => { setIsSell(false); setInputAmount(''); }} className="flex-1">
          Buy
        </Button>
        <Button variant="tab" active={isSell} onClick={() => { setIsSell(true); setInputAmount(''); }} className="flex-1">
          Sell
        </Button>
      </div>

      {/* Input */}
      <SwapInput
        label="You pay"
        value={inputAmount}
        onChange={setInputAmount}
        tokenSymbol={isSell ? 'QQ' : 'SOL'}
        tokenIcon={isSell ? <QQIcon /> : <SolanaIcon />}
      />

      {/* Quick amounts */}
      {!isSell && (
        <QuickAmounts
          amounts={[0.1, 0.5, 1]}
          onSelect={(amt) => setInputAmount(String(amt))}
        />
      )}

      {/* Output */}
      <div className="mt-4">
        <SwapInput
          label="You receive (estimated)"
          value={outputAmount}
          readOnly
          loading={quoteLoading}
          tokenSymbol={isSell ? 'SOL' : 'QQ'}
          tokenIcon={isSell ? <SolanaIcon /> : <QQIcon />}
        />
      </div>

      {/* Slippage */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-text-muted text-xs">
          {quote ? `Fee: ${Number(quote.tradingFee.toString()) / 1e9} SOL` : ''}
        </span>
        <SlippagePopover value={slippage} onChange={setSlippage} />
      </div>

      {/* CTA */}
      <div className="mt-5">
        <Button
          variant="accent"
          onClick={handleSwap}
          disabled={!!ctaDisabled}
        >
          {loading && (
            <Loader2 size={16} className="animate-spin -ml-1 mr-2 inline" />
          )}
          {ctaText()}
        </Button>
      </div>

      {/* Error display */}
      {error && (
        <p className="text-red text-xs mt-2 text-center">{error}</p>
      )}

      {/* Fallback link */}
      <div className="mt-4 text-center">
        <span className="text-text-muted text-xs">&mdash; or &mdash;</span>
        <br />
        <a
          href={DEXSCREENER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-secondary text-xs hover:text-white transition-colors"
        >
          Buy on DexScreener <ArrowUpRight size={12} className="inline ml-0.5" />
        </a>
      </div>
    </div>
  );
}

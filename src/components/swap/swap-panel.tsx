import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUnifiedWalletContext } from '@jup-ag/wallet-adapter';
import { Loader2, ArrowUpRight } from 'lucide-react';
import BN from 'bn.js';
import { useSwap } from './use-swap';
import { SwapInput } from './swap-input';
import { QuickAmounts } from './quick-amounts';
import { SlippagePopover } from './slippage-popover';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { truncateAddress } from '@/lib/format';
import { DEXSCREENER_URL, DEFAULT_SLIPPAGE_BPS, SLIPPAGE_STORAGE_KEY } from '@/config/const';
import { SOL_MINT, QQ_MINT, QUICK_AMOUNTS, getToken } from '@/config/tokens';

/**
 * @dev Main swap panel with buy/sell tabs, token selection, quote fetching, and swap execution.
 * SOL <-> QQ goes direct via Meteora DBC. Other tokens route via Jupiter API.
 */
export function SwapPanel() {
  const { connected } = useWallet();
  const { setShowModal } = useUnifiedWalletContext();
  const { quote, getQuote, executeSwap, loading, quoteLoading, error } = useSwap();
  const { showToast } = useToast();

  const [isSell, setIsSell] = useState(false);
  const [inputAmount, setInputAmount] = useState('');
  const [selectedPayMint, setSelectedPayMint] = useState(SOL_MINT);
  const [selectedReceiveMint, setSelectedReceiveMint] = useState(SOL_MINT);
  const [slippage, setSlippage] = useState(() => {
    const stored = localStorage.getItem(SLIPPAGE_STORAGE_KEY);
    return stored ? Number(stored) : DEFAULT_SLIPPAGE_BPS;
  });
  const [success, setSuccess] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Resolve input/output mints based on buy/sell mode
  const inputMint = isSell ? QQ_MINT : selectedPayMint;
  const outputMint = isSell ? selectedReceiveMint : QQ_MINT;
  const inputToken = getToken(inputMint);
  const outputToken = getToken(outputMint);
  const inputDecimals = inputToken?.decimals ?? 9;
  const outputDecimals = outputToken?.decimals ?? 6;

  // Debounced quote fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const amount = parseFloat(inputAmount);
    if (isNaN(amount) || amount <= 0) return;

    debounceRef.current = setTimeout(() => {
      const amountIn = new BN(Math.floor(amount * 10 ** inputDecimals));
      getQuote(amountIn, inputMint, outputMint, slippage);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputAmount, inputMint, outputMint, slippage, inputDecimals, getQuote]);

  const outputAmount = quote
    ? (Number(quote.outputAmount.toString()) / 10 ** outputDecimals).toFixed(
        outputDecimals > 6 ? 4 : 2,
      )
    : '';

  const handleSwap = useCallback(async () => {
    if (!connected) {
      setShowModal(true);
      return;
    }
    if (!quote || !inputAmount) return;

    try {
      const amountIn = new BN(Math.floor(parseFloat(inputAmount) * 10 ** inputDecimals));
      const sig = await executeSwap(amountIn, inputMint, outputMint, quote);
      showToast('success', `Transaction confirmed: ${truncateAddress(sig, 8)}`);
      setSuccess(true);
      setInputAmount('');
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      showToast('error', error || 'Transaction failed');
    }
  }, [connected, quote, inputAmount, inputMint, outputMint, inputDecimals, executeSwap, setShowModal, showToast, error]);

  const ctaText = () => {
    if (!connected) return 'Connect Wallet';
    if (loading) return 'Confirming...';
    if (success) return '\u2713 Confirmed';
    if (!inputAmount || parseFloat(inputAmount) <= 0) return 'Enter Amount';
    return isSell ? 'Sell QQ' : 'Secure Your Seat';
  };

  const ctaDisabled = loading || success || (connected && (!inputAmount || parseFloat(inputAmount) <= 0));

  // Quick amounts for the selected pay token
  const quickAmounts = !isSell ? (QUICK_AMOUNTS[selectedPayMint] ?? []) : [];

  // Fee / route info
  const feeInfo = () => {
    if (!quote) return '';
    if (quote.route === 'dbc') {
      return `Fee: ${Number(quote.tradingFee.toString()) / 1e9} SOL`;
    }
    const impact = quote.priceImpactPct ? `${parseFloat(quote.priceImpactPct).toFixed(2)}%` : 'N/A';
    return `Price Impact: ${impact}`;
  };

  const routeLabel = () => {
    if (!quote) return null;
    if (quote.route === 'dbc') return 'via Meteora DBC';
    return 'via Jupiter';
  };

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
        tokenMint={inputMint}
        onTokenSelect={isSell ? undefined : setSelectedPayMint}
        excludeMint={QQ_MINT}
      />

      {/* Quick amounts (buy mode only) */}
      {quickAmounts.length > 0 && (
        <QuickAmounts
          amounts={quickAmounts}
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
          tokenMint={outputMint}
          onTokenSelect={isSell ? setSelectedReceiveMint : undefined}
          excludeMint={QQ_MINT}
        />
      </div>

      {/* Slippage + fee info */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-text-muted text-xs">{feeInfo()}</span>
        <SlippagePopover value={slippage} onChange={setSlippage} />
      </div>

      {/* Route indicator */}
      {routeLabel() && (
        <p className="text-text-muted text-[10px] text-center mt-1">{routeLabel()}</p>
      )}

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

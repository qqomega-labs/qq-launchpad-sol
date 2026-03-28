import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { TOKEN_MINT, TOTAL_SUPPLY } from '../../config/constants';
import { getTokenSupply } from '../../lib/solana';

interface BurnedSupplyData {
  currentSupply: number | null;
  burned: number | null;
  seatsRemaining: number | null;
  loading: boolean;
}

/**
 * @dev Reads on-chain token supply and derives burned/seats remaining.
 * The mint is non-mintable, so 10,000 - currentSupply = burned.
 */
export function useBurnedSupply(): BurnedSupplyData {
  const { connection } = useConnection();
  const [currentSupply, setCurrentSupply] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchSupply = async () => {
      try {
        const supply = await getTokenSupply(connection, TOKEN_MINT);
        if (mounted) {
          setCurrentSupply(supply);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };

    fetchSupply();
    const interval = setInterval(fetchSupply, 60_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [connection]);

  const burned = currentSupply !== null ? TOTAL_SUPPLY - currentSupply : null;
  const seatsRemaining = currentSupply;

  return { currentSupply, burned, seatsRemaining, loading };
}

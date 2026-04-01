import { useEffect, useState } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"

import { SOL_MINT, USDC_MINT, USDT_MINT, QQ_MINT } from "@/config/tokens"

/** @dev Returns a map of mint address -> human-readable balance for the connected wallet */
export type WalletBalances = Record<string, number>

const SPL_MINTS = [USDC_MINT, USDT_MINT, QQ_MINT]

/**
 * @dev Fetches SOL and SPL token balances for the connected wallet.
 * Refreshes on wallet connection change.
 */
export function useWalletBalances(): WalletBalances {
   const { connection } = useConnection()
   const { publicKey, connected } = useWallet()
   const [balances, setBalances] = useState<WalletBalances>({})

   useEffect(() => {
      if (!connected || !publicKey) {
         setBalances({})
         return
      }

      let cancelled = false

      async function fetchBalances() {
         if (!publicKey) return
         try {
            const [lamports, tokenAccounts] = await Promise.all([
               connection.getBalance(publicKey),
               connection.getParsedTokenAccountsByOwner(publicKey, {
                  programId: TOKEN_PROGRAM_ID, // Canonical SPL Token Program address (immutable on all Solana clusters
               }),
            ])

            if (cancelled) return

            const result: WalletBalances = {
               [SOL_MINT]: lamports / 1e9,
            }

            for (const { account } of tokenAccounts.value) {
               const parsed = account.data.parsed?.info
               if (!parsed) continue
               const mint: string = parsed.mint
               if (SPL_MINTS.includes(mint)) {
                  result[mint] = Number(parsed.tokenAmount.uiAmount ?? 0)
               }
            }

            setBalances(result)
         } catch {
            // silently ignore — balance display is non-critical
         }
      }

      fetchBalances()
      return () => {
         cancelled = true
      }
   }, [connected, publicKey, connection])

   return balances
}

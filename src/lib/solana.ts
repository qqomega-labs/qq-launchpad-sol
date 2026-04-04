import { Connection, PublicKey } from "@solana/web3.js"
import BN from "bn.js"

/**
 * @dev Canonical SPL Token Program ID: immutable Solana protocol constant.
 * Equivalent to TOKEN_PROGRAM_ID from @solana/spl-token (not imported to avoid
 * module-level Buffer dependency triggering Vite 8 externalization).
 */
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")

/**
 * @dev Fetch the current token supply for a given mint address.
 * Returns the supply as a plain number (adjusted for decimals).
 */
export async function getTokenSupply(connection: Connection, mintAddress: PublicKey): Promise<number> {
   const supply = await connection.getTokenSupply(mintAddress)
   return Number(supply.value.uiAmount)
}

/**
 * @dev Fetch the on-chain SPL token balance for a specific mint and owner.
 * Returns the raw amount as BN (no decimal adjustment).
 * Returns BN(0) if no token account exists.
 */
export async function fetchSplBalance(connection: Connection, owner: PublicKey, mint: string): Promise<BN> {
   const accounts = await connection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID,
   })
   for (const { account } of accounts.value) {
      const parsed = account.data.parsed?.info
      if (parsed && parsed.mint === mint) {
         return new BN(parsed.tokenAmount.amount)
      }
   }
   return new BN(0)
}

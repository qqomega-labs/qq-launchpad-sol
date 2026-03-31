import { Connection, PublicKey } from "@solana/web3.js"

/**
 * @dev Fetch the current token supply for a given mint address.
 * Returns the supply as a plain number (adjusted for decimals).
 */
export async function getTokenSupply(connection: Connection, mintAddress: PublicKey): Promise<number> {
   const supply = await connection.getTokenSupply(mintAddress)
   return Number(supply.value.uiAmount)
}

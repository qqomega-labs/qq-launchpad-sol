import { describe, it, expect } from "vitest"
import { PublicKey, TransactionMessage, VersionedTransaction, TransactionInstruction } from "@solana/web3.js"

/**
 * @dev Tests for Jupiter transaction program validation.
 * Verifies that only known program IDs are accepted before signing,
 * preventing wallet drain if the Jupiter API is compromised.
 *
 * The validation logic lives in use-swap.ts (validateJupiterPrograms).
 * We re-implement the allowlist check here to test the logic in isolation
 * without mounting React hooks.
 */

const JUPITER_ALLOWED_PROGRAMS = new Set([
   "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
   "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB",
   "JUP2jxvXaqu7NQY1GmNF4m1vodw12LVXYxbFL2uN9oJ",
   "11111111111111111111111111111111",
   "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
   "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
   "ComputeBudget111111111111111111111111111111",
   "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
])

function validateJupiterPrograms(tx: VersionedTransaction): void {
   const accountKeys = tx.message.staticAccountKeys
   const instructions = tx.message.compiledInstructions
   for (const ix of instructions) {
      const programId = accountKeys[ix.programIdIndex]
      if (!programId) throw new Error("Invalid transaction: missing program account")
      const programStr = programId.toBase58()
      if (!JUPITER_ALLOWED_PROGRAMS.has(programStr)) {
         throw new Error("Transaction contains unknown program")
      }
   }
}

function buildVersionedTx(programIds: string[]): VersionedTransaction {
   const payer = PublicKey.unique()
   const instructions = programIds.map((pid) => new TransactionInstruction({ keys: [], programId: new PublicKey(pid) }))
   const message = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: "11111111111111111111111111111111",
      instructions,
   }).compileToV0Message()
   return new VersionedTransaction(message)
}

describe("validateJupiterPrograms", () => {
   it("accepts a transaction with only Jupiter v6 + System Program", () => {
      const tx = buildVersionedTx(["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4", "11111111111111111111111111111111"])
      expect(() => validateJupiterPrograms(tx)).not.toThrow()
   })

   it("accepts all known programs combined", () => {
      const tx = buildVersionedTx([
         "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
         "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
         "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
         "ComputeBudget111111111111111111111111111111",
      ])
      expect(() => validateJupiterPrograms(tx)).not.toThrow()
   })

   it("rejects a transaction with an unknown program", () => {
      const maliciousProgram = PublicKey.unique().toBase58()
      const tx = buildVersionedTx(["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4", maliciousProgram])
      expect(() => validateJupiterPrograms(tx)).toThrow("Transaction contains unknown program")
   })

   it("rejects a transaction that only contains an unknown program", () => {
      const tx = buildVersionedTx([PublicKey.unique().toBase58()])
      expect(() => validateJupiterPrograms(tx)).toThrow("Transaction contains unknown program")
   })

   it("accepts SPL Token 2022 program", () => {
      const tx = buildVersionedTx(["TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"])
      expect(() => validateJupiterPrograms(tx)).not.toThrow()
   })

   it("accepts legacy Jupiter v4 program", () => {
      const tx = buildVersionedTx(["JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB"])
      expect(() => validateJupiterPrograms(tx)).not.toThrow()
   })
})

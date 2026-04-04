/**
 * @dev Jupiter Quote API v6 + Swap API client (headless, no widget)
 */

import { JUPITER_QUOTE_API } from "@/config/const"

export class JupiterApiError extends Error {
   constructor(
      message: string,
      public status: number
   ) {
      super(message)
      this.name = "JupiterApiError"
   }
}

// PUBLIC

export interface JupiterQuoteParams {
   inputMint: string
   outputMint: string
   amount: string
   slippageBps: number
}

export interface JupiterQuoteResponse {
   inputMint: string
   inAmount: string
   outputMint: string
   outAmount: string
   otherAmountThreshold: string
   swapMode: string
   slippageBps: number
   priceImpactPct: string
   routePlan: Array<{
      swapInfo: {
         ammKey: string
         label: string
         inputMint: string
         outputMint: string
         inAmount: string
         outAmount: string
         feeAmount: string
         feeMint: string
      }
      percent: number
   }>
   contextSlot: number
   timeTaken: number
}

export interface JupiterSwapResponse {
   swapTransaction: string
   lastValidBlockHeight: number
   prioritizationFeeLamports: number
}

/**
 * @dev Fetch a swap quote from Jupiter v6.
 * Retries once on 429 with 2s backoff.
 */
export async function fetchJupiterQuote(params: JupiterQuoteParams): Promise<JupiterQuoteResponse> {
   const url = new URL(`${JUPITER_QUOTE_API}/quote`)
   url.searchParams.set("inputMint", params.inputMint)
   url.searchParams.set("outputMint", params.outputMint)
   url.searchParams.set("amount", params.amount)
   url.searchParams.set("slippageBps", String(params.slippageBps))

   const res = await fetchWithRetry(url.toString())
   return res.json()
}

/**
 * @dev Build a ready-to-sign swap transaction from a Jupiter quote.
 * Returns the base64-encoded VersionedTransaction.
 */
export async function fetchJupiterSwapTx(
   quoteResponse: JupiterQuoteResponse,
   userPublicKey: string
): Promise<JupiterSwapResponse> {
   const res = await fetchWithRetry(`${JUPITER_QUOTE_API}/swap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
         quoteResponse,
         userPublicKey,
         wrapAndUnwrapSol: true,
      }),
   })
   return res.json()
}

// PRIVATE

function friendlyJupiterError(status: number): string {
   if (status === 400) return "Invalid swap parameters"
   if (status === 404) return "Route not found, try a different amount"
   if (status === 429) return "Rate limited, please wait a moment"
   if (status >= 500) return "Jupiter API unavailable, please try again"
   return "Quote unavailable"
}

const JUPITER_API_KEY = import.meta.env.VITE_JUPITER_API_KEY ?? ""

async function fetchWithRetry(url: string, init?: RequestInit, retries = 1): Promise<Response> {
   const headers: Record<string, string> = {
      ...(init?.headers as Record<string, string>),
   }
   if (JUPITER_API_KEY) {
      headers["x-api-key"] = JUPITER_API_KEY
   }

   let res: Response
   try {
      res = await fetch(url, { ...init, headers })
   } catch {
      // Network error (DNS failure, connection refused, etc.)
      if (retries > 0) {
         await new Promise((r) => setTimeout(r, 2000))
         return fetchWithRetry(url, init, retries - 1)
      }
      throw new JupiterApiError("Network error, please retry", 0)
   }

   if ((res.status === 429 || res.status >= 500) && retries > 0) {
      await new Promise((r) => setTimeout(r, 2000))
      return fetchWithRetry(url, init, retries - 1)
   }

   if (!res.ok) {
      const body = await res.text().catch(() => "")
      // Log full error for debugging only; do not expose raw body to the UI
      console.error(`[Jupiter] ${res.status}:`, body || res.statusText)
      throw new JupiterApiError(friendlyJupiterError(res.status), res.status)
   }

   return res
}

import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"
import { resolve } from "path"

/**
 * @dev Validates the Content Security Policy in index.html.
 *
 * Security context: CSP is the primary defense against XSS, clickjacking,
 * and unauthorized resource loading. A missing directive or overly permissive
 * source could allow script injection or data exfiltration.
 *
 * This test reads the actual index.html to ensure the CSP meta tag
 * matches expectations and hasn't been accidentally weakened.
 */

const html = readFileSync(resolve(__dirname, "../index.html"), "utf-8")

/** @dev Extract the CSP content attribute from the meta tag */
function extractCSP(): string {
   const match = html.match(/http-equiv="Content-Security-Policy"\s*content="([^"]+)"/s)
   if (!match) throw new Error("CSP meta tag not found in index.html")
   return match[1].replace(/\s+/g, " ").trim()
}

describe("Content Security Policy", () => {
   const csp = extractCSP()

   describe("restrictive defaults", () => {
      it("has default-src 'self'", () => {
         expect(csp).toContain("default-src 'self'")
      })

      it("has script-src 'self' (no unsafe-eval, no unsafe-inline)", () => {
         expect(csp).toContain("script-src 'self'")
         expect(csp).not.toContain("unsafe-eval")
         expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/)
      })

      it("blocks iframes (clickjacking protection)", () => {
         expect(csp).toContain("frame-src 'none'")
      })

      it("blocks object/embed elements", () => {
         expect(csp).toContain("object-src 'none'")
      })

      it("restricts base-uri (prevents base tag hijacking)", () => {
         expect(csp).toContain("base-uri 'self'")
      })

      it("blocks form submissions (no forms in the app)", () => {
         expect(csp).toContain("form-action 'none'")
      })
   })

   describe("connect-src (API and RPC allowlist)", () => {
      it("allows Helius RPC (HTTPS + WSS)", () => {
         expect(csp).toContain("https://*.helius-rpc.com")
         expect(csp).toContain("wss://*.helius-rpc.com")
      })

      it("allows Solana public RPC fallback", () => {
         expect(csp).toContain("https://api.mainnet-beta.solana.com")
         expect(csp).toContain("wss://api.mainnet-beta.solana.com")
      })

      it("allows Jupiter API (quote + data + WebSocket)", () => {
         expect(csp).toContain("https://api.jup.ag")
         expect(csp).toContain("https://datapi.jup.ag")
         expect(csp).toContain("wss://trench-stream.jup.ag")
      })

      it("allows GeckoTerminal API", () => {
         expect(csp).toContain("https://api.geckoterminal.com")
      })

      it("does not allow wildcard connect-src", () => {
         expect(csp).not.toMatch(/connect-src[^;]*\*[^.]/)
      })
   })

   describe("connect-src (wallet adapter domains)", () => {
      it("allows Phantom wallet (HTTPS + WSS)", () => {
         expect(csp).toContain("https://*.phantom.app")
         expect(csp).toContain("wss://*.phantom.app")
      })

      it("allows Solflare wallet (HTTPS + WSS)", () => {
         expect(csp).toContain("https://*.solflare.com")
         expect(csp).toContain("wss://*.solflare.com")
      })

      it("allows WalletConnect relay (both .com and .org)", () => {
         expect(csp).toContain("wss://relay.walletconnect.com")
         expect(csp).toContain("wss://relay.walletconnect.org")
      })

      it("allows Backpack wallet (HTTPS + WSS)", () => {
         expect(csp).toContain("https://*.backpack.app")
         expect(csp).toContain("wss://*.backpack.app")
      })
   })

   describe("font and style sources", () => {
      it("allows Google Fonts for stylesheets", () => {
         expect(csp).toContain("https://fonts.googleapis.com")
      })

      it("allows Google Fonts static for font files", () => {
         expect(csp).toContain("https://fonts.gstatic.com")
      })

      it("allows inline styles (required for CSS-in-JS)", () => {
         expect(csp).toContain("style-src 'self' 'unsafe-inline'")
      })
   })
})

/**
 * @dev Buffer polyfill - loaded as a classic (blocking) script via index.html
 * BEFORE any ES module chunks execute. This guarantees globalThis.Buffer is
 * available when wallet/meteora/solana chunks initialize.
 */
import { Buffer } from "buffer"
globalThis.Buffer = Buffer
export {}

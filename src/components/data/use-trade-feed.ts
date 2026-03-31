import { useState, useEffect, useRef, useCallback } from "react"
import { JUPITER_WS } from "@/config/const"
import { TOKEN_MINT } from "@/config/const"

export interface Trade {
   txHash: string
   type: string
   asset: string
   amount: number
   usdPrice: number
   timestamp: string
   traderAddress: string
}

const MAX_TRADES = 100
const MAX_RECONNECT_DELAY = 30_000

/** @dev Runtime type guard — rejects malformed/injected WebSocket messages before they reach state */
function isValidTrade(obj: unknown): obj is Trade {
   if (!obj || typeof obj !== "object") return false
   const t = obj as Record<string, unknown>
   return (
      typeof t.txHash === "string" &&
      typeof t.type === "string" &&
      typeof t.asset === "string" &&
      typeof t.amount === "number" &&
      typeof t.usdPrice === "number" &&
      typeof t.timestamp === "string" &&
      typeof t.traderAddress === "string"
   )
}

/**
 * @dev WebSocket hook for real-time trade feed via Jupiter's trench-stream.
 * Handles React StrictMode double-mount by checking shouldReconnect before close cleanup.
 */
export function useTradeFeed() {
   const [trades, setTrades] = useState<Trade[]>([])
   const [connected, setConnected] = useState(false)
   const ws = useRef<WebSocket | null>(null)
   const shouldReconnect = useRef(true)
   const reconnectDelay = useRef(1000)
   const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

   const connect = useCallback(() => {
      if (!shouldReconnect.current) return
      if (ws.current?.readyState === WebSocket.OPEN || ws.current?.readyState === WebSocket.CONNECTING) return

      const socket = new WebSocket(JUPITER_WS)
      ws.current = socket

      socket.onopen = () => {
         setConnected(true)
         reconnectDelay.current = 1000
         socket.send(
            JSON.stringify({
               type: "subscribe:txns",
               assets: [TOKEN_MINT.toBase58()],
            })
         )
      }

      socket.onmessage = (event) => {
         try {
            const msg = JSON.parse(event.data)
            if (msg.type === "actions" && Array.isArray(msg.data)) {
               const validTrades = msg.data.filter(isValidTrade)
               setTrades((prev) => {
                  const next = [...validTrades, ...prev]
                  return next.slice(0, MAX_TRADES)
               })
            }
         } catch {
            // Ignore malformed messages
         }
      }

      socket.onerror = () => {
         socket.close()
      }

      socket.onclose = () => {
         setConnected(false)
         ws.current = null
         if (shouldReconnect.current) {
            reconnectTimer.current = setTimeout(connect, reconnectDelay.current)
            reconnectDelay.current = Math.min(reconnectDelay.current * 2, MAX_RECONNECT_DELAY)
         }
      }
   }, [])

   useEffect(() => {
      shouldReconnect.current = true
      // Defer connection to survive React StrictMode double-mount teardown
      const initTimer = setTimeout(connect, 100)

      return () => {
         shouldReconnect.current = false
         clearTimeout(initTimer)
         if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
         if (ws.current) {
            ws.current.onclose = null
            ws.current.close()
            ws.current = null
         }
      }
   }, [connect])

   return { trades, connected }
}

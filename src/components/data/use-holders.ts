import { useState, useEffect, useRef } from "react"
import { TOKEN_MINT } from "@/config/const"
import { fetchTopHolders, type TopHolder } from "@/lib/jupiter-data"

const POLL_INTERVAL = 60_000

/**
 * @dev Polling hook for top token holders via Jupiter Data API
 */
export function useHolders() {
   const [holders, setHolders] = useState<TopHolder[]>([])
   const [loading, setLoading] = useState(true)
   const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

   useEffect(() => {
      let active = true

      async function poll() {
         try {
            const data = await fetchTopHolders(TOKEN_MINT.toBase58())
            if (active) setHolders(data)
         } catch {
            // Silently retry on next poll
         } finally {
            if (active) setLoading(false)
            if (active) timer.current = setTimeout(poll, POLL_INTERVAL)
         }
      }

      poll()
      return () => {
         active = false
         if (timer.current) clearTimeout(timer.current)
      }
   }, [])

   return { holders, loading }
}

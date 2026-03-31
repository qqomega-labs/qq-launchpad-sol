import { useState } from "react"
import { TradingChart } from "./trading-chart"
import { useOhlcv } from "./use-ohlcv"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TIMEFRAMES } from "@/config/const"

/**
 * @dev Chart panel with timeframe selector and TradingView chart
 */
export function ChartPanel() {
   const [activeIdx, setActiveIdx] = useState(3) // default 1h
   const tf = TIMEFRAMES[activeIdx]

   const { candles, loading } = useOhlcv({
      timeframe: tf.timeframe,
      aggregate: tf.aggregate,
      pollMs: tf.pollMs,
   })

   return (
      <div className="glass-panel rounded-[12px] overflow-hidden">
         {/* Timeframe selector */}
         <div className="flex gap-1 p-3 border-b border-border">
            {TIMEFRAMES.map((t, i) => (
               <Button key={t.label} variant="tab" active={i === activeIdx} onClick={() => setActiveIdx(i)}>
                  {t.label}
               </Button>
            ))}
         </div>

         {/* Chart */}
         <div className="p-0">
            {loading && candles.length === 0 ? (
               <div className="flex items-center justify-center h-[400px]">
                  <Skeleton className="w-full h-full" />
               </div>
            ) : (
               <TradingChart candles={candles} />
            )}
         </div>
      </div>
   )
}

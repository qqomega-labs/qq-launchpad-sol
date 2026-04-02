import { useEffect, useRef } from "react"
import {
   createChart,
   type IChartApi,
   type ISeriesApi,
   type UTCTimestamp,
   CrosshairMode,
   LineStyle,
   CandlestickSeries,
   HistogramSeries,
} from "lightweight-charts"
import type { Candle } from "@/lib/gecko"
import { COLORS } from "@/config/const"

interface TradingChartProps {
   candles: Candle[]
}

/**
 * @dev TradingView Lightweight Charts v5 candlestick + volume chart.
 * Chart and series are created once on mount; data is updated in a separate
 * effect to avoid destroying/recreating the canvas on every poll tick.
 */
export function TradingChart({ candles }: TradingChartProps) {
   const containerRef = useRef<HTMLDivElement>(null)
   const chartRef = useRef<IChartApi | null>(null)
   const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
   const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)

   // Create chart and series once on mount
   useEffect(() => {
      if (!containerRef.current) return

      const chart = createChart(containerRef.current, {
         autoSize: true,
         layout: {
            background: { color: "transparent" },
            textColor: COLORS.raw.textSecondary,
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
         },
         grid: {
            vertLines: { color: COLORS.raw.accentGrid },
            horzLines: { color: COLORS.raw.accentGrid },
         },
         crosshair: {
            mode: CrosshairMode.Normal,
            vertLine: { color: COLORS.accent, width: 1, style: LineStyle.Dashed },
            horzLine: { color: COLORS.accent, width: 1, style: LineStyle.Dashed },
         },
         timeScale: {
            borderColor: COLORS.raw.accentBorder,
            timeVisible: true,
            secondsVisible: false,
         },
         rightPriceScale: { borderColor: COLORS.raw.accentBorder },
      })

      const candleSeries = chart.addSeries(CandlestickSeries, {
         upColor: COLORS.accent,
         downColor: COLORS.white,
         borderUpColor: COLORS.accent,
         borderDownColor: COLORS.white,
         wickUpColor: COLORS.accent,
         wickDownColor: COLORS.white,
      })

      const volumeSeries = chart.addSeries(HistogramSeries, {
         priceFormat: { type: "volume" },
         priceScaleId: "volume",
      })

      chart.priceScale("volume").applyOptions({
         scaleMargins: { top: 0.8, bottom: 0 },
      })

      chartRef.current = chart
      candleSeriesRef.current = candleSeries
      volumeSeriesRef.current = volumeSeries

      return () => {
         chart.remove()
         chartRef.current = null
         candleSeriesRef.current = null
         volumeSeriesRef.current = null
      }
   }, [])

   // Update data whenever candles change (poll ticks, timeframe switches)
   useEffect(() => {
      const candleSeries = candleSeriesRef.current
      const volumeSeries = volumeSeriesRef.current
      const chart = chartRef.current
      if (!candleSeries || !volumeSeries || !chart || candles.length === 0) return

      candleSeries.setData(
         candles.map((c) => ({
            time: c.time as UTCTimestamp,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
         }))
      )

      volumeSeries.setData(
         candles.map((c) => ({
            time: c.time as UTCTimestamp,
            value: c.volume,
            color: c.close >= c.open ? COLORS.raw.volumeUp : COLORS.raw.volumeDown,
         }))
      )

      chart.timeScale().fitContent()
   }, [candles])

   return <div ref={containerRef} className="w-full h-[400px] md:h-[350px] lg:h-[400px] landscape:h-[240px]" />
}

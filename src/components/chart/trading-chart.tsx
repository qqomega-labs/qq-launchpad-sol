import { useEffect, useRef } from 'react';
import {
  createChart,
  type IChartApi,
  type UTCTimestamp,
  CrosshairMode,
  LineStyle,
  CandlestickSeries,
  HistogramSeries,
} from 'lightweight-charts';
import type { Candle } from '../../lib/gecko';

interface TradingChartProps {
  candles: Candle[];
}

/**
 * @dev TradingView Lightweight Charts v5 candlestick + volume chart
 */
export function TradingChart({ candles }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: 'rgba(240, 232, 240, 0.55)',
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: 'rgba(253, 1, 90, 0.06)' },
        horzLines: { color: 'rgba(253, 1, 90, 0.06)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#FE246C', width: 1, style: LineStyle.Dashed },
        horzLine: { color: '#FE246C', width: 1, style: LineStyle.Dashed },
      },
      timeScale: {
        borderColor: 'rgba(253, 1, 90, 0.15)',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: { borderColor: 'rgba(253, 1, 90, 0.15)' },
      width: containerRef.current.clientWidth,
      height: 400,
    });

    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#fd015a',
      downColor: '#ffffff',
      borderUpColor: '#fd015a',
      borderDownColor: '#ffffff',
      wickUpColor: '#fd015a',
      wickDownColor: '#ffffff',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    if (candles.length > 0) {
      candleSeries.setData(
        candles.map((c) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        })),
      );

      volumeSeries.setData(
        candles.map((c) => ({
          time: c.time as UTCTimestamp,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(253, 1, 90, 0.25)' : 'rgba(255, 255, 255, 0.15)',
        })),
      );

      chart.timeScale().fitContent();
    }

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [candles]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[400px] md:h-[350px] lg:h-[400px]"
    />
  );
}

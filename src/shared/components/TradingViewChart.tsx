"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, LineData } from "lightweight-charts";
import { useTheme } from "next-themes";

export interface ChartSeries {
  type: "line" | "area" | "histogram";
  data: LineData[];
  color: string;
  title: string;
}

interface TradingViewChartProps {
  series: ChartSeries[];
  height?: number;
}

export default function TradingViewChart({ series, height = 300 }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Theme Variables
    const isDark = theme === "dark";
    const backgroundColor = isDark ? "transparent" : "transparent";
    const textColor = isDark ? "#94A3B8" : "#475569";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.08)";

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
    });

    chartRef.current = chart;

    const seriesRefs: ISeriesApi<any>[] = [];

    // Add each series
    series.forEach((s) => {
      let chartSeries;
      if (s.type === "area") {
        chartSeries = chart.addAreaSeries({
          lineColor: s.color,
          topColor: `${s.color}66`, // 40% opacity
          bottomColor: `${s.color}00`, // 0% opacity
          lineWidth: 2,
          title: s.title,
        });
      } else if (s.type === "histogram") {
        chartSeries = chart.addHistogramSeries({
          color: s.color,
          title: s.title,
        });
      } else {
        chartSeries = chart.addLineSeries({
          color: s.color,
          lineWidth: 2,
          title: s.title,
        });
      }
      
      chartSeries.setData(s.data);
      seriesRefs.push(chartSeries);
    });

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [series, height, theme]);

  return <div ref={chartContainerRef} style={{ width: "100%", height: `${height}px` }} />;
}

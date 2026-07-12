"use client";

import { useState, type ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  timeRanges?: string[];
  onTimeRangeChange?: (range: string) => void;
  className?: string;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  timeRanges = ["7D", "30D", "90D", "1Y"],
  onTimeRangeChange,
  className = "",
}: ChartCardProps) {
  const [activeRange, setActiveRange] = useState(timeRanges[1] || "30D");

  const handleRangeChange = (range: string) => {
    setActiveRange(range);
    onTimeRangeChange?.(range);
  };

  return (
    <div className={`glass-card ${className}`}>
      <div className="flex items-center justify-between px-6 pt-5 pb-2">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {subtitle}
            </p>
          )}
        </div>
        {timeRanges.length > 0 && (
          <div className="flex gap-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => handleRangeChange(range)}
                className={`btn-secondary ${activeRange === range ? "active" : ""}`}
                style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}
              >
                {range}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="chart-container">{children}</div>
    </div>
  );
}

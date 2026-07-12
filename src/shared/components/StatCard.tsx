import { TrendingUp, TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  icon?: ReactNode;
  suffix?: string;
  animationDelay?: number;
}

export default function StatCard({ label, value, change, icon, suffix, animationDelay = 0 }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const delayClass = animationDelay === 0
    ? "animate-fade-in-up"
    : animationDelay === 1
    ? "animate-fade-in-up-delay-1"
    : animationDelay === 2
    ? "animate-fade-in-up-delay-2"
    : "animate-fade-in-up-delay-3";

  return (
    <div className={`stat-card ${delayClass}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
        {icon && (
          <div
            className="p-2 rounded-lg"
            style={{ background: "rgba(6, 182, 212, 0.1)" }}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {value}
        </span>
        {suffix && (
          <span className="text-sm mb-0.5" style={{ color: "var(--text-muted)" }}>
            {suffix}
          </span>
        )}
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {isPositive ? (
            <TrendingUp size={14} style={{ color: "var(--positive)" }} />
          ) : (
            <TrendingDown size={14} style={{ color: "var(--negative)" }} />
          )}
          <span
            className="text-sm font-medium"
            style={{ color: isPositive ? "var(--positive)" : "var(--negative)" }}
          >
            {isPositive ? "+" : ""}
            {change.toFixed(2)}%
          </span>
          <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>
            vs prev.
          </span>
        </div>
      )}
    </div>
  );
}

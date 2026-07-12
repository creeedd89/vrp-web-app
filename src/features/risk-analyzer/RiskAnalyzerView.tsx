"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ShieldAlert, AlertTriangle, Clock, TrendingDown } from "lucide-react";
import TopBar from "@/shared/components/TopBar";
import ChartCard from "@/shared/components/ChartCard";
import {
  returnDistribution,
  historicalDrawdowns,
  currentRiskFactors,
} from "@/shared/data/stocks";

export default function RiskAnalyzerView() {
  const crashProbability = 14.2;
  const gaugeAngle = (crashProbability / 100) * 180;

  return (
    <div>
      <TopBar
        title="Risk Analyzer"
        subtitle="Probability analysis of stock drawdowns"
      />

      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Crash Probability Gauge */}
          <div className="glass-card p-6 flex flex-col items-center justify-center animate-fade-in-up">
            <h3 className="text-sm font-semibold mb-6" style={{ color: "var(--text-primary)" }}>
              Crash Probability (&gt;10% Drop)
            </h3>
            <div className="gauge-container" style={{ width: 200, height: 120 }}>
              <svg viewBox="0 0 200 120" className="w-full h-full">
                {/* Background arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {/* Green zone (0-25%) */}
                <path
                  d="M 20 100 A 80 80 0 0 1 60 32"
                  fill="none"
                  stroke="var(--positive)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  opacity="0.3"
                />
                {/* Yellow zone (25-50%) */}
                <path
                  d="M 60 32 A 80 80 0 0 1 140 32"
                  fill="none"
                  stroke="var(--warning)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  opacity="0.3"
                />
                {/* Red zone (50-100%) */}
                <path
                  d="M 140 32 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="var(--negative)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  opacity="0.3"
                />
                {/* Needle */}
                <line
                  x1="100"
                  y1="100"
                  x2={100 + 65 * Math.cos(Math.PI - (gaugeAngle * Math.PI) / 180)}
                  y2={100 - 65 * Math.sin(Math.PI - (gaugeAngle * Math.PI) / 180)}
                  stroke="var(--accent-cyan)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="100" r="6" fill="var(--accent-cyan)" />
              </svg>
            </div>
            <div className="text-3xl font-bold mt-2" style={{ color: "var(--accent-cyan)" }}>
              {crashProbability}%
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Based on current market conditions
            </div>
            <span className="badge badge-warning mt-3">
              <AlertTriangle size={12} />
              Moderate Risk
            </span>
          </div>

          {/* Risk Factors */}
          <div className="lg:col-span-2 glass-card p-6 animate-fade-in-up-delay-1">
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Current Risk Factors
            </h3>
            <div className="space-y-3">
              {currentRiskFactors.map((factor) => (
                <div
                  key={factor.name}
                  className="flex items-center justify-between p-3 rounded-xl border"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background:
                          factor.impact === "High"
                            ? "var(--negative)"
                            : factor.impact === "Medium"
                            ? "var(--warning)"
                            : "var(--positive)",
                      }}
                    />
                    <div>
                      <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {factor.name}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {factor.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="badge badge-neutral">{factor.category}</span>
                    <span
                      className="badge"
                      style={{
                        background:
                          factor.impact === "High"
                            ? "var(--negative-bg)"
                            : factor.impact === "Medium"
                            ? "var(--warning-bg)"
                            : "var(--positive-bg)",
                        color:
                          factor.impact === "High"
                            ? "var(--negative)"
                            : factor.impact === "Medium"
                            ? "var(--warning)"
                            : "var(--positive)",
                      }}
                    >
                      {factor.impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Return Distribution */}
        <ChartCard
          title="Return Distribution"
          subtitle="Probability of returns in each range — tails highlighted"
          timeRanges={[]}
          className="animate-fade-in-up-delay-2"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={returnDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="range" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{
                  background: "rgba(17, 28, 50, 0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#F1F5F9",
                  fontSize: "13px",
                }}
                formatter={(value: number) => [`${value}%`, "Probability"]}
              />
              <Bar dataKey="probability" radius={[6, 6, 0, 0]}>
                {returnDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isTail ? "#F43F5E" : "rgba(6, 182, 212, 0.5)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Historical Drawdowns */}
        <div className="glass-card p-6 animate-fade-in-up-delay-3">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Historical Major Drawdowns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {historicalDrawdowns.map((event) => (
              <div
                key={event.date}
                className="rounded-xl p-4 border"
                style={{
                  background: "rgba(244, 63, 94, 0.03)",
                  borderColor: "rgba(244, 63, 94, 0.1)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    {event.date}
                  </span>
                  <TrendingDown size={14} style={{ color: "var(--negative)" }} />
                </div>
                <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {event.event}
                </div>
                <div className="text-2xl font-bold mt-2" style={{ color: "var(--negative)" }}>
                  {event.drawdown}%
                </div>
                <div className="flex items-center gap-1 mt-2" style={{ color: "var(--text-muted)" }}>
                  <Clock size={12} />
                  <span className="text-xs">Recovery: {event.recovery}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

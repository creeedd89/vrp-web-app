"use client";

import { useState, useEffect, useCallback } from "react";
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
import { AlertTriangle, Clock, TrendingDown, Search, Loader2, Zap } from "lucide-react";
import TopBar from "@/shared/components/TopBar";
import ChartCard from "@/shared/components/ChartCard";
import {
  historicalDrawdowns,
  currentRiskFactors,
  returnDistribution as mockReturnDistribution,
} from "@/shared/data/stocks";
import { calculateCrashProbability, generateReturnDistribution } from "@/shared/utils/riskMath";

export default function RiskAnalyzerView() {
  const [ticker, setTicker] = useState("AAPL");
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [impliedVol, setImpliedVol] = useState<number | null>(null);
  const [dataSource, setDataSource] = useState<string>("—");
  const [error, setError] = useState<string | null>(null);

  const fetchOptionData = useCallback(async (symbol: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/option-chain?symbol=${encodeURIComponent(symbol)}`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const json = await response.json();

      // Our API returns { data: OptionContract[], source: string }
      const contracts = json.data;
      const source = json.source || "unknown";
      setDataSource(source);

      if (!contracts || contracts.length === 0) {
        throw new Error("No options contracts returned");
      }

      // Calculate ATM implied vol:
      // Find all CALL contracts with the shortest expiry, then pick the one
      // closest to having delta ~0.5 (i.e. strike closest to underlying).
      // Since we don't have an explicit currentPrice, we estimate it as the
      // midpoint between the highest and lowest strike of the nearest expiry.
      const minDTE = Math.min(...contracts.map((c: any) => c.daysToExpiry));
      const nearTermContracts = contracts.filter((c: any) => c.daysToExpiry === minDTE);

      // For ATM estimation, find the strike where calls and puts have similar prices
      // or just pick the strike with the highest open interest (liquid ATM strike)
      const calls = nearTermContracts.filter((c: any) => c.type === "CALL");
      const puts = nearTermContracts.filter((c: any) => c.type === "PUT");

      let atmIV: number | null = null;

      if (calls.length > 0) {
        // Sort by OI descending — highest OI is usually near ATM
        const sorted = [...calls].sort((a: any, b: any) => (b.openInterest || 0) - (a.openInterest || 0));
        // Take the top-OI contract's IV, or average a few near-ATM
        const topCalls = sorted.slice(0, 3);
        const avgIV = topCalls.reduce((sum: number, c: any) => sum + (c.impliedVol || 0), 0) / topCalls.length;
        atmIV = avgIV;
      }

      if (atmIV === null || atmIV <= 0) {
        // Fallback: average IV of all contracts
        const allIVs = contracts.map((c: any) => c.impliedVol || 0).filter((v: number) => v > 0);
        atmIV = allIVs.length > 0 ? allIVs.reduce((s: number, v: number) => s + v, 0) / allIVs.length : 15;
      }

      setImpliedVol(atmIV);
      setTicker(symbol);
    } catch (err: any) {
      console.error("Risk Analyzer fetch error:", err);
      setError(err.message || "Could not load data");
      setImpliedVol(null);
      setDataSource("fallback");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchOptionData("AAPL");
  }, [fetchOptionData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchOptionData(searchInput.trim().toUpperCase());
    }
  };

  // Calculations based on live IV
  const displayIV = impliedVol ?? 15; // default if null
  const crashProbability = calculateCrashProbability(displayIV, 30, 0.10, 0.05);
  const gaugeAngle = Math.min((crashProbability / 100) * 180, 180);

  const distData = impliedVol !== null
    ? generateReturnDistribution(displayIV, 30)
    : mockReturnDistribution;

  const riskLabel = crashProbability > 25 ? "High Risk" : crashProbability > 10 ? "Moderate Risk" : "Low Risk";
  const riskBadgeClass = crashProbability > 25 ? "badge-error" : crashProbability > 10 ? "badge-warning" : "badge-success";

  return (
    <div>
      <TopBar
        title="Risk Analyzer"
        subtitle="Live probability analysis using Black-Scholes risk-neutral distributions"
        action={
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ticker (e.g. RELIANCE.NS)"
              className="input-field pl-9 w-[220px]"
            />
          </form>
        }
      />

      <div className="px-8 py-6 space-y-6">

        {/* Header with Ticker Info */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
              {ticker}
              {dataSource && dataSource !== "fallback" && (
                <span className="badge badge-success text-[10px] flex items-center gap-1">
                  <Zap size={10} />
                  {dataSource === "live" ? "Live US" : dataSource === "nse" ? "Live NSE" : dataSource === "mock" ? "Simulated" : dataSource}
                </span>
              )}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              ATM Implied Volatility: {isLoading ? "Loading..." : `${displayIV.toFixed(2)}%`}
              {error && <span className="text-amber-500 ml-2">({error})</span>}
            </p>
          </div>
          {isLoading && <Loader2 className="animate-spin text-cyan-500" size={24} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Crash Probability Gauge */}
          <div className="glass-card p-6 flex flex-col items-center justify-center animate-fade-in-up">
            <h3 className="text-sm font-semibold mb-6 text-center" style={{ color: "var(--text-primary)" }}>
              Crash Probability (&gt;10% Drop in 30 Days)
            </h3>
            <div className="gauge-container relative" style={{ width: 200, height: 120 }}>
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
                  className="transition-all duration-1000 ease-out"
                />
                <circle cx="100" cy="100" r="6" fill="var(--accent-cyan)" />
              </svg>
            </div>
            <div className="text-3xl font-bold mt-2" style={{ color: "var(--accent-cyan)" }}>
              {isLoading ? "..." : `${crashProbability.toFixed(1)}%`}
            </div>
            <div className="text-xs mt-1 text-center px-4" style={{ color: "var(--text-muted)" }}>
              Calculated via N(−d₂) from live ATM Implied Volatility
            </div>
            <span className={`badge mt-3 ${riskBadgeClass}`}>
              <AlertTriangle size={12} />
              {riskLabel}
            </span>
          </div>

          {/* Risk Factors */}
          <div className="lg:col-span-2 glass-card p-6 animate-fade-in-up-delay-1">
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Current Market Risk Factors
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
          title="Log-Normal Return Distribution"
          subtitle={`30-day forward probability distribution derived from ${displayIV.toFixed(1)}% IV`}
          timeRanges={[]}
          className="animate-fade-in-up-delay-2"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="range" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                }}
                formatter={(value: any) => [`${Number(value)}%`, "Probability"]}
              />
              <Bar dataKey="probability" radius={[6, 6, 0, 0]} animationDuration={1500}>
                {distData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isTail ? "var(--negative)" : "rgba(6, 182, 212, 0.5)"}
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
                  background: "var(--negative-bg)",
                  borderColor: "var(--negative-bg)",
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

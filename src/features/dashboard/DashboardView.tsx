"use client";

import TradingViewChart from "@/shared/components/TradingViewChart";
import { Activity, BarChart3, Shield, TrendingUp, Info, Download } from "lucide-react";
import TopBar from "@/shared/components/TopBar";
import StatCard from "@/shared/components/StatCard";
import ChartCard from "@/shared/components/ChartCard";
import { globalMarkets, generateVRPHistory } from "@/shared/data/markets";
import { exportElementToPDF } from "@/shared/utils/exportToPDF";
import { topStocks } from "@/shared/data/stocks";

const vrpHistory = generateVRPHistory(30);

export default function DashboardView() {
  const primaryMarket = globalMarkets[0]; // S&P 500 default

  const vrpSeries = [
    {
      type: "area" as const,
      title: "VRP",
      color: "#06B6D4",
      data: vrpHistory.map((d) => ({
        time: d.dateString,
        value: d.vrp,
      })),
    },
  ];

  const volSeries = [
    {
      type: "line" as const,
      title: "Implied Vol",
      color: "#8B5CF6",
      data: vrpHistory.map((d) => ({
        time: d.dateString,
        value: d.impliedVol,
      })),
    },
    {
      type: "line" as const,
      title: "Realized Vol",
      color: "#06B6D4",
      data: vrpHistory.map((d) => ({
        time: d.dateString,
        value: d.realizedVol,
      })),
    },
  ];

  const handleExportPDF = async () => {
    await exportElementToPDF("dashboard-content", "VRP_Global_Dashboard_Report");
  };

  return (
    <div>
      <TopBar
        title="Dashboard"
        subtitle="Real-time Variance Risk Premium overview"
        action={
          <button onClick={handleExportPDF} className="btn-secondary flex items-center gap-2">
            <Download size={14} />
            Export Report
          </button>
        }
      />

      <div id="dashboard-content" className="px-8 py-6 space-y-6">
        {/* VRP Explainer */}
        <div className="glass-card p-6 animate-fade-in-up">
          <div className="flex gap-4 items-start">
            <div className="p-3 rounded-xl" style={{ background: "rgba(6, 182, 212, 0.1)" }}>
              <Info size={20} style={{ color: "var(--accent-cyan)" }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>What is Variance Risk Premium (VRP)?</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Variance Risk Premium (VRP) is the difference between <strong>implied volatility</strong> (market expectations priced into options) and <strong>realized volatility</strong> (actual historical movement). A positive VRP means options are priced higher than actual recent market movement, often creating opportunities for premium sellers.
              </p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="VRP Value"
            value={primaryMarket.vrp.toFixed(2)}
            change={primaryMarket.vrpChange}
            suffix="%"
            icon={<TrendingUp size={16} style={{ color: "var(--accent-cyan)" }} />}
            animationDelay={0}
          />
          <StatCard
            label="Implied Volatility"
            value={primaryMarket.impliedVol.toFixed(2)}
            change={1.23}
            suffix="%"
            icon={<Activity size={16} style={{ color: "var(--accent-cyan)" }} />}
            animationDelay={1}
          />
          <StatCard
            label="Realized Volatility"
            value={primaryMarket.realizedVol.toFixed(2)}
            change={-0.45}
            suffix="%"
            icon={<BarChart3 size={16} style={{ color: "var(--accent-cyan)" }} />}
            animationDelay={2}
          />
          <StatCard
            label="Risk Score"
            value={primaryMarket.riskScore.toString()}
            change={-2.1}
            suffix="/ 100"
            icon={<Shield size={16} style={{ color: "var(--accent-cyan)" }} />}
            animationDelay={3}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* VRP Trend Chart */}
          <ChartCard
            title="VRP Trend"
            subtitle="Tracks VRP over time. A rising trend means options are becoming relatively more expensive compared to actual market movement."
            className="animate-fade-in-up-delay-2"
          >
            <TradingViewChart series={vrpSeries} height={280} />
          </ChartCard>

          {/* Implied vs Realized Vol */}
          <ChartCard
            title="Implied vs Realized Volatility"
            subtitle="Compares market expectations (Implied) against actual movement (Realized). The gap between these lines represents the VRP."
            className="animate-fade-in-up-delay-3"
          >
            <TradingViewChart series={volSeries} height={280} />
          </ChartCard>
        </div>

        {/* Global Markets Heatmap */}
        <div className="glass-card p-6 animate-fade-in-up-delay-4">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Global Markets VRP Heatmap
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {globalMarkets.map((market) => {
              const vrpColor =
                market.vrp > 6
                  ? "var(--negative)"
                  : market.vrp > 4
                  ? "var(--warning)"
                  : "var(--positive)";
              const vrpBg =
                market.vrp > 6
                  ? "var(--negative-bg)"
                  : market.vrp > 4
                  ? "var(--warning-bg)"
                  : "var(--positive-bg)";
              return (
                <div
                  key={market.id}
                  className="rounded-xl p-4 border transition-all hover:scale-[1.02] cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{market.flag}</span>
                    <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                      {market.exchange}
                    </span>
                  </div>
                  <div className="text-xl font-bold" style={{ color: vrpColor }}>
                    {market.vrp.toFixed(2)}%
                  </div>
                  <div className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
                    {market.index}
                  </div>
                  <div className="mt-2">
                    <span
                      className="badge"
                      style={{ background: vrpBg, color: vrpColor, fontSize: "10px" }}
                    >
                      {market.vrpChange >= 0 ? "+" : ""}
                      {market.vrpChange.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Movers Table */}
        <div className="glass-card p-6 animate-fade-in-up-delay-4">
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Top VRP Movers
          </h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th>Exchange</th>
                  <th>Price</th>
                  <th>Change</th>
                  <th>VRP</th>
                  <th>Implied Vol</th>
                  <th>Realized Vol</th>
                  <th>Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {topStocks.slice(0, 8).map((stock) => (
                  <tr key={stock.ticker}>
                    <td>
                      <div>
                        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {stock.ticker}
                        </span>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {stock.name}
                        </div>
                      </div>
                    </td>
                    <td>{stock.exchange}</td>
                    <td style={{ color: "var(--text-primary)" }}>
                      {stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span
                        style={{
                          color: stock.changePercent >= 0 ? "var(--positive)" : "var(--negative)",
                        }}
                      >
                        {stock.changePercent >= 0 ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold" style={{ color: "var(--accent-cyan)" }}>
                        {stock.vrp.toFixed(2)}%
                      </span>
                    </td>
                    <td>{stock.impliedVol.toFixed(2)}%</td>
                    <td>{stock.realizedVol.toFixed(2)}%</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-16 h-1.5 rounded-full overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${stock.riskScore}%`,
                              background:
                                stock.riskScore > 60
                                  ? "var(--negative)"
                                  : stock.riskScore > 35
                                  ? "var(--warning)"
                                  : "var(--positive)",
                            }}
                          />
                        </div>
                        <span className="text-xs">{stock.riskScore}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

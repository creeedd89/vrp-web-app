'use client';

import { useState, useMemo } from 'react';
import TradingViewChart from '@/shared/components/TradingViewChart';
import {
  Activity,
  BarChart3,
  Shield,
  TrendingUp,
  Info,
  Download,
  AlertTriangle,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import TopBar from '@/shared/components/TopBar';
import StatCard from '@/shared/components/StatCard';
import ChartCard from '@/shared/components/ChartCard';
import { globalMarkets, generateVRPHistory } from '@/shared/data/markets';
import { exportElementToPDF } from '@/shared/utils/exportToPDF';
import { topStocks } from '@/shared/data/stocks';

export default function DashboardView() {
  const primaryMarket = globalMarkets[0]; // S&P 500 default

  const [days, setDays] = useState(30);

  const vrpHistory = useMemo(() => generateVRPHistory(days), [days]);

  const handleTimeRangeChange = (range: string) => {
    if (range === '7D') setDays(7);
    else if (range === '30D') setDays(30);
    else if (range === '90D') setDays(90);
    else if (range === '1Y') setDays(365);
  };

  const vrpSeries = [
    {
      type: 'area' as const,
      title: 'VRP',
      color: '#06B6D4',
      data: vrpHistory.map((d) => ({
        time: d.dateString,
        value: d.vrp,
      })),
    },
  ];

  const volSeries = [
    {
      type: 'line' as const,
      title: 'Implied Vol',
      color: '#8B5CF6',
      data: vrpHistory.map((d) => ({
        time: d.dateString,
        value: d.impliedVol,
      })),
    },
    {
      type: 'line' as const,
      title: 'Realized Vol',
      color: '#06B6D4',
      data: vrpHistory.map((d) => ({
        time: d.dateString,
        value: d.realizedVol,
      })),
    },
  ];

  const handleExportPDF = async () => {
    await exportElementToPDF('dashboard-content', 'VRP_Global_Dashboard_Report');
  };

  // Market Insights
  const safeMarkets = globalMarkets
    .filter((m) => m.riskScore <= 30)
    .map((m) => m.exchange)
    .join(', ');
  const riskyMarkets = globalMarkets
    .filter((m) => m.riskScore >= 45)
    .map((m) => m.exchange)
    .join(', ');
  const highVrpMarkets = globalMarkets
    .filter((m) => m.vrp >= 5.0)
    .map((m) => m.exchange)
    .join(', ');

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

      <div id="dashboard-content" className="space-y-6 px-8 py-6">
        {/* VRP Explainer & Standards */}
        <div className="glass-card animate-fade-in-up p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl p-3" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
              <Info size={20} style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Variance Risk Premium (VRP) & Market Standards
              </h3>
              <p
                className="mb-4 text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                Variance Risk Premium (VRP) is the difference between{' '}
                <strong>implied volatility</strong> (market expectations priced into options) and{' '}
                <strong>realized volatility</strong> (actual historical movement). A positive VRP
                means options are priced higher than actual recent market movement, often creating
                opportunities for premium sellers.
              </p>

              <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-3">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    VRP Benchmarks
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    <li>
                      <span className="mr-2 inline-block h-3 w-3 rounded-sm bg-emerald-500"></span>
                      <strong>0% - 3%:</strong> Normal market conditions
                    </li>
                    <li>
                      <span className="mr-2 inline-block h-3 w-3 rounded-sm bg-amber-500"></span>
                      <strong>3% - 5%:</strong> Elevated premium (Good selling opportunity)
                    </li>
                    <li>
                      <span className="mr-2 inline-block h-3 w-3 rounded-sm bg-cyan-500"></span>
                      <strong>&gt; 5%:</strong> High Return (Exceptional premium)
                    </li>
                  </ul>
                </div>
                <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-3">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    Risk Score Standards
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    <li>
                      <span className="mr-2 inline-block h-3 w-3 rounded-sm bg-emerald-500"></span>
                      <strong>≤ 30:</strong> Safer Markets (Stable, lower volatility)
                    </li>
                    <li>
                      <span className="mr-2 inline-block h-3 w-3 rounded-sm bg-amber-500"></span>
                      <strong>31 - 44:</strong> Average Risk (Standard market conditions)
                    </li>
                    <li>
                      <span className="mr-2 inline-block h-3 w-3 rounded-sm bg-rose-500"></span>
                      <strong>≥ 45:</strong> Risky Markets (Highly volatile, exercise caution)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="VRP Value"
            value={primaryMarket.vrp.toFixed(2)}
            change={primaryMarket.vrpChange}
            suffix="%"
            icon={<TrendingUp size={16} style={{ color: 'var(--accent-cyan)' }} />}
            animationDelay={0}
          />
          <StatCard
            label="Implied Volatility"
            value={primaryMarket.impliedVol.toFixed(2)}
            change={1.23}
            suffix="%"
            icon={<Activity size={16} style={{ color: 'var(--accent-cyan)' }} />}
            animationDelay={1}
          />
          <StatCard
            label="Realized Volatility"
            value={primaryMarket.realizedVol.toFixed(2)}
            change={-0.45}
            suffix="%"
            icon={<BarChart3 size={16} style={{ color: 'var(--accent-cyan)' }} />}
            animationDelay={2}
          />
          <StatCard
            label="Risk Score"
            value={primaryMarket.riskScore.toString()}
            change={-2.1}
            suffix="/ 100"
            icon={<Shield size={16} style={{ color: 'var(--accent-cyan)' }} />}
            animationDelay={3}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* VRP Trend Chart */}
          <ChartCard
            title="VRP Trend"
            subtitle="Tracks VRP over time. A rising trend means options are becoming relatively more expensive compared to actual market movement."
            className="animate-fade-in-up-delay-2"
            onTimeRangeChange={handleTimeRangeChange}
          >
            <TradingViewChart series={vrpSeries} height={280} />
          </ChartCard>

          {/* Implied vs Realized Vol */}
          <ChartCard
            title="Implied vs Realized Volatility"
            subtitle="Compares market expectations (Implied) against actual movement (Realized). The gap between these lines represents the VRP."
            className="animate-fade-in-up-delay-3"
            onTimeRangeChange={handleTimeRangeChange}
          >
            <TradingViewChart series={volSeries} height={280} />
          </ChartCard>
        </div>

        {/* Market Regime Insights */}
        <div className="animate-fade-in-up-delay-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="glass-card border-l-4 border-emerald-500 bg-emerald-900/10 p-4">
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <h4 className="text-sm font-bold text-white">Safer Markets</h4>
            </div>
            <p className="text-xs text-slate-400">
              Stable regions with lowest risk scores (≤30):{' '}
              <span className="font-semibold text-slate-300">{safeMarkets || 'None'}</span>.
            </p>
          </div>

          <div className="glass-card border-l-4 border-rose-500 bg-rose-900/10 p-4">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-500" />
              <h4 className="text-sm font-bold text-white">Risky Markets</h4>
            </div>
            <p className="text-xs text-slate-400">
              Highly volatile regions with elevated risk scores (≥45):{' '}
              <span className="font-semibold text-slate-300">{riskyMarkets || 'None'}</span>.
            </p>
          </div>

          <div className="glass-card border-l-4 border-cyan-500 bg-cyan-900/10 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Zap size={16} className="text-cyan-500" />
              <h4 className="text-sm font-bold text-white">High Return (VRP)</h4>
            </div>
            <p className="text-xs text-slate-400">
              Highest premium opportunities for sellers (≥5.0%):{' '}
              <span className="font-semibold text-slate-300">{highVrpMarkets || 'None'}</span>.
            </p>
          </div>
        </div>

        {/* Global Markets Heatmap */}
        <div className="glass-card animate-fade-in-up-delay-4 p-6">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Global Markets VRP Heatmap
          </h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {globalMarkets.map((market) => {
              const vrpColor =
                market.vrp > 6
                  ? 'var(--negative)'
                  : market.vrp > 4
                    ? 'var(--warning)'
                    : 'var(--positive)';
              const vrpBg =
                market.vrp > 6
                  ? 'var(--negative-bg)'
                  : market.vrp > 4
                    ? 'var(--warning-bg)'
                    : 'var(--positive-bg)';
              return (
                <div
                  key={market.id}
                  className="cursor-pointer rounded-xl border p-4 transition-all hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg">{market.flag}</span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {market.exchange}
                    </span>
                  </div>
                  <div className="text-xl font-bold" style={{ color: vrpColor }}>
                    {market.vrp.toFixed(2)}%
                  </div>
                  <div className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {market.index}
                  </div>
                  <div className="mt-2">
                    <span
                      className="badge"
                      style={{ background: vrpBg, color: vrpColor, fontSize: '10px' }}
                    >
                      {market.vrpChange >= 0 ? '+' : ''}
                      {market.vrpChange.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Movers Table */}
        <div className="glass-card animate-fade-in-up-delay-4 p-6">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
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
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {stock.ticker}
                        </span>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {stock.name}
                        </div>
                      </div>
                    </td>
                    <td>{stock.exchange}</td>
                    <td style={{ color: 'var(--text-primary)' }}>
                      {stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span
                        style={{
                          color: stock.changePercent >= 0 ? 'var(--positive)' : 'var(--negative)',
                        }}
                      >
                        {stock.changePercent >= 0 ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold" style={{ color: 'var(--accent-cyan)' }}>
                        {stock.vrp.toFixed(2)}%
                      </span>
                    </td>
                    <td>{stock.impliedVol.toFixed(2)}%</td>
                    <td>{stock.realizedVol.toFixed(2)}%</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-1.5 w-16 overflow-hidden rounded-full"
                          style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${stock.riskScore}%`,
                              background:
                                stock.riskScore > 60
                                  ? 'var(--negative)'
                                  : stock.riskScore > 35
                                    ? 'var(--warning)'
                                    : 'var(--positive)',
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

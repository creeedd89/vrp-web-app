'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Globe, TrendingUp, TrendingDown } from 'lucide-react';
import TopBar from '@/shared/components/TopBar';
import ChartCard from '@/shared/components/ChartCard';
import { globalMarkets } from '@/shared/data/markets';

const crossMarketData = [
  { month: 'Jan', NYSE: 3.8, NSE: 3.5, LSE: 2.7, TSE: 4.2, HKEX: 5.8 },
  { month: 'Feb', NYSE: 4.1, NSE: 3.7, LSE: 2.9, TSE: 4.0, HKEX: 6.2 },
  { month: 'Mar', NYSE: 3.9, NSE: 4.1, LSE: 3.1, TSE: 4.5, HKEX: 5.5 },
  { month: 'Apr', NYSE: 4.5, NSE: 3.9, LSE: 2.8, TSE: 4.3, HKEX: 6.8 },
  { month: 'May', NYSE: 4.2, NSE: 3.6, LSE: 3.0, TSE: 4.8, HKEX: 6.1 },
  { month: 'Jun', NYSE: 3.7, NSE: 4.0, LSE: 2.6, TSE: 4.1, HKEX: 5.9 },
  { month: 'Jul', NYSE: 4.0, NSE: 3.8, LSE: 2.9, TSE: 4.6, HKEX: 6.5 },
  { month: 'Aug', NYSE: 4.3, NSE: 3.5, LSE: 3.2, TSE: 4.4, HKEX: 6.3 },
  { month: 'Sep', NYSE: 3.9, NSE: 3.9, LSE: 2.8, TSE: 4.7, HKEX: 5.7 },
  { month: 'Oct', NYSE: 4.1, NSE: 4.2, LSE: 3.0, TSE: 4.2, HKEX: 6.4 },
  { month: 'Nov', NYSE: 4.5, NSE: 3.7, LSE: 2.7, TSE: 4.8, HKEX: 5.9 },
  { month: 'Dec', NYSE: 4.2, NSE: 3.9, LSE: 2.9, TSE: 4.6, HKEX: 6.1 },
];

const regions = [
  { name: 'Americas', markets: globalMarkets.filter((m) => m.region === 'Americas') },
  { name: 'Europe', markets: globalMarkets.filter((m) => m.region === 'Europe') },
  { name: 'Asia-Pacific', markets: globalMarkets.filter((m) => m.region === 'Asia-Pacific') },
];

const lineColors: Record<string, string> = {
  NYSE: '#06B6D4',
  NSE: '#F59E0B',
  LSE: '#8B5CF6',
  TSE: '#F43F5E',
  HKEX: '#10B981',
};

export default function MarketsView() {
  return (
    <div>
      <TopBar title="Global Markets" subtitle="VRP analysis across all major stock exchanges" />

      <div className="space-y-6 px-8 py-6">
        {/* Regional Breakdown */}
        {regions.map((region) => (
          <div key={region.name} className="animate-fade-in-up">
            <h3
              className="mb-4 flex items-center gap-2 text-base font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              <Globe size={16} style={{ color: 'var(--accent-cyan)' }} />
              {region.name}
            </h3>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {region.markets.map((market) => {
                const vrpColor =
                  market.vrp > 6
                    ? 'var(--negative)'
                    : market.vrp > 4
                      ? 'var(--warning)'
                      : 'var(--positive)';
                return (
                  <div key={market.id} className="glass-card cursor-pointer p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{market.flag}</span>
                        <div>
                          <div
                            className="text-sm font-semibold"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {market.exchange}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {market.country}
                          </div>
                        </div>
                      </div>
                      <span
                        className="badge"
                        style={{
                          background:
                            market.indexChange >= 0 ? 'var(--positive-bg)' : 'var(--negative-bg)',
                          color: market.indexChange >= 0 ? 'var(--positive)' : 'var(--negative)',
                        }}
                      >
                        {market.indexChange >= 0 ? (
                          <TrendingUp size={12} />
                        ) : (
                          <TrendingDown size={12} />
                        )}
                        {market.indexChange >= 0 ? '+' : ''}
                        {market.indexChange.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <div className="mb-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {market.index}
                        </div>
                        <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                          {market.indexValue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="mb-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          VRP
                        </div>
                        <div className="text-lg font-bold" style={{ color: vrpColor }}>
                          {market.vrp.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    {/* Mini sparkline */}
                    <div className="mt-3 flex h-6 items-end gap-0.5">
                      {market.trend.map((val, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm"
                          style={{
                            height: `${(val / Math.max(...market.trend)) * 100}%`,
                            background:
                              i === market.trend.length - 1
                                ? 'var(--accent-cyan)'
                                : 'rgba(6, 182, 212, 0.2)',
                            minHeight: '2px',
                          }}
                        />
                      ))}
                    </div>

                    <div
                      className="mt-4 grid grid-cols-3 gap-2 border-t pt-3"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <div>
                        <div
                          className="text-[10px] uppercase"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          IV
                        </div>
                        <div
                          className="text-xs font-semibold"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {market.impliedVol.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div
                          className="text-[10px] uppercase"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          RV
                        </div>
                        <div
                          className="text-xs font-semibold"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {market.realizedVol.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div
                          className="text-[10px] uppercase"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Risk
                        </div>
                        <div
                          className="text-xs font-semibold"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {market.riskScore}/100
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Conditional Regional Chart to occupy empty grid slots */}
              {region.markets.length === 2 && (
                <div className="glass-card hidden flex-col p-5 lg:flex">
                  <div
                    className="mb-3 text-sm font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {region.name} Trend Comparison
                  </div>
                  <div className="min-h-[120px] w-full flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={Array.from({ length: 12 }).map((_, i) => {
                          const dataPoint: Record<string, number> = { month: i };
                          region.markets.forEach((m) => {
                            dataPoint[m.exchange] = m.trend[i];
                          });
                          return dataPoint;
                        })}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="month" hide />
                        <YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                        <Tooltip
                          contentStyle={{
                            background: 'rgba(17, 28, 50, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                        {region.markets.map((m, idx) => (
                          <Line
                            key={m.exchange}
                            type="monotone"
                            dataKey={m.exchange}
                            stroke={
                              Object.values(lineColors)[idx % Object.values(lineColors).length]
                            }
                            strokeWidth={2}
                            dot={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Cross-Market Comparison */}
        <ChartCard
          title="Cross-Market VRP Comparison"
          subtitle="Monthly VRP trends across major exchanges"
          className="animate-fade-in-up-delay-2"
        >
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={crossMarketData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(17, 28, 50, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#F1F5F9',
                  fontSize: '13px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
              {Object.keys(lineColors).map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={lineColors[key]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

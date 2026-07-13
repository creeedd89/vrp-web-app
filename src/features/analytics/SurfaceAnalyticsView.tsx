'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '@/shared/components/StatCard';

interface Snapshot {
  id: string;
  symbol: string;
  timestamp: string;
  avgIV: number;
  avgVRP: number;
  putCallRatio: number;
}

interface Contract {
  id: string;
  strike: number;
  type: 'CALL' | 'PUT';
  expiration: string;
  impliedVol: number;
  vrp: number;
}

export default function SurfaceAnalyticsView() {
  const [symbol, setSymbol] = useState('RELIANCE.NS');
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [chain, setChain] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const chainRes = await fetch(`/api/option-chain?symbol=${symbol}`);
        const chainData = await chainRes.json();

        if (chainRes.status !== 200) {
          setError(chainData.error || 'Failed to fetch analytics');
        } else {
          if (chainData.data) setChain(chainData.data);
        }
      } catch {
        setError('Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    async function fetchHistory() {
      try {
        const res = await fetch(`/api/history?symbol=${symbol}`);
        const data = await res.json();
        if (data.snapshots) setSnapshots(data.snapshots);
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
    fetchHistory();
  }, [symbol]);

  interface SkewDataPoint {
    strike: number;
    callIV: number | null;
    putIV: number | null;
  }

  // Process data for charts
  const expiries = Array.from(new Set(chain.map((c) => c.expiration))).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );
  const nearestExpiry = expiries[0];
  const skewData = chain
    .filter((c) => c.expiration === nearestExpiry)
    .sort((a, b) => a.strike - b.strike)
    .reduce((acc, curr) => {
      const existing = acc.find((item) => item.strike === curr.strike);
      if (existing) {
        if (curr.type === 'CALL') existing.callIV = curr.impliedVol;
        if (curr.type === 'PUT') existing.putIV = curr.impliedVol;
      } else {
        acc.push({
          strike: curr.strike,
          callIV: curr.type === 'CALL' ? curr.impliedVol : null,
          putIV: curr.type === 'PUT' ? curr.impliedVol : null,
        });
      }
      return acc;
    }, [] as SkewDataPoint[]);

  // Prepare Snapshot Trends Data
  const trendData = snapshots.map((s) => ({
    time: new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    avgIV: parseFloat(s.avgIV.toFixed(2)),
    avgVRP: parseFloat(s.avgVRP.toFixed(2)),
    pcr: parseFloat(s.putCallRatio.toFixed(2)),
  }));

  const latestSnap = snapshots[snapshots.length - 1];
  const prevSnap = snapshots[snapshots.length - 2];

  const vrpChange = latestSnap && prevSnap ? latestSnap.avgVRP - prevSnap.avgVRP : 0;
  const pcrChange = latestSnap && prevSnap ? latestSnap.putCallRatio - prevSnap.putCallRatio : 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Surface Analytics</h1>
          <p className="text-slate-400">
            Institutional tracking of Volatility Surface and Recent Trends
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="w-40 rounded border border-slate-700 bg-slate-800 px-4 py-2 text-white"
            placeholder="Symbol..."
          />
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading Analytics...</div>
      ) : error ? (
        <div className="rounded border border-rose-900 bg-rose-900/20 p-4 text-rose-400">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard
              label="Avg VRP (Current)"
              value={latestSnap ? `${latestSnap.avgVRP.toFixed(2)}%` : 'N/A'}
              change={vrpChange !== 0 ? vrpChange : undefined}
            />
            <StatCard
              label="Put/Call Ratio"
              value={latestSnap ? latestSnap.putCallRatio.toFixed(2) : 'N/A'}
              change={pcrChange !== 0 ? pcrChange : undefined}
            />
            <StatCard
              label="Recorded Snapshots"
              value={snapshots.length.toString()}
              suffix="historical points"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Volatility Skew */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-bold text-white">
                Volatility Skew (Nearest Expiry: {nearestExpiry})
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={skewData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="strike" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: '#334155',
                        color: '#f8fafc',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="callIV"
                      stroke="#3b82f6"
                      name="Call IV (%)"
                      dot={false}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="putIV"
                      stroke="#ef4444"
                      name="Put IV (%)"
                      dot={false}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* VRP Trend */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-bold text-white">VRP Intraday Trend</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: '#334155',
                        color: '#f8fafc',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgVRP"
                      stroke="#10b981"
                      name="Avg VRP (%)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgIV"
                      stroke="#f59e0b"
                      name="Avg IV (%)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import StatCard from "@/shared/components/StatCard";

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
  type: "CALL" | "PUT";
  expiration: string;
  impliedVol: number;
  vrp: number;
}

export default function SurfaceAnalyticsView() {
  const [symbol, setSymbol] = useState("RELIANCE.NS");
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [chain, setChain] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [snapRes, chainRes] = await Promise.all([
          fetch(`/api/analytics?symbol=${symbol}`),
          fetch(`/api/option-chain?symbol=${symbol}`)
        ]);
        
        const snapData = await snapRes.json();
        const chainData = await chainRes.json();
        
        if (snapData.data) setSnapshots(snapData.data);
        if (chainData.data) setChain(chainData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [symbol]);

  // Prepare Volatility Skew Data (Current Chain)
  // Get nearest expiry
  const expiries = Array.from(new Set(chain.map(c => c.expiration))).sort();
  const nearestExpiry = expiries[0];
  const skewData = chain
    .filter(c => c.expiration === nearestExpiry && c.impliedVol > 0)
    .sort((a, b) => a.strike - b.strike)
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.strike === curr.strike);
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
    }, [] as any[]);

  // Prepare Snapshot Trends Data
  const trendData = snapshots.map(s => ({
    time: new Date(s.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    avgIV: parseFloat(s.avgIV.toFixed(2)),
    avgVRP: parseFloat(s.avgVRP.toFixed(2)),
    pcr: parseFloat(s.putCallRatio.toFixed(2))
  }));

  const latestSnap = snapshots[snapshots.length - 1];
  const prevSnap = snapshots[snapshots.length - 2];

  const vrpChange = latestSnap && prevSnap ? latestSnap.avgVRP - prevSnap.avgVRP : 0;
  const pcrChange = latestSnap && prevSnap ? latestSnap.putCallRatio - prevSnap.putCallRatio : 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Surface Analytics</h1>
          <p className="text-slate-400">Institutional tracking of Volatility Surface and Recent Trends</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 w-40"
            placeholder="Symbol..."
          />
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading Analytics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              label="Avg VRP (Current)" 
              value={latestSnap ? `${latestSnap.avgVRP.toFixed(2)}%` : "N/A"} 
              change={vrpChange !== 0 ? vrpChange : undefined}
            />
            <StatCard 
              label="Put/Call Ratio" 
              value={latestSnap ? latestSnap.putCallRatio.toFixed(2) : "N/A"} 
              change={pcrChange !== 0 ? pcrChange : undefined}
            />
            <StatCard 
              label="Recorded Snapshots" 
              value={snapshots.length.toString()} 
              suffix="historical points"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Volatility Skew */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Volatility Skew (Nearest Expiry: {nearestExpiry})</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={skewData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="strike" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                    <Legend />
                    <Line type="monotone" dataKey="callIV" stroke="#3b82f6" name="Call IV (%)" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="putIV" stroke="#ef4444" name="Put IV (%)" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* VRP Trend */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">VRP Intraday Trend</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                    <Legend />
                    <Line type="monotone" dataKey="avgVRP" stroke="#10b981" name="Avg VRP (%)" strokeWidth={2} />
                    <Line type="monotone" dataKey="avgIV" stroke="#f59e0b" name="Avg IV (%)" strokeWidth={2} />
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

'use client';

import { useState, useEffect } from 'react';
import { Search, ShieldAlert, Loader2 } from 'lucide-react';
import TopBar from '@/shared/components/TopBar';
import StatCard from '@/shared/components/StatCard';
import { OptionContract } from '@/shared/data/mockOptionsChain';

export default function PortfolioRiskView() {
  const [ticker, setTicker] = useState('RELIANCE.NS');
  const [chain, setChain] = useState<OptionContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/option-chain?symbol=${ticker}`);
        const data = await res.json();
        if (data.error) {
          setError(data.error);
          setChain([]);
        } else if (data.data) {
          setChain(data.data);
        }
      } catch {
        setError('Failed to fetch data. Please try again.');
        setChain([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [ticker]);

  const [customQuantities, setCustomQuantities] = useState<Record<string, string>>({});

  // Mock a portfolio: Short 10 contracts of the 3 highest VRP Puts, Long 5 of the highest VRP Calls
  const portfolioPositions: (OptionContract & { quantityString: string; quantity: number })[] = [];

  if (chain.length > 0 && !error) {
    const puts = chain
      .filter((c) => c.type === 'PUT')
      .sort((a, b) => b.vrp - a.vrp)
      .slice(0, 3);
    const calls = chain
      .filter((c) => c.type === 'CALL')
      .sort((a, b) => b.vrp - a.vrp)
      .slice(0, 2);

    puts.forEach((p) => {
      const qs = customQuantities[p.id] ?? '-10';
      const q = parseInt(qs, 10);
      portfolioPositions.push({ ...p, quantityString: qs, quantity: isNaN(q) ? 0 : q });
    });
    calls.forEach((c) => {
      const qs = customQuantities[c.id] ?? '5';
      const q = parseInt(qs, 10);
      portfolioPositions.push({ ...c, quantityString: qs, quantity: isNaN(q) ? 0 : q });
    });
  }

  const handleQuantityChange = (id: string, val: string) => {
    setCustomQuantities((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  // Aggregate Greeks
  const MULTIPLIER = 100; // standard multiplier

  let portfolioDelta = 0;
  let portfolioGamma = 0;
  let portfolioTheta = 0;
  let portfolioVega = 0;

  portfolioPositions.forEach((p) => {
    portfolioDelta += (p.delta || 0) * p.quantity * MULTIPLIER;
    portfolioGamma += (p.gamma || 0) * p.quantity * MULTIPLIER;
    portfolioTheta += (p.theta || 0) * p.quantity * MULTIPLIER;
    portfolioVega += (p.vega || 0) * p.quantity * MULTIPLIER;
  });

  // Calculate a mock 99% 1-Day VaR (Value at Risk) based on Delta-Gamma approximation
  // Assuming a 2% daily move in the underlying
  const spotMove = 0.02;
  const estimatedSpot = portfolioPositions.length > 0 ? portfolioPositions[0].strike : 100;

  const deltaPnl = portfolioDelta * (estimatedSpot * spotMove);
  const gammaPnl = 0.5 * portfolioGamma * Math.pow(estimatedSpot * spotMove, 2);
  const estimatedVaR = Math.abs(deltaPnl + gammaPnl) * 2.33; // 99% Z-score approx

  return (
    <div className="flex h-screen flex-col">
      <TopBar
        title="Portfolio Risk Aggregation"
        subtitle="Firm-level Greeks and Value at Risk (VaR)"
      />

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Aggregated Risk Engine</h2>
          <div className="relative flex gap-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-64 rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-4 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Load hypothetical book..."
            />
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-cyan-500" size={48} />
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center text-slate-400">
            <ShieldAlert size={48} className="mb-4 text-rose-500" />
            <p className="text-lg font-bold">{error}</p>
          </div>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Portfolio Net Delta"
                value={portfolioDelta.toFixed(2)}
                suffix="Directional Bias"
              />
              <StatCard
                label="Portfolio Net Gamma"
                value={portfolioGamma.toFixed(2)}
                suffix="Convexity"
              />
              <StatCard
                label="Daily Theta Decay"
                value={`$${portfolioTheta.toFixed(2)}`}
                suffix="Time Value"
              />
              <StatCard
                label="Portfolio Net Vega"
                value={`$${portfolioVega.toFixed(2)}`}
                suffix="Vol Exposure"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-xl lg:col-span-2">
                <h3 className="mb-4 text-lg font-bold text-white">
                  Simulated Book Positions ({ticker})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="border-b border-slate-700 bg-slate-900 text-xs uppercase text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Contract</th>
                        <th className="px-4 py-3 text-right">Quantity</th>
                        <th className="px-4 py-3 text-right">Pos Delta</th>
                        <th className="px-4 py-3 text-right">Pos Gamma</th>
                        <th className="px-4 py-3 text-right">VRP</th>
                        <th className="px-4 py-3 text-right">Exp. Edge</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioPositions.map((p) => {
                        const posDelta = (p.delta || 0) * p.quantity * MULTIPLIER;
                        const posGamma = (p.gamma || 0) * p.quantity * MULTIPLIER;
                        const edge =
                          (p.vrp / 100) * (p.vega || 0) * Math.abs(p.quantity) * MULTIPLIER;

                        return (
                          <tr
                            key={p.id}
                            className="border-b border-slate-700/50 hover:bg-slate-700/30"
                          >
                            <td className="px-4 py-3 font-mono">{p.id}</td>
                            <td
                              className={`px-4 py-3 text-right font-bold ${p.quantity > 0 ? 'text-emerald-400' : p.quantity < 0 ? 'text-rose-400' : 'text-slate-400'}`}
                            >
                              <input
                                type="text"
                                value={p.quantityString}
                                onChange={(e) => handleQuantityChange(p.id, e.target.value)}
                                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-white focus:border-cyan-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-4 py-3 text-right">{posDelta.toFixed(0)}</td>
                            <td className="px-4 py-3 text-right">{posGamma.toFixed(1)}</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-300">
                              {p.vrp.toFixed(2)}%
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-400">
                              ${edge.toFixed(0)}
                            </td>
                          </tr>
                        );
                      })}
                      {portfolioPositions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                            No options chain data available for {ticker} to mock positions.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-rose-500/30 bg-slate-800 p-6 shadow-[0_0_15px_rgba(225,29,72,0.1)]">
                <div className="absolute right-0 top-0 p-4 opacity-10">
                  <ShieldAlert size={120} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-300">99% Value at Risk (1-Day)</h3>
                <p className="mb-4 text-4xl font-black text-rose-500">
                  ${estimatedVaR.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="relative z-10 text-center text-sm text-slate-400">
                  Maximum expected loss with 99% confidence over the next 24 hours based on
                  Delta-Gamma approximation.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

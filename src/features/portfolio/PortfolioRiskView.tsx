"use client";

import { useState, useEffect } from "react";
import { Search, ShieldAlert, Loader2 } from "lucide-react";
import TopBar from "@/shared/components/TopBar";
import StatCard from "@/shared/components/StatCard";
import { OptionContract } from "@/shared/data/mockOptionsChain";

export default function PortfolioRiskView() {
  const [ticker, setTicker] = useState("RELIANCE.NS");
  const [chain, setChain] = useState<OptionContract[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/option-chain?symbol=${ticker}`);
        const data = await res.json();
        if (data.data) {
          setChain(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [ticker]);

  // Mock a portfolio: Short 10 contracts of the 3 highest VRP Puts, Long 5 of the highest VRP Calls
  const portfolioPositions: (OptionContract & { quantity: number })[] = [];
  
  if (chain.length > 0) {
    const puts = chain.filter(c => c.type === 'PUT' && c.vrp > 0).sort((a,b) => b.vrp - a.vrp).slice(0, 3);
    const calls = chain.filter(c => c.type === 'CALL' && c.vrp > 0).sort((a,b) => b.vrp - a.vrp).slice(0, 2);
    
    puts.forEach(p => portfolioPositions.push({ ...p, quantity: -10 })); // Short 10
    calls.forEach(c => portfolioPositions.push({ ...c, quantity: 5 })); // Long 5
  }

  // Aggregate Greeks
  const MULTIPLIER = 100; // standard multiplier
  
  let portfolioDelta = 0;
  let portfolioGamma = 0;
  let portfolioTheta = 0;
  let portfolioVega = 0;

  portfolioPositions.forEach(p => {
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
    <div className="flex flex-col h-screen">
      <TopBar title="Portfolio Risk Aggregation" subtitle="Firm-level Greeks and Value at Risk (VaR)" />
      
      <div className="px-8 py-6 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Aggregated Risk Engine</h2>
          <div className="flex gap-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="bg-slate-800 text-white pl-9 pr-4 py-2 rounded-lg border border-slate-700 w-64 focus:outline-none focus:border-cyan-500"
              placeholder="Load hypothetical book..."
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-cyan-500" size={48} /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">Simulated Book Positions ({ticker})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-900 border-b border-slate-700">
                      <tr>
                        <th className="px-4 py-3">Contract</th>
                        <th className="px-4 py-3 text-right">Quantity</th>
                        <th className="px-4 py-3 text-right">Delta</th>
                        <th className="px-4 py-3 text-right">Gamma</th>
                        <th className="px-4 py-3 text-right">VRP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioPositions.map(p => (
                        <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="px-4 py-3 font-mono">{p.id}</td>
                          <td className={`px-4 py-3 text-right font-bold ${p.quantity > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {p.quantity > 0 ? '+' : ''}{p.quantity}
                          </td>
                          <td className="px-4 py-3 text-right">{(p.delta || 0).toFixed(3)}</td>
                          <td className="px-4 py-3 text-right">{(p.gamma || 0).toFixed(4)}</td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-400">{p.vrp.toFixed(2)}%</td>
                        </tr>
                      ))}
                      {portfolioPositions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                            No options chain data available for {ticker} to mock positions.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl border border-rose-500/30 p-6 shadow-[0_0_15px_rgba(225,29,72,0.1)] flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShieldAlert size={120} />
                </div>
                <h3 className="text-lg font-bold text-slate-300 mb-2">99% Value at Risk (1-Day)</h3>
                <p className="text-4xl font-black text-rose-500 mb-4">
                  ${estimatedVaR.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-sm text-slate-400 text-center relative z-10">
                  Maximum expected loss with 99% confidence over the next 24 hours based on Delta-Gamma approximation.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

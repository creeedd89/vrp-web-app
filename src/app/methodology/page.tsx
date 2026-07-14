"use client";

import { useState } from "react";
import TopBar from "@/shared/components/TopBar";
import { 
  BookOpen, Sigma, Activity, LineChart, Target, Calculator, 
  BarChart as BarChartIcon, Info, ArrowRight, Hash 
} from "lucide-react";
import { 
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell
} from "recharts";

// Data for Volatility Smile Chart
const smileData = Array.from({ length: 21 }, (_, i) => {
  const strike = 90 + i;
  const moneyness = strike / 100;
  const smile = Math.pow(Math.abs(1 - moneyness), 2) * 50 + 15;
  return { strike, impliedVol: smile };
});

// Data for Risk Analyzer Normal Distribution
const distributionData = [
  { range: "<-15%", probability: 0.1, isTail: true },
  { range: "-15 to -10%", probability: 2.1, isTail: true },
  { range: "-10 to -5%", probability: 13.6, isTail: false },
  { range: "-5 to -2%", probability: 18.1, isTail: false },
  { range: "-2 to 0%", probability: 16.1, isTail: false },
  { range: "0 to 2%", probability: 16.1, isTail: false },
  { range: "2 to 5%", probability: 18.1, isTail: false },
  { range: "5 to 10%", probability: 13.6, isTail: false },
  { range: "10 to 15%", probability: 2.1, isTail: false },
  { range: ">15%", probability: 0.1, isTail: true },
];

// Data for Multi-leg Scenario (Iron Condor Payoff)
const scenarioData = Array.from({ length: 41 }, (_, i) => {
  const price = 80 + i; // 80 to 120
  let pnl = 0;
  // +1 90 Put, -1 95 Put, -1 105 Call, +1 110 Call
  // Credit received = $2.00
  pnl += Math.max(0, 90 - price) * 1; // Long 90 Put
  pnl -= Math.max(0, 95 - price) * 1; // Short 95 Put
  pnl -= Math.max(0, price - 105) * 1; // Short 105 Call
  pnl += Math.max(0, price - 110) * 1; // Long 110 Call
  pnl += 2; // Net credit
  
  return { price, pnl: parseFloat(pnl.toFixed(2)) };
});

export default function MethodologyView() {
  const [activeSection, setActiveSection] = useState("vrp");

  const sections = [
    { id: "vrp", title: "Variance Risk Premium", icon: Activity },
    { id: "black-scholes", title: "Black-Scholes Model", icon: Sigma },
    { id: "greeks", title: "Option Greeks", icon: BookOpen },
    { id: "smile", title: "Volatility Surface", icon: LineChart },
    { id: "risk", title: "Risk Analyzer", icon: BarChartIcon },
    { id: "scenario", title: "Scenario Analysis", icon: Target },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <TopBar
        title="Mathematics & Methodology"
        subtitle="The definitive guide to the quantitative models powering VRP Global."
      />

      <div className="flex flex-1 overflow-hidden">
        
        {/* Table of Contents Sidebar */}
        <div className="w-64 border-r overflow-y-auto hidden md:block" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-secondary)" }}>
          <div className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>Contents</h3>
            <nav className="space-y-1">
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                      isActive ? 'bg-cyan-500/10 text-cyan-500 font-semibold' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={16} />
                    {sec.title}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth" id="scroll-container" onScroll={(e) => {
          // Simple scroll spy logic
          const container = e.currentTarget;
          const offsets = sections.map(s => ({
            id: s.id,
            offsetTop: document.getElementById(s.id)?.offsetTop || 0
          }));
          const scrollPos = container.scrollTop + 200;
          const current = offsets.slice().reverse().find(o => scrollPos >= o.offsetTop);
          if (current && current.id !== activeSection) setActiveSection(current.id);
        }}>
          <div className="max-w-4xl mx-auto space-y-16 pb-24">
            
            {/* 1. VRP */}
            <section id="vrp" className="scroll-mt-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-cyan-500/10">
                  <Activity size={24} className="text-cyan-500" />
                </div>
                <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>1. Variance Risk Premium (VRP) & RV</h2>
              </div>
              
              <div className="glass-card p-6 md:p-8 space-y-6">
                <p className="text-lg leading-relaxed text-slate-300">
                  The Variance Risk Premium (VRP) is the mathematical spread between the market's expectation of future volatility (Implied Volatility) and the actual historical volatility (Realized Volatility).
                </p>

                <div className="p-6 rounded-xl bg-slate-900 border border-slate-700 text-center">
                  <p className="font-mono text-3xl font-bold text-white mb-2">VRP = IV − RV</p>
                  <p className="text-sm text-slate-400">All values are annualized percentages.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Realized Volatility (RV) Calculation</h3>
                  <p className="text-slate-300">
                    RV is measured using the standard close-to-close log return formula over a historical window (e.g., 30 trading days).
                  </p>
                  <div className="bg-slate-900 p-4 rounded-lg overflow-x-auto border border-slate-700">
                    <pre className="font-mono text-sm text-slate-300">
                      1. Log Returns: r_i = ln( P_i / P_{"{i-1}"} ){"\n"}
                      2. Variance = Σ(r_i - mean)² / (N - 1){"\n"}
                      3. Standard Deviation (σ_daily) = √Variance{"\n"}
                      4. Annualized RV = σ_daily × √252
                    </pre>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <h3 className="text-xl font-bold text-white">UI Color Coding Logic</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <span className="text-emerald-400 font-bold block mb-1">VRP &gt; 5%</span>
                      <p className="text-xs text-slate-300">Options are overpriced. Sellers possess a mathematical edge collecting inflated premium.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <span className="text-amber-400 font-bold block mb-1">0% &lt; VRP ≤ 5%</span>
                      <p className="text-xs text-slate-300">Fairly priced. Represents the long-term average index premium. Neutral zone.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30">
                      <span className="text-rose-400 font-bold block mb-1">VRP &lt; 0%</span>
                      <p className="text-xs text-slate-300">Options are underpriced. Buyers can acquire cheap convex payouts.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Black Scholes */}
            <section id="black-scholes" className="scroll-mt-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <Sigma size={24} className="text-purple-500" />
                </div>
                <h2 className="text-3xl font-bold text-white">2. Black-Scholes Pricing Model</h2>
              </div>
              
              <div className="glass-card p-6 md:p-8 space-y-6">
                <p className="text-lg leading-relaxed text-slate-300">
                  Implied Volatility (IV) is extracted from the Black-Scholes-Merton model by plugging in the live market price and solving backwards for volatility (σ) using numerical methods like Newton-Raphson.
                </p>

                <div className="p-6 rounded-xl bg-slate-900 border border-slate-700 overflow-x-auto">
                  <h4 className="text-cyan-400 font-bold mb-4">Call Option Pricing Formula</h4>
                  <p className="font-mono text-lg text-white mb-6 whitespace-nowrap">
                    C = S₀ · N(d₁) − K · e<sup>−rT</sup> · N(d₂)
                  </p>
                  
                  <h4 className="text-purple-400 font-bold mb-4">Put Option Pricing Formula</h4>
                  <p className="font-mono text-lg text-white mb-6 whitespace-nowrap">
                    P = K · e<sup>−rT</sup> · N(−d₂) − S₀ · N(−d₁)
                  </p>

                  <div className="space-y-2 font-mono text-sm text-slate-300">
                    <p>d₁ = [ ln(S₀/K) + (r + σ²/2)T ] / (σ√T)</p>
                    <p>d₂ = d₁ − σ√T</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <Info className="shrink-0 mt-1 text-blue-400" size={20} />
                  <div>
                    <h4 className="font-bold text-blue-400 mb-1">Normal CDF Approximation</h4>
                    <p className="text-sm text-slate-300">
                      Our codebase calculates N(x) (the cumulative normal distribution) using the highly accurate Abramowitz and Stegun approximation (error &lt; 1.5e-7), ensuring rapid client-side Greek and probability calculations.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Greeks */}
            <section id="greeks" className="scroll-mt-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-orange-500/10">
                  <BookOpen size={24} className="text-orange-500" />
                </div>
                <h2 className="text-3xl font-bold text-white">3. The Option Greeks</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-6 space-y-3">
                  <h3 className="text-xl font-bold text-orange-400 flex items-center gap-2">Δ Delta</h3>
                  <p className="text-sm text-slate-300">Sensitivity to the underlying price. A delta of 0.50 means the option price moves $0.50 for every $1.00 move in the stock.</p>
                  <pre className="text-xs bg-slate-900 p-2 rounded text-slate-400 border border-slate-700">Δ_call = N(d₁){"\n"}Δ_put = N(d₁) - 1</pre>
                </div>
                <div className="glass-card p-6 space-y-3">
                  <h3 className="text-xl font-bold text-orange-400 flex items-center gap-2">Γ Gamma</h3>
                  <p className="text-sm text-slate-300">The acceleration of Delta. It measures the "curvature" of risk. Highest for At-The-Money options near expiration.</p>
                  <pre className="text-xs bg-slate-900 p-2 rounded text-slate-400 border border-slate-700">Γ = N'(d₁) / (S₀·σ·√T)</pre>
                </div>
                <div className="glass-card p-6 space-y-3">
                  <h3 className="text-xl font-bold text-orange-400 flex items-center gap-2">Θ Theta</h3>
                  <p className="text-sm text-slate-300">Time decay. Measures how much value the option loses each day as expiration approaches (assuming nothing else changes).</p>
                  <pre className="text-xs bg-slate-900 p-2 rounded text-slate-400 border border-slate-700 overflow-x-auto">Θ_c = -[S₀·N'(d₁)·σ]/(2√T) - rKe^(-rT)N(d₂)</pre>
                </div>
                <div className="glass-card p-6 space-y-3">
                  <h3 className="text-xl font-bold text-orange-400 flex items-center gap-2">ν Vega</h3>
                  <p className="text-sm text-slate-300">Sensitivity to Implied Volatility. Measures the absolute price change for a 1% shift in IV.</p>
                  <pre className="text-xs bg-slate-900 p-2 rounded text-slate-400 border border-slate-700">ν = S₀·N'(d₁)·√T</pre>
                </div>
              </div>
            </section>

            {/* 4. Volatility Smile */}
            <section id="smile" className="scroll-mt-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <LineChart size={24} className="text-emerald-500" />
                </div>
                <h2 className="text-3xl font-bold text-white">4. Volatility Surface & Smile</h2>
              </div>
              
              <div className="glass-card p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Moneyness and The "Smile"</h3>
                    <p className="text-slate-300 mb-4">
                      In theory, Implied Volatility should be constant across all strikes. In reality, it forms a "smile" or "skew" shape because of supply and demand dynamics:
                    </p>
                    <ul className="space-y-3 text-sm text-slate-300">
                      <li className="flex gap-2"><ArrowRight size={16} className="text-emerald-500 shrink-0 mt-1" /> <strong>Left side (OTM Puts):</strong> Institutions buy deep OTM puts as portfolio insurance against crashes, inflating their prices and IV (often causing a "smirk").</li>
                      <li className="flex gap-2"><ArrowRight size={16} className="text-emerald-500 shrink-0 mt-1" /> <strong>Right side (OTM Calls):</strong> Retail traders aggressively buy cheap OTM calls hoping for lottery payouts, inflating their prices.</li>
                    </ul>
                  </div>
                  <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={smileData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis dataKey="strike" stroke="#94a3b8" />
                          <YAxis domain={['auto', 'auto']} stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} formatter={(val: any) => [`${Number(val).toFixed(2)}%`, 'IV']} />
                          <ReferenceLine x={100} stroke="#64748b" strokeDasharray="3 3" label={{ position: 'top', value: 'ATM', fill: '#64748b' }} />
                          <Line type="monotone" dataKey="impliedVol" stroke="#10b981" strokeWidth={3} dot={false} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Risk Analyzer */}
            <section id="risk" className="scroll-mt-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-pink-500/10">
                  <BarChartIcon size={24} className="text-pink-500" />
                </div>
                <h2 className="text-3xl font-bold text-white">5. Risk Analyzer & Return Distributions</h2>
              </div>
              
              <div className="glass-card p-6 md:p-8 space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Log-Normal Expected Returns</h3>
                  <p className="text-slate-300">
                    The Risk Analyzer projects future price movements by assuming stock prices follow a log-normal distribution with drift (risk-free rate) and standard deviation equal to the Implied Volatility. We bucket the Z-scores to calculate the area under the curve (probabilities).
                  </p>
                </div>

                <div className="h-64 w-full bg-slate-900 border border-slate-700 p-4 rounded-xl">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="range" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} formatter={(val: any) => [`${val}%`, 'Probability']} />
                      <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.isTail ? '#ef4444' : '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Crash Probability (Tail Risk)</h3>
                  <p className="text-slate-300 mb-4">
                    The exact probability of a stock dropping below a specific threshold $K$ (e.g., a 10% drop) before time $T$ is mathematically identical to $N(-d_2)$ in the Black-Scholes formula. 
                  </p>
                  <pre className="bg-slate-900 p-4 rounded-xl text-pink-400 border border-slate-700 font-mono text-sm overflow-x-auto">
                    P(S_T &lt; K) = N(-d₂) {"\n\n"}
                    Where d₂ = [ln(S₀/K) + (r - σ²/2)T] / (σ√T)
                  </pre>
                </div>
              </div>
            </section>

            {/* 6. Scenario Analysis */}
            <section id="scenario" className="scroll-mt-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Target size={24} className="text-blue-500" />
                </div>
                <h2 className="text-3xl font-bold text-white">6. Scenario Analysis & Multi-Leg Spreads</h2>
              </div>
              
              <div className="glass-card p-6 md:p-8 space-y-6">
                <p className="text-lg leading-relaxed text-slate-300">
                  The Scenario Analyzer lets you simulate complex options positions across varying underlying prices, time decay (Theta), and Implied Volatility shocks (Vega).
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="h-64 bg-slate-900 border border-slate-700 p-4 rounded-xl">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={scenarioData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="price" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                        <ReferenceLine y={0} stroke="#64748b" />
                        <ReferenceLine x={100} stroke="#64748b" strokeDasharray="3 3" label={{ position: 'top', value: 'Current', fill: '#64748b', fontSize: 10 }} />
                        <Line type="monotone" dataKey="pnl" stroke="#10b981" strokeWidth={3} dot={false} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Net Summation Logic</h3>
                    <p className="text-slate-300 text-sm mb-4">
                      For multi-leg strategies (like the Iron Condor shown), the system recalculates the theoretical price of *each* leg at every point on the X-axis using the stressed DTE and IV values, then aggregates them:
                    </p>
                    <pre className="bg-slate-900 p-4 rounded-xl text-blue-400 border border-slate-700 font-mono text-xs overflow-x-auto">
                      Leg Value = CalculateBSPrice(type, Price_x, K, T_shocked, r, IV_shocked){"\n\n"}
                      Total PnL = Σ [ (Leg Value - Entry Price) × Quantity × Pos_Multiplier ]{"\n\n"}
                      Pos_Multiplier: Long = +1, Short = -1
                    </pre>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

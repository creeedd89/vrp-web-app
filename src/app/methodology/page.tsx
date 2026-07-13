"use client";

import TopBar from "@/shared/components/TopBar";
import { BookOpen, Sigma, Activity, LineChart, Hash, ArrowRight, Info } from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// Data for Volatility Smile Chart
const smileData = Array.from({ length: 21 }, (_, i) => {
  const strike = 90 + i;
  const moneyness = strike / 100;
  const smile = Math.pow(Math.abs(1 - moneyness), 2) * 50 + 15;
  return { strike, impliedVol: smile };
});

export default function MethodologyView() {
  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <TopBar
        title="Mathematics & Methodology"
        subtitle="100% Transparency: Understand the quantitative engine behind VRP Global"
      />

      <div className="px-8 py-8 flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Section 1: VRP */}
          <section className="glass-card p-8 animate-fade-in-up" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-cyan-500/10">
                <Activity size={24} className="text-cyan-500" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>1. Variance Risk Premium (VRP)</h2>
            </div>
            
            <p className="text-lg leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
              The Variance Risk Premium is the central metric of this platform. It mathematically measures the difference between what the market <i>expects</i> volatility to be, and what the volatility <i>actually</i> was.
            </p>

            <div className="rounded-2xl p-8 mb-8 text-center relative overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
              <p className="font-mono text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                VRP = IV − RV
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-12 mt-6 text-sm">
                <div className="text-left max-w-xs">
                  <span className="text-cyan-500 font-bold block mb-1">IV (Implied Volatility)</span>
                  <span style={{ color: "var(--text-muted)" }}>The market's future expectation of volatility, derived directly from how expensive options are right now.</span>
                </div>
                <div className="text-left max-w-xs">
                  <span className="text-purple-500 font-bold block mb-1">RV (Realized Volatility)</span>
                  <span style={{ color: "var(--text-muted)" }}>The actual, historical mathematical movement of the stock over a past window (currently a 15% baseline).</span>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>How to read the Screener Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--positive-bg)", border: "1px solid var(--positive)" }}>
                <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: "var(--positive)" }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--positive)" }} /> VRP &gt; 5% (Green)
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  <strong>Overpriced:</strong> The market is panicking or speculating heavily. Options are expensive relative to history. Sellers have a statistical edge collecting this premium.
                </p>
              </div>
              <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--warning-bg)", border: "1px solid var(--warning)" }}>
                <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: "var(--warning)" }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--warning)" }} /> 0% &lt; VRP &lt; 5% (Yellow)
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  <strong>Fairly Priced:</strong> The premium is small and within the margin of historical noise. This is neutral territory with no obvious mathematical edge.
                </p>
              </div>
              <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--negative-bg)", border: "1px solid var(--negative)" }}>
                <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: "var(--negative)" }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--negative)" }} /> VRP &lt; 0% (Red)
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  <strong>Underpriced:</strong> Options are unusually cheap. The market expects less movement than history suggests. Buyers may have an edge.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Black-Scholes */}
          <section className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: "0.1s", backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Sigma size={24} className="text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>2. Black-Scholes & Implied Volatility</h2>
            </div>
            
            <p className="text-lg leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
              Implied Volatility (IV) is not something you can just observe. It must be mathematically "backed out" from the real-time market price of an option using the Nobel Prize-winning Black-Scholes formula.
            </p>

            <div className="rounded-2xl p-8 mb-6 font-mono text-sm sm:text-base overflow-x-auto" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              <div className="mb-4 font-bold">
                <span className="text-cyan-500">C</span> = 
                <span className="text-emerald-500"> S₀</span> · N(d₁) − 
                <span className="text-amber-500"> K</span> · e<sup>−rt</sup> · N(d₂)
              </div>
              <div className="pl-4 border-l-2 mb-6" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                Where:<br/>
                <span className="text-cyan-500 font-semibold">C</span> = Call Option Market Price<br/>
                <span className="text-emerald-500 font-semibold">S₀</span> = Current Stock Price<br/>
                <span className="text-amber-500 font-semibold">K</span> = Strike Price<br/>
                N(·) = Cumulative normal distribution function
              </div>
              <div className="mb-2">
                d₁ = [ ln(<span className="text-emerald-500">S₀</span> / <span className="text-amber-500">K</span>) + (r + <span className="text-purple-500">σ²</span> / 2) · t ] / (<span className="text-purple-500">σ</span> · √t)
              </div>
              <div>
                d₂ = d₁ − <span className="text-purple-500">σ</span> · √t
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: "var(--primary-bg)", border: "1px solid var(--primary)" }}>
              <Info className="shrink-0 mt-1" size={20} style={{ color: "var(--primary)" }} />
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                <strong>Solving for IV:</strong> The only unknown variable in the market is <span className="text-purple-500 font-mono font-bold">σ</span> (Volatility). By plugging the actual live market price of the option into <span className="text-cyan-500 font-mono font-bold">C</span>, our system uses algorithms (like Newton-Raphson) to solve backward for <span className="text-purple-500 font-mono font-bold">σ</span>. That resulting value is the Implied Volatility shown in the screener!
              </p>
            </div>
          </section>

          {/* Section 3: Volatility Smile */}
          <section className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: "0.2s", backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <LineChart size={24} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>3. The Volatility Smile</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
                  In a theoretical world, IV would be completely flat across all strikes. However, in real markets—especially retail-heavy ones like India—IV forms a "smile" or "skew."
                </p>
                <ul className="space-y-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <li className="flex gap-3">
                    <ArrowRight className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                    <span><strong>Out-of-the-Money (OTM) Calls:</strong> Retail traders aggressively buy cheap OTM calls hoping for lottery-style payouts. This massive demand inflates their prices, driving IV up on the right side.</span>
                  </li>
                  <li className="flex gap-3">
                    <ArrowRight className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                    <span><strong>Out-of-the-Money (OTM) Puts:</strong> Institutions buy deep OTM puts as portfolio insurance against crashes, inflating IV on the left side (often causing a "smirk").</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-2xl" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <h4 className="text-center text-sm font-bold uppercase tracking-widest mb-6" style={{ color: "var(--text-muted)" }}>Implied Volatility across Strikes</h4>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={smileData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="strike" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                        itemStyle={{ color: '#10B981' }}
                        formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'IV']}
                      />
                      <ReferenceLine x={100} stroke="var(--text-muted)" strokeDasharray="3 3" label={{ position: 'top', value: 'Current Price (ATM)', fill: 'var(--text-muted)', fontSize: 10 }} />
                      <Line type="monotone" dataKey="impliedVol" stroke="#10B981" strokeWidth={3} dot={false} animationDuration={2000} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: The Greeks */}
          <section className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: "0.3s", backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-orange-500/10">
                <BookOpen size={24} className="text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>4. The Option Greeks</h2>
            </div>
            
            <p className="text-lg leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
              The Greeks measure the sensitivity of an option's price to various market factors. They are essential risk management tools calculated automatically in the screener.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl transition-colors" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <span className="text-orange-500 font-mono text-xl font-bold">Δ</span> Delta
                </h3>
                <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>The rate of change in the option price for a $1 change in the underlying stock. A delta of 0.5 means the option moves $0.50.</p>
                <code className="text-xs text-orange-500 bg-orange-500/10 px-2 py-1 rounded font-mono font-semibold">Δ_call = N(d₁)</code>
              </div>

              <div className="p-5 rounded-xl transition-colors" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <span className="text-orange-500 font-mono text-xl font-bold">Γ</span> Gamma
                </h3>
                <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>The rate of change of Delta for a $1 change in the stock. It measures the "curvature" or acceleration of your risk.</p>
                <code className="text-xs text-orange-500 bg-orange-500/10 px-2 py-1 rounded font-mono font-semibold">Γ = N'(d₁) / (S₀·σ·√t)</code>
              </div>

              <div className="p-5 rounded-xl transition-colors" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <span className="text-orange-500 font-mono text-xl font-bold">Θ</span> Theta
                </h3>
                <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>The rate of change in option price due to the passage of time (Time Decay). Options lose value every single day.</p>
                <code className="text-xs text-orange-500 bg-orange-500/10 px-2 py-1 rounded font-mono font-semibold">Θ_call = -[S₀·N'(d₁)·σ]/(2√t)...</code>
              </div>

              <div className="p-5 rounded-xl transition-colors" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <span className="text-orange-500 font-mono text-xl font-bold">ν</span> Vega
                </h3>
                <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>The rate of change in option price for a 1% change in Implied Volatility. Higher volatility makes options more expensive.</p>
                <code className="text-xs text-orange-500 bg-orange-500/10 px-2 py-1 rounded font-mono font-semibold">ν = S₀·N'(d₁)·√t</code>
              </div>
            </div>
          </section>

          {/* Footer Padding */}
          <div className="h-12"></div>
        </div>
      </div>
    </div>
  );
}

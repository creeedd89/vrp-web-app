'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Target, Plus, Trash2, SlidersHorizontal, Activity } from 'lucide-react';
import { calculateOptionPrice, calculateGreeks } from '@/shared/utils/blackScholes';

interface OptionLeg {
  id: string;
  type: "CALL" | "PUT";
  position: "LONG" | "SHORT";
  strike: number;
  iv: number; // in percentage, e.g. 20 for 20%
  dte: number; // days to expiry
  quantity: number;
}

export default function ScenarioAnalyzerView() {
  const [underlyingPrice, setUnderlyingPrice] = useState<number>(100);
  const [riskFreeRate, setRiskFreeRate] = useState<number>(5); // 5%
  
  // Shock sliders
  const [ivShock, setIvShock] = useState<number>(0); // absolute change in IV points (e.g. +5% IV)
  const [daysPassed, setDaysPassed] = useState<number>(0); // number of days to simulate passing

  const [legs, setLegs] = useState<OptionLeg[]>([
    {
      id: "leg-1",
      type: "CALL",
      position: "LONG",
      strike: 100,
      iv: 20,
      dte: 30,
      quantity: 1,
    }
  ]);

  const addLeg = () => {
    setLegs([
      ...legs,
      {
        id: `leg-${Date.now()}`,
        type: "CALL",
        position: "LONG",
        strike: underlyingPrice,
        iv: 20,
        dte: 30,
        quantity: 1,
      }
    ]);
  };

  const removeLeg = (id: string) => {
    if (legs.length > 1) {
      setLegs(legs.filter(l => l.id !== id));
    }
  };

  const updateLeg = (id: string, field: keyof OptionLeg, value: string | number) => {
    setLegs(legs.map(l => {
      if (l.id === id) {
        return { ...l, [field]: value };
      }
      return l;
    }));
  };

  // Generate Scenario Data (PnL Chart)
  const chartData = useMemo(() => {
    const data = [];
    const minPrice = underlyingPrice * 0.7; // -30%
    const maxPrice = underlyingPrice * 1.3; // +30%
    const step = (maxPrice - minPrice) / 50;
    
    const r = riskFreeRate / 100;

    for (let price = minPrice; price <= maxPrice; price += step) {
      let currentNetValue = 0;
      let shockedNetValue = 0;

      legs.forEach(leg => {
        const v = leg.iv / 100;
        const T = leg.dte / 365.25;
        const posMult = leg.position === "LONG" ? 1 : -1;

        // Current Value (unshocked)
        const currentPrice = calculateOptionPrice(leg.type, underlyingPrice, leg.strike, T, r, v);
        currentNetValue += currentPrice * leg.quantity * posMult;

        // Shocked Value
        const shockedV = Math.max(0.001, (leg.iv + ivShock) / 100);
        const shockedT = Math.max(0, (leg.dte - daysPassed) / 365.25);
        
        const shockedPrice = calculateOptionPrice(leg.type, price, leg.strike, shockedT, r, shockedV);
        shockedNetValue += shockedPrice * leg.quantity * posMult;
      });

      // PnL is Shocked Value at new price - Current Value at entry price
      data.push({
        price: parseFloat(price.toFixed(2)),
        pnl: parseFloat((shockedNetValue - currentNetValue).toFixed(2)),
        // We can also plot Expiry PnL for reference
        expiryPnl: parseFloat(legs.reduce((acc, leg) => {
          const posMult = leg.position === "LONG" ? 1 : -1;
          const entryPrice = calculateOptionPrice(leg.type, underlyingPrice, leg.strike, leg.dte / 365.25, r, leg.iv / 100);
          const expiryVal = leg.type === "CALL" ? Math.max(0, price - leg.strike) : Math.max(0, leg.strike - price);
          return acc + (expiryVal - entryPrice) * leg.quantity * posMult;
        }, 0).toFixed(2))
      });
    }
    return data;
  }, [underlyingPrice, riskFreeRate, legs, ivShock, daysPassed]);

  // Aggregate Greeks for current shocked state at current underlying
  const currentNetGreeks = useMemo(() => {
    let delta = 0, gamma = 0, theta = 0, vega = 0, value = 0;
    const r = riskFreeRate / 100;

    legs.forEach(leg => {
      const posMult = leg.position === "LONG" ? 1 : -1;
      const shockedV = Math.max(0.001, (leg.iv + ivShock) / 100);
      const shockedT = Math.max(0, (leg.dte - daysPassed) / 365.25);

      const price = calculateOptionPrice(leg.type, underlyingPrice, leg.strike, shockedT, r, shockedV);
      const greeks = calculateGreeks(leg.type, underlyingPrice, leg.strike, shockedT, r, shockedV);

      value += price * leg.quantity * posMult;
      delta += greeks.delta * leg.quantity * posMult;
      gamma += greeks.gamma * leg.quantity * posMult;
      theta += greeks.theta * leg.quantity * posMult;
      vega += greeks.vega * leg.quantity * posMult;
    });

    return { value, delta, gamma, theta, vega };
  }, [underlyingPrice, riskFreeRate, legs, ivShock, daysPassed]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 z-10 relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="text-accent-cyan" /> Multi-Leg Scenario Analysis
          </h1>
          <p className="text-slate-400">Build strategies, apply shocks, and analyze theoretical PnL</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Strategy Builder */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Global Parameters */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-accent-blue" />
              Global Parameters
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Underlying Price</label>
                <input 
                  type="number" 
                  value={underlyingPrice}
                  onChange={(e) => setUnderlyingPrice(parseFloat(e.target.value) || 0)}
                  className="input-field py-1.5" 
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Risk-Free Rate (%)</label>
                <input 
                  type="number" 
                  value={riskFreeRate}
                  onChange={(e) => setRiskFreeRate(parseFloat(e.target.value) || 0)}
                  className="input-field py-1.5" 
                />
              </div>
            </div>
          </div>

          {/* Legs Builder */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Strategy Legs</h3>
              <button onClick={addLeg} className="btn-secondary flex items-center gap-1 py-1 px-2 text-xs">
                <Plus size={14} /> Add Leg
              </button>
            </div>
            
            {legs.map((leg, index) => (
              <div key={leg.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 relative">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-accent-cyan">Leg {index + 1}</span>
                  {legs.length > 1 && (
                    <button onClick={() => removeLeg(leg.id)} className="text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Position</label>
                    <select 
                      value={leg.position}
                      onChange={(e) => updateLeg(leg.id, "position", e.target.value)}
                      className="select-field py-1 px-2 text-xs bg-slate-900"
                    >
                      <option value="LONG">Long (+)</option>
                      <option value="SHORT">Short (-)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Type</label>
                    <select 
                      value={leg.type}
                      onChange={(e) => updateLeg(leg.id, "type", e.target.value)}
                      className="select-field py-1 px-2 text-xs bg-slate-900"
                    >
                      <option value="CALL">Call</option>
                      <option value="PUT">Put</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Strike</label>
                    <input 
                      type="number" 
                      value={leg.strike}
                      onChange={(e) => updateLeg(leg.id, "strike", parseFloat(e.target.value) || 0)}
                      className="input-field py-1 px-2 text-xs bg-slate-900" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Quantity</label>
                    <input 
                      type="number" 
                      value={leg.quantity}
                      onChange={(e) => updateLeg(leg.id, "quantity", parseFloat(e.target.value) || 0)}
                      className="input-field py-1 px-2 text-xs bg-slate-900" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">DTE</label>
                    <input 
                      type="number" 
                      value={leg.dte}
                      onChange={(e) => updateLeg(leg.id, "dte", parseFloat(e.target.value) || 0)}
                      className="input-field py-1 px-2 text-xs bg-slate-900" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">IV (%)</label>
                    <input 
                      type="number" 
                      value={leg.iv}
                      onChange={(e) => updateLeg(leg.id, "iv", parseFloat(e.target.value) || 0)}
                      className="input-field py-1 px-2 text-xs bg-slate-900" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Shock Scenarios */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-accent-purple" />
              Stress Shocks
            </h3>
            
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>IV Shock (Absolute %)</span>
                  <span className="font-bold text-white">{ivShock > 0 ? `+${ivShock}%` : `${ivShock}%`}</span>
                </div>
                <input 
                  type="range" 
                  min="-50" 
                  max="50" 
                  step="1"
                  value={ivShock} 
                  onChange={(e) => setIvShock(parseInt(e.target.value))}
                  className="w-full accent-accent-purple"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Days Passed (Time Decay)</span>
                  <span className="font-bold text-white">{daysPassed} Days</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max={Math.max(...legs.map(l => l.dte))} 
                  step="1"
                  value={daysPassed} 
                  onChange={(e) => setDaysPassed(parseInt(e.target.value))}
                  className="w-full accent-warning"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Chart & Results */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-card p-6 flex-1 flex flex-col min-h-[400px]">
            <h3 className="text-lg font-bold text-white mb-6">Theoretical PnL Profile</h3>
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis 
                    dataKey="price" 
                    stroke="#94a3b8" 
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, '']}
                    labelFormatter={(label) => `Underlying: $${label}`}
                  />
                  <Legend />
                  <ReferenceLine x={underlyingPrice} stroke="#64748b" strokeDasharray="3 3" label={{ position: 'top', value: 'Current Price', fill: '#64748b', fontSize: 12 }} />
                  <ReferenceLine y={0} stroke="#64748b" opacity={0.5} />
                  
                  <Line 
                    type="monotone" 
                    dataKey="expiryPnl" 
                    name="PnL at Expiry" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pnl" 
                    name="Simulated PnL (T+0 shocked)" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Strategy Net Metrics (Current Underlying & Shocked Environment)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">Net Value</div>
                <div className="text-lg font-bold text-white">${currentNetGreeks.value.toFixed(2)}</div>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">Net Delta</div>
                <div className="text-lg font-bold text-accent-cyan">{currentNetGreeks.delta.toFixed(3)}</div>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">Net Gamma</div>
                <div className="text-lg font-bold text-accent-purple">{currentNetGreeks.gamma.toFixed(4)}</div>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">Net Theta</div>
                <div className="text-lg font-bold text-warning">{currentNetGreeks.theta.toFixed(3)}</div>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">Net Vega</div>
                <div className="text-lg font-bold text-emerald-400">{currentNetGreeks.vega.toFixed(3)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

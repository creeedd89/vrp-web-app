"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Calculator, Check, AlertTriangle, X } from "lucide-react";
import TopBar from "@/shared/components/TopBar";
import ChartCard from "@/shared/components/ChartCard";
import { premiumComparisons } from "@/shared/data/stocks";

const sensitivityData = [
  { strike: "90%", vrp: 2.1, premium: 5.2 },
  { strike: "95%", vrp: 3.4, premium: 7.1 },
  { strike: "97%", vrp: 3.9, premium: 7.8 },
  { strike: "100%", vrp: 4.2, premium: 8.5 },
  { strike: "103%", vrp: 4.8, premium: 9.2 },
  { strike: "105%", vrp: 5.5, premium: 10.4 },
  { strike: "110%", vrp: 6.8, premium: 12.1 },
];

export default function CalculatorView() {
  const [ticker, setTicker] = useState("AAPL");
  const [optionType, setOptionType] = useState("call");
  const [strike, setStrike] = useState("235.00");
  const [expiry, setExpiry] = useState("2026-08-15");
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = () => {
    setCalculated(true);
  };

  return (
    <div>
      <TopBar
        title="VRP Calculator"
        subtitle="Calculate and compare Variance Risk Premiums"
      />

      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="glass-card p-6 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-6">
              <Calculator size={18} style={{ color: "var(--accent-cyan)" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Input Parameters
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Stock Ticker
                </label>
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  className="input-field"
                  placeholder="e.g. AAPL"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Option Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOptionType("call")}
                    className={`btn-secondary flex-1 ${optionType === "call" ? "active" : ""}`}
                  >
                    Call
                  </button>
                  <button
                    onClick={() => setOptionType("put")}
                    className={`btn-secondary flex-1 ${optionType === "put" ? "active" : ""}`}
                  >
                    Put
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Strike Price
                </label>
                <input
                  type="number"
                  value={strike}
                  onChange={(e) => setStrike(e.target.value)}
                  className="input-field"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="input-field"
                />
              </div>

              <button onClick={handleCalculate} className="btn-primary w-full mt-2">
                Calculate VRP
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {calculated ? (
              <>
                {/* Quick Results */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up-delay-1">
                  {[
                    { label: "VRP", value: "4.23%", color: "var(--accent-cyan)" },
                    { label: "Implied Vol", value: "19.23%", color: "var(--accent-purple)" },
                    { label: "Realized Vol", value: "15.00%", color: "var(--accent-blue)" },
                    { label: "Recommended Premium", value: "$8.34", color: "var(--positive)" },
                  ].map((item) => (
                    <div key={item.label} className="stat-card">
                      <div className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                        {item.label}
                      </div>
                      <div className="text-xl font-bold" style={{ color: item.color }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Premium Comparison Table */}
                <div className="glass-card p-6 animate-fade-in-up-delay-2">
                  <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    Premium Comparison Across Models
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Model</th>
                          <th>Premium</th>
                          <th>Implied Vol</th>
                          <th>Delta</th>
                          <th>Gamma</th>
                          <th>Theta</th>
                          <th>Vega</th>
                          <th>Assessment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {premiumComparisons.map((option) => (
                          <tr key={option.model}>
                            <td>
                              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                                {option.model}
                              </span>
                            </td>
                            <td style={{ color: "var(--text-primary)" }}>${option.premium.toFixed(2)}</td>
                            <td>{option.impliedVol.toFixed(2)}%</td>
                            <td>{option.delta.toFixed(3)}</td>
                            <td>{option.gamma.toFixed(3)}</td>
                            <td>{option.theta.toFixed(2)}</td>
                            <td>{option.vega.toFixed(2)}</td>
                            <td>
                              <span
                                className="badge"
                                style={{
                                  background:
                                    option.recommendation === "Best Value"
                                      ? "var(--positive-bg)"
                                      : option.recommendation === "Overpriced"
                                      ? "var(--negative-bg)"
                                      : "var(--warning-bg)",
                                  color:
                                    option.recommendation === "Best Value"
                                      ? "var(--positive)"
                                      : option.recommendation === "Overpriced"
                                      ? "var(--negative)"
                                      : "var(--warning)",
                                }}
                              >
                                {option.recommendation === "Best Value" && <Check size={12} />}
                                {option.recommendation === "Overpriced" && <X size={12} />}
                                {option.recommendation === "Market Rate" && <AlertTriangle size={12} />}
                                {option.recommendation}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div
                className="glass-card flex items-center justify-center animate-fade-in-up"
                style={{ minHeight: "400px" }}
              >
                <div className="text-center">
                  <Calculator size={48} style={{ color: "var(--text-muted)", margin: "0 auto" }} />
                  <p className="text-sm mt-4" style={{ color: "var(--text-muted)" }}>
                    Enter parameters and click Calculate to see results
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sensitivity Chart */}
        {calculated && (
          <ChartCard
            title="Strike Price Sensitivity"
            subtitle="How VRP and premium change with different strike prices"
            timeRanges={[]}
            className="animate-fade-in-up-delay-3"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sensitivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="strike" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(17, 28, 50, 0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#F1F5F9",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="premium" name="Premium ($)" radius={[6, 6, 0, 0]}>
                  {sensitivityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.strike === "100%" ? "#06B6D4" : "rgba(6, 182, 212, 0.3)"}
                    />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="vrp" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4, fill: "#8B5CF6" }} name="VRP (%)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  );
}

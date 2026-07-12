"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, Filter, ArrowUpDown, Download } from "lucide-react";
import TopBar from "@/shared/components/TopBar";
import { generateOptionsChain, OptionContract } from "@/shared/data/optionsChain";
import { globalMarkets } from "@/shared/data/markets";
import { exportToCSV } from "@/shared/utils/exportToCSV";
import WatchlistStar from "@/shared/components/WatchlistStar";
import { useSession } from "next-auth/react";

export default function ScreenerView() {
  const { data: session } = useSession();
  const primaryMarket = globalMarkets[0];
  
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session?.user) {
      fetch("/api/watchlist")
        .then((res) => res.json())
        .then((data) => {
          if (data.watchlists) {
            setWatchlistIds(new Set(data.watchlists.map((w: any) => w.contractId)));
          }
        })
        .catch(console.error);
    } else {
      setWatchlistIds(new Set());
    }
  }, [session]);
  
  // Use useMemo to generate the options chain only once for the primary market
  const baseChain = useMemo(() => 
    generateOptionsChain(primaryMarket.indexValue, primaryMarket.realizedVol), 
  [primaryMarket]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "CALL" | "PUT">("ALL");
  const [filterExpiry, setFilterExpiry] = useState<number | null>(null);

  const filteredChain = useMemo(() => {
    return baseChain.filter((c) => {
      const matchType = filterType === "ALL" || c.type === filterType;
      const matchExpiry = filterExpiry === null || c.daysToExpiry === filterExpiry;
      const matchSearch = c.strike.toString().includes(searchTerm) || c.expiration.includes(searchTerm);
      return matchType && matchExpiry && matchSearch;
    });
  }, [baseChain, filterType, filterExpiry, searchTerm]);

  const handleExportCSV = () => {
    exportToCSV(filteredChain, "VRP_Options_Screener_Results");
  };

  return (
    <div className="flex flex-col h-screen">
      <TopBar
        title="Options Screener"
        subtitle="Find mispriced contracts based on Variance Risk Premium"
      />

      <div className="px-8 py-6 flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Controls Row */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                placeholder="Search strike, expiry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9 w-[260px]"
              />
            </div>
            
            <select 
              className="select-field w-[140px]"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="ALL">All Types</option>
              <option value="CALL">Calls Only</option>
              <option value="PUT">Puts Only</option>
            </select>

            <select 
              className="select-field w-[160px]"
              value={filterExpiry || ""}
              onChange={(e) => setFilterExpiry(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All Expirations</option>
              <option value="7">7 Days (Weekly)</option>
              <option value="30">30 Days (Monthly)</option>
              <option value="90">90 Days (Quarterly)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button className="btn-secondary flex items-center gap-2" onClick={handleExportCSV}>
              <Download size={14} />
              Export CSV
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <SlidersHorizontal size={14} />
              More Filters
            </button>
            <button className="btn-primary">
              Run Screener
            </button>
          </div>
        </div>

        {/* Data Grid */}
        <div className="glass-card flex-1 overflow-hidden flex flex-col animate-fade-in-up">
          <div className="overflow-auto flex-1">
            <table className="data-table w-full relative">
              <thead className="sticky top-0 z-10" style={{ background: "var(--bg-primary)" }}>
                <tr>
                  <th className="w-[40px]"></th>
                  <th className="whitespace-nowrap"><div className="flex items-center gap-1 cursor-pointer hover:text-cyan-500 transition-colors">Type <ArrowUpDown size={12} /></div></th>
                  <th className="whitespace-nowrap"><div className="flex items-center gap-1 cursor-pointer hover:text-cyan-500 transition-colors">Strike <ArrowUpDown size={12} /></div></th>
                  <th className="whitespace-nowrap"><div className="flex items-center gap-1 cursor-pointer hover:text-cyan-500 transition-colors">Expiration <ArrowUpDown size={12} /></div></th>
                  <th className="text-right">Bid/Ask</th>
                  <th className="text-right"><div className="flex items-center justify-end gap-1 cursor-pointer hover:text-cyan-500 transition-colors">Volume <ArrowUpDown size={12} /></div></th>
                  <th className="text-right"><div className="flex items-center justify-end gap-1 cursor-pointer hover:text-cyan-500 transition-colors">IV <ArrowUpDown size={12} /></div></th>
                  <th className="text-right"><div className="flex items-center justify-end gap-1 cursor-pointer hover:text-cyan-500 transition-colors">VRP <ArrowUpDown size={12} /></div></th>
                  <th className="text-right">Delta</th>
                  <th className="text-right">Gamma</th>
                </tr>
              </thead>
              <tbody>
                {filteredChain.map((contract) => {
                  const vrpColor = contract.vrp > 5 ? "var(--positive)" : contract.vrp < 0 ? "var(--negative)" : "var(--warning)";
                  const vrpBg = contract.vrp > 5 ? "var(--positive-bg)" : contract.vrp < 0 ? "var(--negative-bg)" : "var(--warning-bg)";
                  
                  return (
                    <tr key={contract.id} className="group">
                      <td>
                        <WatchlistStar 
                          contractId={contract.id} 
                          initialIsWatchlisted={watchlistIds.has(contract.id)} 
                        />
                      </td>
                      <td>
                        <span className={`badge ${contract.type === 'CALL' ? 'badge-positive' : 'badge-negative'}`}>
                          {contract.type}
                        </span>
                      </td>
                      <td className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
                        {contract.strike.toLocaleString()}
                      </td>
                      <td className="text-sm">
                        {contract.expiration}
                        <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>({contract.daysToExpiry}D)</span>
                      </td>
                      <td className="text-right font-mono text-sm">
                        {contract.bid.toFixed(2)} / {contract.ask.toFixed(2)}
                      </td>
                      <td className="text-right font-mono text-sm">
                        {contract.volume.toLocaleString()}
                      </td>
                      <td className="text-right font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
                        {contract.impliedVol.toFixed(1)}%
                      </td>
                      {/* VRP Heatmap Column */}
                      <td className="text-right">
                        <span 
                          className="inline-block px-2 py-1 rounded font-mono font-bold text-sm transition-all"
                          style={{ 
                            color: vrpColor, 
                            backgroundColor: vrpBg,
                            border: `1px solid ${vrpColor}40`
                          }}
                        >
                          {contract.vrp > 0 ? "+" : ""}{contract.vrp.toFixed(2)}%
                        </span>
                      </td>
                      <td className="text-right font-mono text-sm" style={{ color: "var(--text-muted)" }}>
                        {contract.delta.toFixed(2)}
                      </td>
                      <td className="text-right font-mono text-sm" style={{ color: "var(--text-muted)" }}>
                        {contract.gamma.toFixed(3)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            {filteredChain.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Filter size={48} style={{ color: "var(--text-muted)", opacity: 0.5, marginBottom: "1rem" }} />
                <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>No contracts found</h3>
                <p style={{ color: "var(--text-secondary)" }}>Try adjusting your filters to see more results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

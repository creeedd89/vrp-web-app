"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, Filter, ArrowUpDown, Download, Loader2 } from "lucide-react";
import TopBar from "@/shared/components/TopBar";
import { OptionContract } from "@/shared/data/mockOptionsChain";
import { globalMarkets } from "@/shared/data/markets";
import { exportToCSV } from "@/shared/utils/exportToCSV";
import WatchlistStar from "@/shared/components/WatchlistStar";
import { useSession } from "next-auth/react";
import VolatilitySurface3D from "@/shared/components/VolatilitySurface3D";

export default function ScreenerView() {
  const { data: session } = useSession();
  
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [ticker, setTicker] = useState("SPY");
  const [baseChain, setBaseChain] = useState<OptionContract[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"live" | "mock" | "nse" | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "3d">("table");

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
  
  // Fetch options chain from API (debounced to avoid spamming on every keystroke)
  useEffect(() => {
    if (ticker.length < 1) return;

    let isMounted = true;
    const debounceTimer = setTimeout(() => {
      setIsLoading(true);
      setError(null);
      setWarning(null);

      fetch(`/api/option-chain?symbol=${ticker}`)
        .then(res => res.json())
        .then(data => {
          if (!isMounted) return;
          if (data.data) {
            setBaseChain(data.data);
            setDataSource(data.source || "live");
            if (data.warning) setWarning(data.warning);
          } else if (data.error) {
            setError(data.error);
            setBaseChain([]);
          }
        })
        .catch(err => {
          if (!isMounted) return;
          setError("Failed to fetch options chain data.");
          setBaseChain([]);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [ticker]);

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
    exportToCSV(filteredChain, `${ticker}_Options_Screener_Results`);
  };

  return (
    <div className="flex flex-col h-screen">
      <TopBar
        title="Options Screener"
        subtitle="Find mispriced contracts based on Variance Risk Premium"
      />

      <div className="px-8 py-6 flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Data Source Banner */}
        {dataSource && !isLoading && (
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                background: dataSource === "live" ? "var(--positive-bg)" : dataSource === "nse" ? "var(--primary-bg)" : "var(--warning-bg)",
                color: dataSource === "live" ? "var(--positive)" : dataSource === "nse" ? "var(--primary)" : "var(--warning)",
                border: `1px solid ${dataSource === "live" ? "var(--positive)" : dataSource === "nse" ? "var(--primary)" : "var(--warning)"}40`,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{
                background: dataSource === "live" ? "var(--positive)" : dataSource === "nse" ? "var(--primary)" : "var(--warning)",
              }} />
              {dataSource === "live" ? "Live Data" : dataSource === "nse" ? "NSE Live Data" : "Simulated Data"}
            </span>
            {warning && (
              <span className="text-xs" style={{ color: "var(--warning)" }}>
                {warning}
              </span>
            )}
          </div>
        )}

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Ticker"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="input-field w-[100px] font-bold text-center"
              />
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
            
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 ml-4">
              <button 
                className={`px-3 py-1 rounded text-sm ${viewMode === 'table' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setViewMode('table')}
              >
                Data Table
              </button>
              <button 
                className={`px-3 py-1 rounded text-sm ${viewMode === '3d' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setViewMode('3d')}
              >
                3D Surface
              </button>
            </div>
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
            <button className="btn-primary flex items-center gap-2">
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              Refresh Data
            </button>
          </div>
        </div>

        {/* Data Grid / 3D Surface */}
        <div className="glass-card flex-1 overflow-hidden flex flex-col animate-fade-in-up">
          {viewMode === "table" ? (
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
            
            {isLoading && (
              <div className="flex flex-col items-center justify-center p-12 text-center h-[300px]">
                <Loader2 size={48} className="animate-spin" style={{ color: "var(--accent)" }} />
                <h3 className="text-lg font-semibold mt-4" style={{ color: "var(--text-primary)" }}>Loading Options Chain...</h3>
              </div>
            )}

            {!isLoading && error && (
              <div className="flex flex-col items-center justify-center p-12 text-center h-[300px]">
                <h3 className="text-lg font-semibold" style={{ color: "var(--negative)" }}>{error}</h3>
              </div>
            )}

            {!isLoading && !error && filteredChain.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-center h-[300px]">
                <Filter size={48} style={{ color: "var(--text-muted)", opacity: 0.5, marginBottom: "1rem" }} />
                <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>No contracts found</h3>
                <p style={{ color: "var(--text-secondary)" }}>Try adjusting your filters to see more results.</p>
              </div>
            )}
          </div>
          ) : (
            <div className="flex-1 p-4 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
              {filteredChain.length > 0 ? (
                <VolatilitySurface3D data={filteredChain} type={filterType === "PUT" ? "PUT" : "CALL"} />
              ) : (
                <div className="text-slate-500">No data available for 3D surface</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


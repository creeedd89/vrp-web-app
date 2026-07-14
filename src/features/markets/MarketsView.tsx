'use client';

import { TrendingUp, TrendingDown, Trophy, Medal } from 'lucide-react';
import TopBar from '@/shared/components/TopBar';
import { globalMarkets } from '@/shared/data/markets';

// Sort markets by performance (indexChange) descending
const rankedMarkets = [...globalMarkets].sort((a, b) => b.indexChange - a.indexChange);

export default function MarketsView() {
  return (
    <div>
      <TopBar title="Global Markets" subtitle="VRP analysis across all major stock exchanges" />

      <div className="space-y-6 px-8 py-6">
        <div className="animate-fade-in-up mb-8">
          <div className="mb-4">
            <h3
              className="flex items-center gap-2 text-lg font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              <Trophy size={20} style={{ color: 'var(--warning)' }} />
              Global Market Performance Ranking
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              Markets ranked by live index performance and variance risk premium
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rankedMarkets.map((market, index) => {
              const vrpColor =
                market.vrp > 6
                  ? 'var(--negative)'
                  : market.vrp > 4
                    ? 'var(--warning)'
                    : 'var(--positive)';
                    
              const isTop3 = index < 3;
              
              return (
                <div key={market.id} className="glass-card cursor-pointer p-5 relative overflow-hidden">
                  {/* Rank Badge */}
                  <div className="absolute -right-6 -top-6 w-16 h-16 transform rotate-45 flex items-end justify-center pb-2" 
                       style={{ 
                         background: index === 0 ? 'linear-gradient(135deg, transparent 50%, #fbbf24 50%)' :
                                     index === 1 ? 'linear-gradient(135deg, transparent 50%, #94a3b8 50%)' :
                                     index === 2 ? 'linear-gradient(135deg, transparent 50%, #b45309 50%)' :
                                     'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.05) 50%)',
                         color: index < 3 ? '#000' : 'var(--text-muted)',
                         fontWeight: 'bold',
                         fontSize: '12px'
                       }}>
                    <span className="-rotate-45 block transform">#{index + 1}</span>
                  </div>

                  <div className="mb-3 flex items-center justify-between pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{market.flag}</span>
                      <div>
                        <div
                          className="text-sm font-semibold flex items-center gap-2"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {market.exchange}
                          {isTop3 && <Medal size={14} style={{ color: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#b45309' }} />}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {market.country}
                        </div>
                      </div>
                    </div>
                    <span
                      className="badge"
                      style={{
                        background:
                          market.indexChange >= 0 ? 'var(--positive-bg)' : 'var(--negative-bg)',
                        color: market.indexChange >= 0 ? 'var(--positive)' : 'var(--negative)',
                      }}
                    >
                      {market.indexChange >= 0 ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                      {market.indexChange >= 0 ? '+' : ''}
                      {market.indexChange.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <div className="mb-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {market.index}
                      </div>
                      <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        {market.indexValue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mb-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        VRP
                      </div>
                      <div className="text-lg font-bold" style={{ color: vrpColor }}>
                        {market.vrp.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Mini sparkline */}
                  <div className="mt-3 flex h-6 items-end gap-0.5">
                    {market.trend.map((val, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-all duration-300 hover:opacity-100"
                        style={{
                          height: `${(val / Math.max(...market.trend)) * 100}%`,
                          background:
                            i === market.trend.length - 1
                              ? 'var(--accent-cyan)'
                              : 'rgba(6, 182, 212, 0.2)',
                          minHeight: '2px',
                        }}
                      />
                    ))}
                  </div>

                  <div
                    className="mt-4 grid grid-cols-3 gap-2 border-t pt-3"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <div>
                      <div
                        className="text-[10px] uppercase"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        IV
                      </div>
                      <div
                        className="text-xs font-semibold"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {market.impliedVol.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-[10px] uppercase"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        RV
                      </div>
                      <div
                        className="text-xs font-semibold"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {market.realizedVol.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-[10px] uppercase"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Risk
                      </div>
                      <div
                        className="text-xs font-semibold"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {market.riskScore}/100
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

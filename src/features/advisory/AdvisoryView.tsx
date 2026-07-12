"use client";

import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  AlertCircle,
  Download,
} from "lucide-react";
import TopBar from "@/shared/components/TopBar";
import { exportElementToPDF } from "@/shared/utils/exportToPDF";
import {
  advisoryItems,
  sectorSentiments,
  recommendations,
} from "@/shared/data/advisory";
export default function AdvisoryView() {
  const handleExportPDF = async () => {
    await exportElementToPDF("advisory-content", "VRP_Global_Advisory_Report");
  };

  return (
    <div>
      <TopBar
        title="Market Advisory"
        subtitle="Event-driven insights and stock recommendations"
        action={
          <button onClick={handleExportPDF} className="btn-secondary flex items-center gap-2">
            <Download size={14} />
            Export Report
          </button>
        }
      />

      <div id="advisory-content" className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Breaking Events Feed */}
          <div className="lg:col-span-2 space-y-4 animate-fade-in-up">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Market Events & Impact Analysis
            </h3>
            {advisoryItems.map((item) => (
              <div key={item.id} className="glass-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="badge"
                        style={{
                          background:
                            item.impact === "Bullish"
                              ? "var(--positive-bg)"
                              : item.impact === "Bearish"
                              ? "var(--negative-bg)"
                              : "var(--warning-bg)",
                          color:
                            item.impact === "Bullish"
                              ? "var(--positive)"
                              : item.impact === "Bearish"
                              ? "var(--negative)"
                              : "var(--warning)",
                        }}
                      >
                        {item.impact === "Bullish" ? (
                          <TrendingUp size={12} />
                        ) : item.impact === "Bearish" ? (
                          <TrendingDown size={12} />
                        ) : (
                          <Minus size={12} />
                        )}
                        {item.impact}
                      </span>
                      <span className="badge badge-neutral">{item.category}</span>
                      <span className="badge badge-neutral">{item.region}</span>
                    </div>
                    <h4
                      className="text-sm font-semibold mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.title}
                    </h4>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {item.summary}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        <Clock size={12} style={{ color: "var(--text-muted)" }} />
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {item.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          Affected:
                        </span>
                        <div className="flex gap-1">
                          {item.affectedStocks.map((stock) => (
                            <span
                              key={stock}
                              className="text-xs font-mono px-1.5 py-0.5 rounded"
                              style={{
                                background: "rgba(6, 182, 212, 0.1)",
                                color: "var(--accent-cyan)",
                              }}
                            >
                              {stock}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                      Impact
                    </div>
                    <div
                      className="text-2xl font-bold"
                      style={{
                        color:
                          item.impactScore >= 8
                            ? "var(--negative)"
                            : item.impactScore >= 6
                            ? "var(--warning)"
                            : "var(--positive)",
                      }}
                    >
                      {item.impactScore}
                    </div>
                    <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      / 10
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Sector Sentiment */}
            <div className="glass-card p-6 animate-fade-in-up-delay-1">
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Sector Sentiment
              </h3>
              <div className="space-y-3">
                {sectorSentiments.map((sector) => (
                  <div key={sector.sector} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background:
                            sector.sentiment === "Bullish"
                              ? "var(--positive)"
                              : sector.sentiment === "Bearish"
                              ? "var(--negative)"
                              : "var(--warning)",
                        }}
                      />
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {sector.sector}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-20 h-1.5 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${sector.score}%`,
                            background:
                              sector.sentiment === "Bullish"
                                ? "var(--positive)"
                                : sector.sentiment === "Bearish"
                                ? "var(--negative)"
                                : "var(--warning)",
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-mono w-8 text-right"
                        style={{
                          color:
                            sector.change >= 0 ? "var(--positive)" : "var(--negative)",
                        }}
                      >
                        {sector.change >= 0 ? "+" : ""}
                        {sector.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass-card p-6 animate-fade-in-up-delay-2">
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Stock Recommendations
              </h3>
              <div className="space-y-3">
                {recommendations.map((rec) => {
                  const upside =
                    ((rec.targetPrice - rec.currentPrice) / rec.currentPrice) * 100;
                  return (
                    <div
                      key={rec.ticker}
                      className="p-3 rounded-xl border"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        borderColor: "var(--border-subtle)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm font-bold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {rec.ticker}
                          </span>
                          <span
                            className="badge"
                            style={{
                              background:
                                rec.action === "Buy"
                                  ? "var(--positive-bg)"
                                  : rec.action === "Avoid"
                                  ? "var(--negative-bg)"
                                  : "var(--warning-bg)",
                              color:
                                rec.action === "Buy"
                                  ? "var(--positive)"
                                  : rec.action === "Avoid"
                                  ? "var(--negative)"
                                  : "var(--warning)",
                            }}
                          >
                            {rec.action === "Buy" ? (
                              <ArrowUpRight size={12} />
                            ) : rec.action === "Avoid" ? (
                              <ArrowDownRight size={12} />
                            ) : (
                              <AlertCircle size={12} />
                            )}
                            {rec.action}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target size={12} style={{ color: "var(--text-muted)" }} />
                          <span
                            className="text-xs font-mono"
                            style={{
                              color:
                                upside >= 0 ? "var(--positive)" : "var(--negative)",
                            }}
                          >
                            {upside >= 0 ? "+" : ""}
                            {upside.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {rec.reason}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          Confidence:
                        </span>
                        <div
                          className="flex-1 h-1 rounded-full overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${rec.confidence}%`,
                              background: "var(--accent-cyan)",
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
                          {rec.confidence}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface AdvisoryItem {
  id: string;
  title: string;
  summary: string;
  impact: "Bullish" | "Bearish" | "Neutral";
  impactScore: number;
  affectedStocks: string[];
  affectedSectors: string[];
  region: string;
  timestamp: string;
  source: string;
  category: "Geopolitical" | "Economic" | "Earnings" | "Policy" | "Natural Disaster" | "Technology";
}

export const advisoryItems: AdvisoryItem[] = [
  {
    id: "1",
    title: "US Federal Reserve Signals Potential Rate Cut in September",
    summary: "Fed Chair indicated that inflation data is moving in the right direction, opening the door for a potential 25bps rate cut. Markets are pricing in a 78% probability of a cut.",
    impact: "Bullish",
    impactScore: 8.5,
    affectedStocks: ["AAPL", "MSFT", "AMZN", "TSLA"],
    affectedSectors: ["Technology", "Real Estate", "Consumer Discretionary"],
    region: "Global",
    timestamp: "2 hours ago",
    source: "Federal Reserve",
    category: "Policy",
  },
  {
    id: "2",
    title: "China Announces New Stimulus Package for Tech Sector",
    summary: "Beijing unveiled a ¥500 billion stimulus targeting semiconductor and AI companies. Hong Kong and Shanghai markets surged on the news. Export restrictions remain a concern.",
    impact: "Bullish",
    impactScore: 7.2,
    affectedStocks: ["9988", "NVDA", "ASML"],
    affectedSectors: ["Technology", "Semiconductors"],
    region: "Asia-Pacific",
    timestamp: "4 hours ago",
    source: "State Council of China",
    category: "Policy",
  },
  {
    id: "3",
    title: "OPEC+ Extends Production Cuts Through Q4 2025",
    summary: "Saudi Arabia leads OPEC+ in extending voluntary output cuts of 2.2M barrels/day. Brent crude jumped 3.4% on the announcement. Energy stocks globally rallied.",
    impact: "Bearish",
    impactScore: 6.8,
    affectedStocks: ["SHEL", "RELIANCE"],
    affectedSectors: ["Energy", "Transportation", "Airlines"],
    region: "Global",
    timestamp: "6 hours ago",
    source: "OPEC Secretariat",
    category: "Geopolitical",
  },
  {
    id: "4",
    title: "India's GDP Growth Revised Upward to 7.2%",
    summary: "RBI revised India's FY26 GDP growth forecast from 6.8% to 7.2%, citing strong domestic demand and manufacturing output. Indian markets expected to outperform EM peers.",
    impact: "Bullish",
    impactScore: 7.8,
    affectedStocks: ["RELIANCE", "TCS", "INFY"],
    affectedSectors: ["Banking", "Technology", "Infrastructure"],
    region: "Asia-Pacific",
    timestamp: "8 hours ago",
    source: "Reserve Bank of India",
    category: "Economic",
  },
  {
    id: "5",
    title: "EU Antitrust Ruling Against Major Tech Companies",
    summary: "European Commission imposed €4.3B in fines on three US tech giants for anti-competitive practices. Companies plan to appeal. Could impact operating costs in the region.",
    impact: "Bearish",
    impactScore: 5.9,
    affectedStocks: ["AAPL", "MSFT", "AMZN"],
    affectedSectors: ["Technology"],
    region: "Europe",
    timestamp: "12 hours ago",
    source: "European Commission",
    category: "Policy",
  },
  {
    id: "6",
    title: "NVIDIA Reports Record Q3 Earnings, Beats Expectations",
    summary: "NVIDIA posted $35.1B in revenue, up 94% YoY, driven by data center AI chip demand. Guidance for Q4 also exceeded analyst estimates. AI capex cycle remains strong.",
    impact: "Bullish",
    impactScore: 9.1,
    affectedStocks: ["NVDA", "ASML", "MSFT", "AMZN"],
    affectedSectors: ["Technology", "Semiconductors", "Cloud Computing"],
    region: "Global",
    timestamp: "1 day ago",
    source: "NVIDIA Corp.",
    category: "Earnings",
  },
  {
    id: "7",
    title: "Japan Intervenes in Currency Markets as Yen Weakens",
    summary: "Bank of Japan conducted an estimated ¥3.5T intervention to support the yen after it breached 160 against the dollar. Japanese exporters could face margin pressure.",
    impact: "Neutral",
    impactScore: 6.2,
    affectedStocks: ["7203"],
    affectedSectors: ["Automotive", "Electronics", "Export-heavy"],
    region: "Asia-Pacific",
    timestamp: "1 day ago",
    source: "Bank of Japan",
    category: "Economic",
  },
  {
    id: "8",
    title: "Tensions Escalate in Middle East, Oil Supply Concerns Rise",
    summary: "Military conflict near the Strait of Hormuz raised concerns about oil supply disruptions. Defense stocks surged while airlines and logistics fell. VIX spiked 12%.",
    impact: "Bearish",
    impactScore: 8.3,
    affectedStocks: ["SHEL", "RELIANCE"],
    affectedSectors: ["Energy", "Defense", "Airlines", "Shipping"],
    region: "Global",
    timestamp: "2 days ago",
    source: "Reuters",
    category: "Geopolitical",
  },
  {
    id: "9",
    title: "European Central Bank Holds Rates Steady Amid Stubborn Services Inflation",
    summary: "ECB kept the deposit rate at 3.75%, citing strong wage growth. The decision was expected, but the lack of forward guidance caused short-term volatility in European equities.",
    impact: "Neutral",
    impactScore: 5.5,
    affectedStocks: ["DBK", "BNP"],
    affectedSectors: ["Banking", "Financials"],
    region: "Europe",
    timestamp: "7 days ago",
    source: "ECB Press Release",
    category: "Policy",
  },
  {
    id: "10",
    title: "Major Cybersecurity Incident Disrupts Global Travel and Banking",
    summary: "A faulty software update caused widespread IT outages globally, grounding flights and disrupting banking services. Affected cybersecurity stocks saw significant movement.",
    impact: "Bearish",
    impactScore: 8.9,
    affectedStocks: ["CRWD", "MSFT", "DAL"],
    affectedSectors: ["Technology", "Airlines", "Financials"],
    region: "Global",
    timestamp: "14 days ago",
    source: "Global News Outlets",
    category: "Technology",
  },
  {
    id: "11",
    title: "US Jobs Report Shows Unexpected Cooling in Labor Market",
    summary: "Nonfarm payrolls added only 114,000 jobs, below expectations of 175,000. Unemployment rate ticked up to 4.3%. The data sparked a brief market sell-off due to recession fears.",
    impact: "Bearish",
    impactScore: 7.5,
    affectedStocks: ["AAPL", "JPM", "XOM"],
    affectedSectors: ["Consumer Discretionary", "Financials", "Industrials"],
    region: "Americas",
    timestamp: "21 days ago",
    source: "Bureau of Labor Statistics",
    category: "Economic",
  },
  {
    id: "12",
    title: "BOJ Rate Hike Surprises Markets, Triggers Yen Carry Trade Unwind",
    summary: "Bank of Japan unexpectedly raised its benchmark interest rate to 0.25%. The move led to a sharp appreciation of the Yen and a global unwinding of carry trades, impacting global equities heavily.",
    impact: "Bearish",
    impactScore: 9.5,
    affectedStocks: ["7203", "NVDA", "AAPL"],
    affectedSectors: ["Automotive", "Technology", "Financials"],
    region: "Asia-Pacific",
    timestamp: "28 days ago",
    source: "Bank of Japan",
    category: "Policy",
  }
];

export interface SectorSentiment {
  sector: string;
  sentiment: "Bullish" | "Bearish" | "Neutral";
  score: number;
  change: number;
}

export const sectorSentiments: SectorSentiment[] = [
  { sector: "Technology", sentiment: "Bullish", score: 72, change: 5.3 },
  { sector: "Healthcare", sentiment: "Neutral", score: 51, change: -1.2 },
  { sector: "Energy", sentiment: "Bearish", score: 38, change: -8.7 },
  { sector: "Financials", sentiment: "Bullish", score: 65, change: 3.1 },
  { sector: "Consumer Disc.", sentiment: "Neutral", score: 48, change: 0.8 },
  { sector: "Industrials", sentiment: "Bullish", score: 61, change: 2.4 },
  { sector: "Real Estate", sentiment: "Bearish", score: 35, change: -4.5 },
  { sector: "Materials", sentiment: "Neutral", score: 52, change: 1.1 },
];

export interface StockRecommendation {
  ticker: string;
  name: string;
  action: "Buy" | "Hold" | "Avoid";
  reason: string;
  targetPrice: number;
  currentPrice: number;
  confidence: number;
}

export const recommendations: StockRecommendation[] = [
  { ticker: "NVDA", name: "NVIDIA Corp.", action: "Buy", reason: "AI demand accelerating; record earnings with strong forward guidance", targetPrice: 175.00, currentPrice: 145.23, confidence: 85 },
  { ticker: "RELIANCE", name: "Reliance Industries", action: "Buy", reason: "India GDP upgrade + Jio platform monetization accelerating", targetPrice: 3200.00, currentPrice: 2945.30, confidence: 78 },
  { ticker: "TSLA", name: "Tesla Inc.", action: "Hold", reason: "EV competition intensifying; robotaxi catalyst uncertain", targetPrice: 320.00, currentPrice: 312.45, confidence: 55 },
  { ticker: "9988", name: "Alibaba Group", action: "Avoid", reason: "Regulatory overhang persists despite stimulus package", targetPrice: 70.00, currentPrice: 82.45, confidence: 62 },
  { ticker: "ASML", name: "ASML Holding", action: "Buy", reason: "Monopoly on EUV lithography; AI chip demand driving orders", targetPrice: 1050.00, currentPrice: 924.50, confidence: 82 },
  { ticker: "SHEL", name: "Shell plc", action: "Hold", reason: "Oil price volatility; strong dividend but uncertain production outlook", targetPrice: 2800.00, currentPrice: 2734.50, confidence: 58 },
];

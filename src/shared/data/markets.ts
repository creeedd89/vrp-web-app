export interface MarketData {
  id: string;
  name: string;
  exchange: string;
  country: string;
  region: "Americas" | "Europe" | "Asia-Pacific";
  flag: string;
  index: string;
  indexValue: number;
  indexChange: number;
  vrp: number;
  vrpChange: number;
  impliedVol: number;
  realizedVol: number;
  riskScore: number;
  trend: number[];
}

export const globalMarkets: MarketData[] = [
  {
    id: "nyse",
    name: "New York Stock Exchange",
    exchange: "NYSE",
    country: "United States",
    region: "Americas",
    flag: "🇺🇸",
    index: "S&P 500",
    indexValue: 5842.31,
    indexChange: 0.72,
    vrp: 4.23,
    vrpChange: 0.31,
    impliedVol: 18.45,
    realizedVol: 14.22,
    riskScore: 32,
    trend: [3.8, 4.1, 3.9, 4.5, 4.2, 3.7, 4.0, 4.3, 3.9, 4.1, 4.5, 4.23],
  },
  {
    id: "nasdaq",
    name: "NASDAQ",
    exchange: "NASDAQ",
    country: "United States",
    region: "Americas",
    flag: "🇺🇸",
    index: "NASDAQ 100",
    indexValue: 20891.74,
    indexChange: 1.15,
    vrp: 5.67,
    vrpChange: 0.89,
    impliedVol: 22.31,
    realizedVol: 16.64,
    riskScore: 45,
    trend: [5.1, 5.3, 4.9, 5.8, 5.5, 5.2, 5.9, 6.1, 5.4, 5.7, 5.3, 5.67],
  },
  {
    id: "nse",
    name: "National Stock Exchange",
    exchange: "NSE",
    country: "India",
    region: "Asia-Pacific",
    flag: "🇮🇳",
    index: "NIFTY 50",
    indexValue: 24782.45,
    indexChange: -0.34,
    vrp: 3.89,
    vrpChange: -0.21,
    impliedVol: 15.67,
    realizedVol: 11.78,
    riskScore: 28,
    trend: [3.5, 3.7, 4.1, 3.9, 3.6, 4.0, 3.8, 3.5, 3.9, 4.2, 3.7, 3.89],
  },
  {
    id: "bse",
    name: "Bombay Stock Exchange",
    exchange: "BSE",
    country: "India",
    region: "Asia-Pacific",
    flag: "🇮🇳",
    index: "SENSEX",
    indexValue: 81247.63,
    indexChange: -0.28,
    vrp: 3.72,
    vrpChange: -0.15,
    impliedVol: 15.12,
    realizedVol: 11.40,
    riskScore: 26,
    trend: [3.4, 3.6, 3.9, 3.7, 3.5, 3.8, 3.6, 3.3, 3.7, 4.0, 3.5, 3.72],
  },
  {
    id: "lse",
    name: "London Stock Exchange",
    exchange: "LSE",
    country: "United Kingdom",
    region: "Europe",
    flag: "🇬🇧",
    index: "FTSE 100",
    indexValue: 8412.56,
    indexChange: 0.18,
    vrp: 2.94,
    vrpChange: 0.12,
    impliedVol: 13.89,
    realizedVol: 10.95,
    riskScore: 22,
    trend: [2.7, 2.9, 3.1, 2.8, 3.0, 2.6, 2.9, 3.2, 2.8, 3.0, 2.7, 2.94],
  },
  {
    id: "tse",
    name: "Tokyo Stock Exchange",
    exchange: "TSE",
    country: "Japan",
    region: "Asia-Pacific",
    flag: "🇯🇵",
    index: "Nikkei 225",
    indexValue: 39421.87,
    indexChange: 0.56,
    vrp: 4.56,
    vrpChange: 0.44,
    impliedVol: 19.23,
    realizedVol: 14.67,
    riskScore: 38,
    trend: [4.2, 4.0, 4.5, 4.3, 4.8, 4.1, 4.6, 4.4, 4.7, 4.2, 4.8, 4.56],
  },
  {
    id: "hkex",
    name: "Hong Kong Stock Exchange",
    exchange: "HKEX",
    country: "Hong Kong",
    region: "Asia-Pacific",
    flag: "🇭🇰",
    index: "Hang Seng",
    indexValue: 19823.45,
    indexChange: -1.23,
    vrp: 6.12,
    vrpChange: -0.67,
    impliedVol: 24.56,
    realizedVol: 18.44,
    riskScore: 58,
    trend: [5.8, 6.2, 5.5, 6.8, 6.1, 5.9, 6.5, 6.3, 5.7, 6.4, 5.9, 6.12],
  },
  {
    id: "sse",
    name: "Shanghai Stock Exchange",
    exchange: "SSE",
    country: "China",
    region: "Asia-Pacific",
    flag: "🇨🇳",
    index: "SSE Composite",
    indexValue: 3245.78,
    indexChange: -0.89,
    vrp: 5.34,
    vrpChange: -0.45,
    impliedVol: 21.89,
    realizedVol: 16.55,
    riskScore: 52,
    trend: [5.0, 5.3, 4.8, 5.6, 5.2, 4.9, 5.5, 5.1, 5.7, 5.0, 5.6, 5.34],
  },
  {
    id: "euronext",
    name: "Euronext",
    exchange: "ENX",
    country: "European Union",
    region: "Europe",
    flag: "🇪🇺",
    index: "EURO STOXX 50",
    indexValue: 4912.34,
    indexChange: 0.42,
    vrp: 3.21,
    vrpChange: 0.18,
    impliedVol: 14.56,
    realizedVol: 11.35,
    riskScore: 25,
    trend: [3.0, 3.2, 2.9, 3.4, 3.1, 2.8, 3.3, 3.0, 3.5, 3.1, 3.4, 3.21],
  },
  {
    id: "asx",
    name: "Australian Securities Exchange",
    exchange: "ASX",
    country: "Australia",
    region: "Asia-Pacific",
    flag: "🇦🇺",
    index: "ASX 200",
    indexValue: 8134.21,
    indexChange: 0.31,
    vrp: 2.78,
    vrpChange: 0.09,
    impliedVol: 12.45,
    realizedVol: 9.67,
    riskScore: 18,
    trend: [2.5, 2.7, 2.9, 2.6, 2.8, 2.4, 2.7, 2.9, 2.6, 2.8, 2.5, 2.78],
  },
];

export interface VRPHistoryPoint {
  date: string;
  dateString: string;
  vrp: number;
  impliedVol: number;
  realizedVol: number;
}

export function generateVRPHistory(days: number): VRPHistoryPoint[] {
  const data: VRPHistoryPoint[] = [];
  const now = new Date();
  let vrp = 3.5;
  let impliedVol = 16.0;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    vrp += (Math.random() - 0.48) * 0.6;
    vrp = Math.max(1.5, Math.min(8, vrp));
    impliedVol += (Math.random() - 0.48) * 1.2;
    impliedVol = Math.max(10, Math.min(30, impliedVol));
    const realizedVol = impliedVol - vrp;
    
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      dateString: `${yyyy}-${mm}-${dd}`,
      vrp: parseFloat(vrp.toFixed(2)),
      impliedVol: parseFloat(impliedVol.toFixed(2)),
      realizedVol: parseFloat(realizedVol.toFixed(2)),
    });
  }
  return data;
}

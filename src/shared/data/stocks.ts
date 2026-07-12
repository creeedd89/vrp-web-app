export interface StockData {
  ticker: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  vrp: number;
  vrpChange: number;
  impliedVol: number;
  realizedVol: number;
  optionPremium: number;
  riskScore: number;
  sector: string;
  marketCap: string;
}

export const topStocks: StockData[] = [
  { ticker: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", price: 234.56, change: 3.21, changePercent: 1.39, vrp: 4.12, vrpChange: 0.34, impliedVol: 19.23, realizedVol: 15.11, optionPremium: 8.45, riskScore: 28, sector: "Technology", marketCap: "$3.6T" },
  { ticker: "MSFT", name: "Microsoft Corp.", exchange: "NASDAQ", price: 467.89, change: -2.34, changePercent: -0.50, vrp: 3.67, vrpChange: -0.12, impliedVol: 17.89, realizedVol: 14.22, optionPremium: 12.30, riskScore: 22, sector: "Technology", marketCap: "$3.5T" },
  { ticker: "NVDA", name: "NVIDIA Corp.", exchange: "NASDAQ", price: 145.23, change: 7.89, changePercent: 5.75, vrp: 8.45, vrpChange: 1.23, impliedVol: 42.67, realizedVol: 34.22, optionPremium: 15.60, riskScore: 72, sector: "Technology", marketCap: "$3.6T" },
  { ticker: "RELIANCE", name: "Reliance Industries", exchange: "NSE", price: 2945.30, change: -12.45, changePercent: -0.42, vrp: 3.21, vrpChange: -0.08, impliedVol: 14.56, realizedVol: 11.35, optionPremium: 65.20, riskScore: 24, sector: "Energy", marketCap: "₹19.9T" },
  { ticker: "TCS", name: "Tata Consultancy Services", exchange: "NSE", price: 3876.50, change: 23.10, changePercent: 0.60, vrp: 2.89, vrpChange: 0.15, impliedVol: 12.34, realizedVol: 9.45, optionPremium: 78.90, riskScore: 18, sector: "Technology", marketCap: "₹14.1T" },
  { ticker: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", price: 312.45, change: 15.67, changePercent: 5.28, vrp: 9.87, vrpChange: 2.34, impliedVol: 52.34, realizedVol: 42.47, optionPremium: 22.10, riskScore: 82, sector: "Automotive", marketCap: "$1.0T" },
  { ticker: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", price: 198.34, change: 1.23, changePercent: 0.62, vrp: 4.56, vrpChange: 0.28, impliedVol: 21.45, realizedVol: 16.89, optionPremium: 9.80, riskScore: 35, sector: "Consumer", marketCap: "$2.1T" },
  { ticker: "INFY", name: "Infosys Limited", exchange: "NSE", price: 1567.80, change: -8.90, changePercent: -0.56, vrp: 2.45, vrpChange: -0.11, impliedVol: 11.23, realizedVol: 8.78, optionPremium: 34.50, riskScore: 16, sector: "Technology", marketCap: "₹6.5T" },
  { ticker: "SHEL", name: "Shell plc", exchange: "LSE", price: 2734.50, change: 18.30, changePercent: 0.67, vrp: 3.12, vrpChange: 0.19, impliedVol: 15.67, realizedVol: 12.55, optionPremium: 45.60, riskScore: 30, sector: "Energy", marketCap: "£168B" },
  { ticker: "7203", name: "Toyota Motor Corp.", exchange: "TSE", price: 2845.00, change: 35.00, changePercent: 1.25, vrp: 3.78, vrpChange: 0.22, impliedVol: 16.45, realizedVol: 12.67, optionPremium: 120.00, riskScore: 26, sector: "Automotive", marketCap: "¥46.4T" },
  { ticker: "9988", name: "Alibaba Group", exchange: "HKEX", price: 82.45, change: -3.67, changePercent: -4.26, vrp: 7.89, vrpChange: -1.45, impliedVol: 38.90, realizedVol: 31.01, optionPremium: 5.30, riskScore: 68, sector: "Technology", marketCap: "HK$1.6T" },
  { ticker: "ASML", name: "ASML Holding", exchange: "ENX", price: 924.50, change: 12.30, changePercent: 1.35, vrp: 5.23, vrpChange: 0.67, impliedVol: 28.90, realizedVol: 23.67, optionPremium: 42.80, riskScore: 45, sector: "Technology", marketCap: "€362B" },
];

export interface PremiumOption {
  model: string;
  premium: number;
  impliedVol: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  recommendation: "Best Value" | "Market Rate" | "Overpriced";
}

export const premiumComparisons: PremiumOption[] = [
  { model: "Black-Scholes", premium: 8.45, impliedVol: 19.23, delta: 0.52, gamma: 0.034, theta: -0.12, vega: 0.18, recommendation: "Market Rate" },
  { model: "Binomial Tree", premium: 8.12, impliedVol: 18.89, delta: 0.51, gamma: 0.033, theta: -0.11, vega: 0.17, recommendation: "Best Value" },
  { model: "Monte Carlo", premium: 8.67, impliedVol: 19.56, delta: 0.53, gamma: 0.035, theta: -0.13, vega: 0.19, recommendation: "Overpriced" },
  { model: "Heston Model", premium: 8.34, impliedVol: 19.12, delta: 0.52, gamma: 0.034, theta: -0.12, vega: 0.18, recommendation: "Best Value" },
  { model: "SABR Model", premium: 8.56, impliedVol: 19.45, delta: 0.53, gamma: 0.035, theta: -0.12, vega: 0.19, recommendation: "Market Rate" },
];

export interface ReturnDistribution {
  range: string;
  probability: number;
  isTail: boolean;
}

export const returnDistribution: ReturnDistribution[] = [
  { range: "<-15%", probability: 1.2, isTail: true },
  { range: "-15 to -10%", probability: 2.8, isTail: true },
  { range: "-10 to -5%", probability: 6.5, isTail: false },
  { range: "-5 to -2%", probability: 12.3, isTail: false },
  { range: "-2 to 0%", probability: 18.7, isTail: false },
  { range: "0 to 2%", probability: 22.1, isTail: false },
  { range: "2 to 5%", probability: 17.8, isTail: false },
  { range: "5 to 10%", probability: 11.4, isTail: false },
  { range: "10 to 15%", probability: 4.9, isTail: false },
  { range: ">15%", probability: 2.3, isTail: true },
];

export interface DrawdownEvent {
  date: string;
  event: string;
  drawdown: number;
  recovery: string;
}

export const historicalDrawdowns: DrawdownEvent[] = [
  { date: "Mar 2020", event: "COVID-19 Crash", drawdown: -33.9, recovery: "5 months" },
  { date: "Dec 2018", event: "Fed Rate Hike Selloff", drawdown: -19.8, recovery: "3 months" },
  { date: "Feb 2018", event: "Volatility Spike", drawdown: -10.2, recovery: "6 months" },
  { date: "Aug 2015", event: "China Devaluation", drawdown: -12.4, recovery: "4 months" },
  { date: "Jun 2022", event: "Inflation Shock", drawdown: -23.6, recovery: "8 months" },
  { date: "Oct 2023", event: "Bond Yield Surge", drawdown: -10.3, recovery: "2 months" },
];

export interface RiskFactor {
  name: string;
  impact: "High" | "Medium" | "Low";
  category: "Earnings" | "Geopolitical" | "Macro" | "Sector" | "Technical";
  description: string;
}

export const currentRiskFactors: RiskFactor[] = [
  { name: "US Fed Rate Decision", impact: "High", category: "Macro", description: "Upcoming FOMC meeting could signal policy shift" },
  { name: "Earnings Season", impact: "High", category: "Earnings", description: "Q2 results starting next week for mega-caps" },
  { name: "China-Taiwan Tensions", impact: "Medium", category: "Geopolitical", description: "Increased military activity in the strait" },
  { name: "Oil Price Volatility", impact: "Medium", category: "Sector", description: "OPEC+ production cut uncertainty" },
  { name: "AI Sector Rotation", impact: "High", category: "Technical", description: "Money flowing from AI into value stocks" },
  { name: "India Election Impact", impact: "Low", category: "Geopolitical", description: "Post-election policy clarity improving sentiment" },
];

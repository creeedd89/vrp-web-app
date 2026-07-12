import { NextResponse } from "next/server";
import { generateOptionsChain, OptionContract } from "@/shared/data/mockOptionsChain";
import { NseIndia } from "stock-nse-india";

const nseIndia = new NseIndia();

// Simple in-memory cache to avoid burning API credits
const cache: Record<string, { data: OptionContract[]; timestamp: number; source: string }> = {};
const CACHE_TTL_MS = 10_000; // 10 seconds


function getMockFallback(symbol: string) {
  // Generate mock data around a realistic price for the given symbol
  const mockPrices: Record<string, number> = {
    SPY: 560, AAPL: 315, TSLA: 280, NVDA: 140, MSFT: 450,
    AMZN: 210, GOOGL: 195, META: 640, NFLX: 1050, AMD: 170,
    "RELIANCE.NS": 2900, "TCS.NS": 4000, "INFY.NS": 1400, "HDFCBANK.NS": 1600,
  };
  const price = mockPrices[symbol] || 400;
  const mockChain = generateOptionsChain(price, 16);
  return mockChain;
}

async function fetchNSEData(symbol: string): Promise<OptionContract[]> {
  const rawSymbol = symbol.replace('.NS', '');
  console.log(`[NSE Router] Fetching data for ${rawSymbol}...`);
  
  try {
    const optionChain = await nseIndia.getEquityOptionChain(rawSymbol);
    
    if (!optionChain || !optionChain.data) {
      throw new Error("Invalid data format from NSE API");
    }

    const contracts: OptionContract[] = [];
    
    optionChain.data.forEach((record: any) => {
      // Process Call
      if (record.optionType === 'CE' || record.CE) {
        const ce = record.CE || record; // Sometimes it's nested, sometimes flat
        if (ce.optionType !== 'CE') return; // Skip if flat but not CE

        const expDate = new Date(ce.expiryDate);
        const now = new Date();
        const diffTime = Math.abs(expDate.getTime() - now.getTime());
        const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const impliedVol = ce.impliedVolatility || 0;
        const realizedVol = 15; // Placeholder
        const vrp = impliedVol - realizedVol;

        contracts.push({
          id: `CALL-${ce.strikePrice}-${daysToExpiry}D`,
          strike: typeof ce.strikePrice === 'string' ? parseFloat(ce.strikePrice.trim()) : ce.strikePrice,
          type: "CALL",
          expiration: ce.expiryDate,
          daysToExpiry,
          bid: ce.bidprice || 0,
          ask: ce.askPrice || 0,
          lastPrice: ce.lastPrice || 0,
          volume: ce.totalTradedVolume || 0,
          openInterest: ce.openInterest || 0,
          impliedVol: parseFloat(impliedVol.toFixed(2)),
          realizedVol,
          vrp: parseFloat(vrp.toFixed(2)),
          delta: 0,
          gamma: 0,
          theta: 0,
          vega: 0,
        });
      }

      // Process Put
      if (record.optionType === 'PE' || record.PE) {
        const pe = record.PE || record;
        if (pe.optionType !== 'PE') return;

        const expDate = new Date(pe.expiryDate);
        const now = new Date();
        const diffTime = Math.abs(pe.expiryDate ? expDate.getTime() - now.getTime() : 0);
        const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const impliedVol = pe.impliedVolatility || 0;
        const realizedVol = 15; // Placeholder
        const vrp = impliedVol - realizedVol;

        contracts.push({
          id: `PUT-${pe.strikePrice}-${daysToExpiry}D`,
          strike: typeof pe.strikePrice === 'string' ? parseFloat(pe.strikePrice.trim()) : pe.strikePrice,
          type: "PUT",
          expiration: pe.expiryDate,
          daysToExpiry,
          bid: pe.bidprice || 0,
          ask: pe.askPrice || 0,
          lastPrice: pe.lastPrice || 0,
          volume: pe.totalTradedVolume || 0,
          openInterest: pe.openInterest || 0,
          impliedVol: parseFloat(impliedVol.toFixed(2)),
          realizedVol,
          vrp: parseFloat(vrp.toFixed(2)),
          delta: 0,
          gamma: 0,
          theta: 0,
          vega: 0,
        });
      }
    });

    return contracts;
  } catch (error) {
    console.error(`[NSE Router] Error fetching from NSE:`, error);
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "SPY").toUpperCase();

  // Check if we should use mock data (e.g., local dev without API key)
  if (process.env.USE_MOCK_DATA === "true") {
    return NextResponse.json({ data: getMockFallback(symbol), source: "mock" });
  }

  // Check in-memory cache first
  const cached = cache[symbol];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ data: cached.data, source: cached.source });
  }

  try {
    // Branch for Indian Equities (.NS)
    if (symbol.endsWith('.NS')) {
      const contracts = await fetchNSEData(symbol);
      cache[symbol] = { data: contracts, timestamp: Date.now(), source: "nse" };
      return NextResponse.json({ data: contracts, source: "nse" });
    }

    // Branch for US Equities (MarketData.app)
    const apiKey = process.env.MARKETDATA_API_TOKEN;
    const headers: HeadersInit = {};
    if (apiKey && apiKey.trim().length > 0) {
      headers["Authorization"] = `Bearer ${apiKey.trim()}`;
    }

    const response = await fetch(
      `https://api.marketdata.app/v1/options/chain/${encodeURIComponent(symbol)}`,
      { headers, cache: "no-store" }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`MarketData API [${response.status}] for ${symbol}: ${errorText}`);
      const fallback = getMockFallback(symbol);
      return NextResponse.json({
        data: fallback,
        source: "mock",
        warning: `Live data unavailable for ${symbol} (API returned ${response.status}). Showing simulated data. Add your free API token in .env.local to enable live data for all tickers.`,
      });
    }

    const data = await response.json();

    if (data.s !== "ok" || !data.strike) {
      const fallback = getMockFallback(symbol);
      return NextResponse.json({
        data: fallback,
        source: "mock",
        warning: "Invalid response from API. Showing simulated data.",
      });
    }

    const contracts: OptionContract[] = [];

    // MarketData.app returns column arrays, we zip them into row objects
    for (let i = 0; i < data.strike.length; i++) {
      const strike = data.strike[i];
      const type = data.side[i] === "call" ? "CALL" : "PUT";
      
      const expDate = new Date(data.expiration[i] * 1000);
      const expirationString = expDate.toISOString().split("T")[0];
      
      const now = new Date();
      const diffTime = Math.abs(expDate.getTime() - now.getTime());
      const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const impliedVol = (data.iv[i] || 0) * 100;
      const realizedVol = 15; // Placeholder — will be replaced with historical vol calculation
      const vrp = impliedVol - realizedVol;

      contracts.push({
        id: `${type}-${strike}-${daysToExpiry}D`,
        strike,
        type: type as "CALL" | "PUT",
        expiration: expirationString,
        daysToExpiry,
        bid: data.bid[i] || 0,
        ask: data.ask[i] || 0,
        lastPrice: data.last[i] || 0,
        volume: data.volume[i] || 0,
        openInterest: data.openInterest[i] || 0,
        impliedVol: parseFloat(impliedVol.toFixed(2)),
        realizedVol,
        vrp: parseFloat(vrp.toFixed(2)),
        delta: parseFloat((data.delta[i] || 0).toFixed(2)),
        gamma: parseFloat((data.gamma[i] || 0).toFixed(3)),
        theta: parseFloat((data.theta[i] || 0).toFixed(3)),
        vega: parseFloat((data.vega[i] || 0).toFixed(3)),
      });
    }

    // Store in cache
    cache[symbol] = { data: contracts, timestamp: Date.now(), source: "live" };

    return NextResponse.json({ data: contracts, source: "live" });

  } catch (error: any) {
    console.error("Option Chain Fetch Error:", error);
    // Fall back to mock data on network errors too
    const fallback = getMockFallback(symbol);
    return NextResponse.json({
      data: fallback,
      source: "mock",
      warning: "Network error reaching API. Showing simulated data.",
    });
  }
}

import { NextResponse } from 'next/server';
import { generateOptionsChain, OptionContract } from '@/shared/data/mockOptionsChain';
import { NseIndia, type EquityOptionChainItem, type OptionsDetails } from 'stock-nse-india';
import { calculateRealizedVol } from '@/shared/utils/realizedVol';
import { calculateGreeks } from '@/shared/utils/blackScholes';
import { normalizeMarketSymbol } from '@/shared/utils/marketSymbol';
import { prisma } from '@/lib/prisma';

const snapshotLastSavedAt: Record<string, number> = {};
const SNAPSHOT_INTERVAL_MS = 60_000;

async function saveSnapshot(symbol: string, contracts: OptionContract[]) {
  if (contracts.length === 0) return;

  const now = Date.now();
  if (now - (snapshotLastSavedAt[symbol] || 0) < SNAPSHOT_INTERVAL_MS) return;

  // Reserve the interval before the database write so concurrent requests do
  // not create duplicate points for the same minute.
  snapshotLastSavedAt[symbol] = now;

  // Calculate average IV and average VRP (excluding zero values)
  let validContracts = contracts.filter((c) => c.impliedVol > 0);
  if (validContracts.length === 0) validContracts = contracts; // fallback if all IVs are 0 out-of-hours

  const avgIV = validContracts.reduce((sum, c) => sum + c.impliedVol, 0) / validContracts.length;
  const avgVRP = validContracts.reduce((sum, c) => sum + c.vrp, 0) / validContracts.length;

  const calls = contracts
    .filter((c) => c.type === 'CALL')
    .reduce((sum, c) => sum + (c.volume || 0), 0);
  const puts = contracts
    .filter((c) => c.type === 'PUT')
    .reduce((sum, c) => sum + (c.volume || 0), 0);
  const putCallRatio = calls > 0 ? puts / calls : 1;

  try {
    await prisma.chainSnapshot.create({
      data: {
        symbol,
        avgIV,
        avgVRP,
        putCallRatio,
      },
    });
  } catch (error) {
    delete snapshotLastSavedAt[symbol];
    console.error('[Snapshot Error]:', error);
  }
}

const nseIndia = new NseIndia();

// Simple in-memory cache to avoid burning API credits
const cache: Record<string, { data: OptionContract[]; timestamp: number; source: string }> = {};
const CACHE_TTL_MS = 10_000; // 10 seconds

type NseOptionRecord = EquityOptionChainItem & {
  CE?: OptionsDetails;
  PE?: OptionsDetails;
};

type NseOptionLeg = {
  optionType: string | null;
  expiryDate: string | null;
  strikePrice: string | number;
  underlyingValue: number;
  impliedVolatility?: number;
  bidprice?: number;
  askPrice?: number;
  lastPrice: number;
  totalTradedVolume: number;
  openInterest: number;
};

function getMockFallback(symbol: string) {
  // Generate mock data around a realistic price for the given symbol
  const mockPrices: Record<string, number> = {
    SPY: 560,
    AAPL: 315,
    TSLA: 280,
    NVDA: 140,
    MSFT: 450,
    AMZN: 210,
    GOOGL: 195,
    META: 640,
    NFLX: 1050,
    AMD: 170,
    'RELIANCE.NS': 2900,
    'TCS.NS': 4000,
    'INFY.NS': 1400,
    'HDFCBANK.NS': 1600,
  };
  const price = mockPrices[symbol] || 400;
  const mockChain = generateOptionsChain(price, 16);
  return mockChain;
}

async function fetchNSEData(symbol: string, realizedVol: number): Promise<OptionContract[]> {
  const rawSymbol = symbol.replace('.NS', '');
  console.log(`[NSE Router] Fetching data for ${rawSymbol}...`);

  try {
    const optionChain = await nseIndia.getEquityOptionChain(rawSymbol);

    if (!optionChain || !optionChain.data) {
      throw new Error('Invalid data format from NSE API');
    }

    const contracts: OptionContract[] = [];

    optionChain.data.forEach((record) => {
      const optionRecord = record as NseOptionRecord;
      // Process Call
      if (optionRecord.optionType === 'CE' || optionRecord.CE) {
        const ce = (optionRecord.CE || optionRecord) as NseOptionLeg; // Sometimes it's nested, sometimes flat
        if (ce.optionType !== 'CE') return; // Skip if flat but not CE
        if (!ce.expiryDate) return;

        const expDate = new Date(ce.expiryDate);
        const now = new Date();
        const diffTime = expDate.getTime() - now.getTime();
        if (!Number.isFinite(diffTime) || diffTime <= 0) return;
        const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const strike =
          typeof ce.strikePrice === 'string' ? parseFloat(ce.strikePrice.trim()) : ce.strikePrice;
        const S0 = ce.underlyingValue || strike;

        let impliedVol = ce.impliedVolatility || 0;
        if (impliedVol <= 0) {
          const moneyness = strike / S0;
          const smileAdjust = Math.pow(Math.abs(1 - moneyness), 2) * 50;
          impliedVol = realizedVol + 2 + smileAdjust;
        }

        const vrp = impliedVol - realizedVol;
        const greeks = calculateGreeks(
          'CALL',
          S0,
          strike,
          daysToExpiry / 365.25,
          0.065,
          impliedVol / 100,
        );

        contracts.push({
          id: `CALL-${strike}-${daysToExpiry}D`,
          strike,
          type: 'CALL',
          expiration: ce.expiryDate,
          daysToExpiry,
          bid: ce.bidprice || 0,
          ask: ce.askPrice || 0,
          lastPrice: ce.lastPrice || 0,
          volume: ce.totalTradedVolume || 0,
          openInterest: ce.openInterest || 0,
          impliedVol: parseFloat(impliedVol.toFixed(2)),
          realizedVol: parseFloat(realizedVol.toFixed(2)),
          vrp: parseFloat(vrp.toFixed(2)),
          delta: parseFloat(greeks.delta.toFixed(3)),
          gamma: parseFloat(greeks.gamma.toFixed(4)),
          theta: parseFloat(greeks.theta.toFixed(3)),
          vega: parseFloat(greeks.vega.toFixed(3)),
        });
      }

      // Process Put
      if (optionRecord.optionType === 'PE' || optionRecord.PE) {
        const pe = (optionRecord.PE || optionRecord) as NseOptionLeg;
        if (pe.optionType !== 'PE') return;
        if (!pe.expiryDate) return;

        const expDate = new Date(pe.expiryDate);
        const now = new Date();
        const diffTime = expDate.getTime() - now.getTime();
        if (!Number.isFinite(diffTime) || diffTime <= 0) return;
        const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const strike =
          typeof pe.strikePrice === 'string' ? parseFloat(pe.strikePrice.trim()) : pe.strikePrice;
        const S0 = pe.underlyingValue || strike;

        let impliedVol = pe.impliedVolatility || 0;
        if (impliedVol <= 0) {
          const moneyness = S0 / strike;
          const smileAdjust = Math.pow(Math.abs(1 - moneyness), 2) * 50;
          impliedVol = realizedVol + 2 + smileAdjust;
        }

        const vrp = impliedVol - realizedVol;
        const greeks = calculateGreeks(
          'PUT',
          S0,
          strike,
          daysToExpiry / 365.25,
          0.065,
          impliedVol / 100,
        );

        contracts.push({
          id: `PUT-${strike}-${daysToExpiry}D`,
          strike,
          type: 'PUT',
          expiration: pe.expiryDate,
          daysToExpiry,
          bid: pe.bidprice || 0,
          ask: pe.askPrice || 0,
          lastPrice: pe.lastPrice || 0,
          volume: pe.totalTradedVolume || 0,
          openInterest: pe.openInterest || 0,
          impliedVol: parseFloat(impliedVol.toFixed(2)),
          realizedVol: parseFloat(realizedVol.toFixed(2)),
          vrp: parseFloat(vrp.toFixed(2)),
          delta: parseFloat(greeks.delta.toFixed(3)),
          gamma: parseFloat(greeks.gamma.toFixed(4)),
          theta: parseFloat(greeks.theta.toFixed(3)),
          vega: parseFloat(greeks.vega.toFixed(3)),
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
  const symbol = normalizeMarketSymbol(searchParams.get('symbol'));

  // Check if we should use mock data (e.g., local dev without API key)
  if (process.env.USE_MOCK_DATA === 'true') {
    const mockData = getMockFallback(symbol);
    saveSnapshot(symbol, mockData).catch(console.error);
    return NextResponse.json({ data: mockData, source: 'mock' });
  }

  // Check in-memory cache first
  const cached = cache[symbol];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ data: cached.data, source: cached.source });
  }

  try {
    // Branch for Indian Equities (.NS)
    if (symbol.endsWith('.NS')) {
      const realizedVol = await calculateRealizedVol(symbol, 30);
      try {
        const contracts = await fetchNSEData(symbol, realizedVol);
        cache[symbol] = { data: contracts, timestamp: Date.now(), source: 'nse' };
        await saveSnapshot(symbol, contracts);
        return NextResponse.json({ data: contracts, source: 'nse' });
      } catch (error) {
        console.warn(
          `[NSE Router] NSE API failed for ${symbol} (likely blocked by Vercel firewall), falling back to mock data.`,
          error,
        );
        const fallback = getMockFallback(symbol);
        cache[symbol] = { data: fallback, timestamp: Date.now(), source: 'mock' };
        saveSnapshot(symbol, fallback).catch(console.error);

        return NextResponse.json({
          data: fallback,
          source: 'mock',
          warning: `Live data temporarily unavailable for ${symbol} (NSE Firewall blocked the request). Showing simulated data.`,
        });
      }
    }

    // Branch for US Equities (MarketData.app)
    const apiKey = process.env.MARKETDATA_API_TOKEN;
    if (!apiKey || apiKey.trim().length === 0) {
      const fallback = getMockFallback(symbol);
      cache[symbol] = { data: fallback, timestamp: Date.now(), source: 'mock' };
      await saveSnapshot(symbol, fallback);
      return NextResponse.json({
        data: fallback,
        source: 'mock',
        warning:
          'Live US options require MARKETDATA_API_TOKEN. Showing simulated data until a token is configured.',
      });
    }

    const headers: HeadersInit = { Authorization: `Bearer ${apiKey.trim()}` };
    const realizedVol = await calculateRealizedVol(symbol, 30);

    const response = await fetch(
      `https://api.marketdata.app/v1/options/chain/${encodeURIComponent(symbol)}`,
      { headers, cache: 'no-store' },
    );

    if (response.status === 404) {
      return NextResponse.json({ error: `Ticker ${symbol} not found.` }, { status: 404 });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`MarketData API [${response.status}] for ${symbol}: ${errorText}`);
      const fallback = getMockFallback(symbol);
      return NextResponse.json({
        data: fallback,
        source: 'mock',
        warning: `Live data unavailable for ${symbol} (API returned ${response.status}). Showing simulated data. Add your free API token in .env.local to enable live data for all tickers.`,
      });
    }

    const data = await response.json();

    if (data.s !== 'ok' || !data.strike) {
      if (data.errmsg && data.errmsg.toLowerCase().includes('not found')) {
        return NextResponse.json({ error: `Ticker ${symbol} not found.` }, { status: 404 });
      }
      const fallback = getMockFallback(symbol);
      return NextResponse.json({
        data: fallback,
        source: 'mock',
        warning: 'Invalid response from API. Showing simulated data.',
      });
    }

    const contracts: OptionContract[] = [];

    // MarketData.app returns column arrays, we zip them into row objects
    for (let i = 0; i < data.strike.length; i++) {
      const strike = data.strike[i];
      const type = data.side[i] === 'call' ? 'CALL' : 'PUT';

      const expDate = new Date(data.expiration[i] * 1000);
      const expirationString = expDate.toISOString().split('T')[0];

      const now = new Date();
      const diffTime = Math.abs(expDate.getTime() - now.getTime());
      const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const impliedVol = (data.iv[i] || 0) * 100;
      const vrp = impliedVol - realizedVol;

      contracts.push({
        id: `${type}-${strike}-${daysToExpiry}D`,
        strike,
        type: type as 'CALL' | 'PUT',
        expiration: expirationString,
        daysToExpiry,
        bid: data.bid[i] || 0,
        ask: data.ask[i] || 0,
        lastPrice: data.last[i] || 0,
        volume: data.volume[i] || 0,
        openInterest: data.openInterest[i] || 0,
        impliedVol: parseFloat(impliedVol.toFixed(2)),
        realizedVol: parseFloat(realizedVol.toFixed(2)),
        vrp: parseFloat(vrp.toFixed(2)),
        delta: parseFloat((data.delta[i] || 0).toFixed(2)),
        gamma: parseFloat((data.gamma[i] || 0).toFixed(3)),
        theta: parseFloat((data.theta[i] || 0).toFixed(3)),
        vega: parseFloat((data.vega[i] || 0).toFixed(3)),
      });
    }

    // Store in cache
    cache[symbol] = { data: contracts, timestamp: Date.now(), source: 'live' };

    // Save snapshot in background without blocking response
    saveSnapshot(symbol, contracts).catch(console.error);

    return NextResponse.json({ data: contracts, source: 'live' });
  } catch (error) {
    console.error('Option Chain Fetch Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching options data.' },
      { status: 500 },
    );
  }
}

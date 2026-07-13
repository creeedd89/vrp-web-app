import yahooFinance from 'yahoo-finance2';

/**
 * Calculates the annualized realized volatility using close-to-close log returns.
 * Fetches historical data using yahoo-finance2.
 * 
 * @param symbol Ticker symbol (e.g., AAPL or RELIANCE.NS)
 * @param tradingDays Number of trading days to look back
 * @returns Annualized volatility as a percentage (e.g., 15.5)
 */
export async function calculateRealizedVol(symbol: string, tradingDays: number = 30): Promise<number> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    // Fetch a bit more calendar days to ensure we have enough trading days (weekends, holidays)
    startDate.setDate(startDate.getDate() - Math.ceil(tradingDays * 1.5));

    const result = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    }) as any[];

    if (!result || result.length < 2) {
      console.warn(`[RV Calc] Not enough historical data for ${symbol}. Using default 15%.`);
      return 15; // default fallback
    }

    // Take the last `tradingDays` records if we have more
    const data = result.slice(-tradingDays);

    const returns: number[] = [];
    for (let i = 1; i < data.length; i++) {
      const prevClose = data[i - 1].close;
      const currentClose = data[i].close;
      if (prevClose > 0 && currentClose > 0) {
        returns.push(Math.log(currentClose / prevClose));
      }
    }

    if (returns.length === 0) return 15;

    // Calculate sample standard deviation
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1 || 1);
    const stdDev = Math.sqrt(variance);

    // Annualize (assuming 252 trading days)
    const annualizedVol = stdDev * Math.sqrt(252);
    
    return annualizedVol * 100; // Return as percentage
  } catch (err) {
    console.error(`[RV Calc] Error calculating RV for ${symbol}:`, err);
    return 15; // Fallback
  }
}

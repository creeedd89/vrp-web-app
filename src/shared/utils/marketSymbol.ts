const SYMBOL_ALIASES: Record<string, string> = {
  APPLE: 'AAPL',
  'APPLE.': 'AAPL',
  APPL: 'AAPL',
};

/**
 * Converts common company-name inputs and known ticker typos to the exchange
 * symbol accepted by the market-data providers.
 */
export function normalizeMarketSymbol(value: string | null | undefined): string {
  const symbol = (value || 'SPY').trim().toUpperCase();
  return SYMBOL_ALIASES[symbol] || symbol;
}

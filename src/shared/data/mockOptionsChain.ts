export interface OptionContract {
  id: string;
  strike: number;
  type: "CALL" | "PUT";
  expiration: string;
  daysToExpiry: number;
  bid: number;
  ask: number;
  lastPrice: number;
  volume: number;
  openInterest: number;
  impliedVol: number;
  realizedVol: number;
  vrp: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

export function generateOptionsChain(
  underlyingPrice: number,
  realizedVol: number
): OptionContract[] {
  const expirations = [
    { days: 7, date: "2026-07-19" },
    { days: 30, date: "2026-08-11" },
    { days: 90, date: "2026-10-10" },
  ];

  const contracts: OptionContract[] = [];

  expirations.forEach((exp) => {
    // Generate strikes around the underlying price
    const strikeInterval = underlyingPrice > 1000 ? 50 : 5;
    const startStrike = Math.floor(underlyingPrice / strikeInterval) * strikeInterval - (strikeInterval * 5);
    
    for (let i = 0; i < 11; i++) {
      const strike = startStrike + i * strikeInterval;
      
      // Generate both Call and Put for this strike
      ["CALL", "PUT"].forEach((type) => {
        // Base IV revolves around realized vol but often has a premium (VRP)
        // OTM options typically have higher IV (volatility smile)
        const moneyness = type === "CALL" ? (strike / underlyingPrice) : (underlyingPrice / strike);
        const smileAdjust = Math.pow(Math.abs(1 - moneyness), 2) * 50; 
        
        // Random noise
        const noise = (Math.random() - 0.5) * 2;
        
        const impliedVol = realizedVol + 2 + smileAdjust + noise;
        const vrp = impliedVol - realizedVol;
        
        // Rough greeks based on moneyness (mocked for visual realism)
        const isITM = type === "CALL" ? strike < underlyingPrice : strike > underlyingPrice;
        let delta = isITM ? 0.8 : 0.2;
        if (Math.abs(strike - underlyingPrice) < strikeInterval) delta = 0.5; // ATM
        if (type === "PUT") delta = delta * -1;
        
        contracts.push({
          id: `${type}-${strike}-${exp.days}D`,
          strike,
          type: type as "CALL" | "PUT",
          expiration: exp.date,
          daysToExpiry: exp.days,
          bid: Math.max(0.1, (impliedVol / 10) - 0.2),
          ask: Math.max(0.1, (impliedVol / 10) + 0.2),
          lastPrice: Math.max(0.1, impliedVol / 10),
          volume: Math.floor(Math.random() * 5000),
          openInterest: Math.floor(Math.random() * 20000),
          impliedVol: parseFloat(impliedVol.toFixed(2)),
          realizedVol: parseFloat(realizedVol.toFixed(2)),
          vrp: parseFloat(vrp.toFixed(2)),
          delta: parseFloat(delta.toFixed(2)),
          gamma: parseFloat((0.05 - Math.abs(delta - 0.5) * 0.05).toFixed(3)),
          theta: parseFloat((-1 * (impliedVol / 100) / exp.days).toFixed(3)),
          vega: parseFloat((impliedVol / 50).toFixed(3)),
        });
      });
    }
  });

  return contracts;
}

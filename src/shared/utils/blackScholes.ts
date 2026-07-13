export function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804 * Math.exp((-x * x) / 2);
  const prob =
    d *
    t *
    (0.31938153 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  if (x > 0) return 1 - prob;
  return prob;
}

export function normalPDF(x: number): number {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

export interface BSGreeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

/**
 * Calculate Black-Scholes Greeks for a European option.
 * 
 * @param type "CALL" or "PUT"
 * @param S0 Current underlying price
 * @param K Strike price
 * @param T Time to expiration (in years)
 * @param r Risk-free interest rate (decimal, e.g. 0.05)
 * @param v Implied volatility (decimal, e.g. 0.25)
 * @returns BSGreeks
 */
export function calculateGreeks(
  type: "CALL" | "PUT",
  S0: number,
  K: number,
  T: number,
  r: number,
  v: number
): BSGreeks {
  // Edge case: if volatility or time is zero/negative
  if (v <= 0 || T <= 0) {
    return { delta: 0, gamma: 0, theta: 0, vega: 0 };
  }

  const d1 = (Math.log(S0 / K) + (r + (v * v) / 2) * T) / (v * Math.sqrt(T));
  const d2 = d1 - v * Math.sqrt(T);

  const pdf_d1 = normalPDF(d1);
  const cdf_d1 = normalCDF(d1);
  const cdf_d2 = normalCDF(d2);
  const cdf_minus_d1 = normalCDF(-d1);
  const cdf_minus_d2 = normalCDF(-d2);

  let delta: number, theta: number;
  
  const gamma = pdf_d1 / (S0 * v * Math.sqrt(T));
  const vega = S0 * pdf_d1 * Math.sqrt(T);

  if (type === "CALL") {
    delta = cdf_d1;
    // Theta is usually expressed in value decay per day
    theta = (-(S0 * pdf_d1 * v) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * cdf_d2) / 365.25;
  } else {
    delta = cdf_d1 - 1;
    theta = (-(S0 * pdf_d1 * v) / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * cdf_minus_d2) / 365.25;
  }

  return {
    delta,
    gamma,
    theta,
    vega: vega / 100 // change per 1% IV change
  };
}

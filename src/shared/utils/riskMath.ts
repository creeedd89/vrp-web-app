/**
 * Approximation of the cumulative normal distribution function N(x)
 * using the Abramowitz and Stegun formula (error < 1.5e-7)
 */
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

/**
 * Calculates the risk-neutral probability of the stock dropping by at least `dropThreshold` (e.g. 0.10 for 10%)
 * in `daysToExpiry` days, given the implied volatility.
 * 
 * Uses Black-Scholes N(-d2) probability calculation.
 */
export function calculateCrashProbability(
  impliedVolPercent: number,
  daysToExpiry: number = 30,
  dropThreshold: number = 0.10,
  riskFreeRate: number = 0.05
): number {
  // Convert percentage IV to decimal (e.g., 25.5 -> 0.255)
  // If the user inputs 0 IV (e.g., no data), avoid division by zero
  if (impliedVolPercent <= 0) return 0;
  const sigma = impliedVolPercent / 100;

  // Convert days to years
  const T = daysToExpiry / 365.25;

  // K is the threshold price (e.g. 10% drop means K = 0.9 * S0)
  // We can normalize S0 = 1, K = 1 - dropThreshold
  const S0 = 1;
  const K = 1 - dropThreshold;

  // Calculate d2
  const d1 = (Math.log(S0 / K) + (riskFreeRate + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  // The risk-neutral probability of S_T < K is N(-d2)
  const probability = normalCDF(-d2);

  return probability * 100; // Return as a percentage (e.g., 14.2)
}

/**
 * Generates a log-normal probability distribution for expected returns over a time window.
 * Used for the Risk Analyzer's bar chart.
 */
export function generateReturnDistribution(
  impliedVolPercent: number,
  daysToExpiry: number = 30
) {
  // If no data, return a flat or default distribution
  if (impliedVolPercent <= 0) impliedVolPercent = 15; // default fallback
  
  const sigma = impliedVolPercent / 100;
  const T = daysToExpiry / 365.25;

  // Expected mean return (risk-neutral drift)
  const drift = (0.05 - (sigma * sigma) / 2) * T;
  const stdDev = sigma * Math.sqrt(T);

  // We define ranges and calculate the area under the curve for each range.
  // The normal distribution is applied to log-returns.
  const getProb = (zScore1: number, zScore2: number) => {
    return (normalCDF(zScore2) - normalCDF(zScore1)) * 100;
  };

  // Z-scores boundaries mapped to roughly human readable % return ranges
  // Normalizing standard deviation units to % moves.
  
  // Calculate raw probabilities for these buckets based on normal CDF of log returns
  const getBucketProb = (lowerBoundPercent: number, upperBoundPercent: number) => {
    const lowerLog = Math.log(1 + lowerBoundPercent);
    const upperLog = Math.log(1 + upperBoundPercent);
    const z1 = (lowerLog - drift) / stdDev;
    const z2 = (upperLog - drift) / stdDev;
    return getProb(z1, z2);
  };

  const p_less_15 = getBucketProb(-0.99, -0.15);
  const p_m15_m10 = getBucketProb(-0.15, -0.10);
  const p_m10_m5 = getBucketProb(-0.10, -0.05);
  const p_m5_m2 = getBucketProb(-0.05, -0.02);
  const p_m2_0 = getBucketProb(-0.02, 0);
  const p_0_2 = getBucketProb(0, 0.02);
  const p_2_5 = getBucketProb(0.02, 0.05);
  const p_5_10 = getBucketProb(0.05, 0.10);
  const p_10_15 = getBucketProb(0.10, 0.15);
  const p_greater_15 = getBucketProb(0.15, 100);

  return [
    { range: "<-15%", probability: Number(p_less_15.toFixed(1)), isTail: true },
    { range: "-15 to -10%", probability: Number(p_m15_m10.toFixed(1)), isTail: true },
    { range: "-10 to -5%", probability: Number(p_m10_m5.toFixed(1)), isTail: false },
    { range: "-5 to -2%", probability: Number(p_m5_m2.toFixed(1)), isTail: false },
    { range: "-2 to 0%", probability: Number(p_m2_0.toFixed(1)), isTail: false },
    { range: "0 to 2%", probability: Number(p_0_2.toFixed(1)), isTail: false },
    { range: "2 to 5%", probability: Number(p_2_5.toFixed(1)), isTail: false },
    { range: "5 to 10%", probability: Number(p_5_10.toFixed(1)), isTail: false },
    { range: "10 to 15%", probability: Number(p_10_15.toFixed(1)), isTail: false },
    { range: ">15%", probability: Number(p_greater_15.toFixed(1)), isTail: true },
  ];
}

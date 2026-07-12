# Mathematics & Methodology

This document provides a rigorous explanation of every mathematical concept, formula, and assumption used in the VRP Global screener. It is intended for anyone who wants to understand exactly how the numbers on the screen are derived.

---

## Table of Contents

1. [Variance Risk Premium (VRP) — The Central Metric](#1-variance-risk-premium-vrp--the-central-metric)
2. [Implied Volatility (IV)](#2-implied-volatility-iv)
3. [Realized Volatility (RV)](#3-realized-volatility-rv)
4. [The Option Greeks](#4-the-option-greeks)
5. [Volatility Smile & Moneyness](#5-volatility-smile--moneyness)
6. [Mock Data Generation Model](#6-mock-data-generation-model)
7. [VRP Heatmap — Color Logic](#7-vrp-heatmap--color-logic)
8. [Data Pipeline & Transformations](#8-data-pipeline--transformations)
9. [Assumptions & Limitations](#9-assumptions--limitations)

---

## 1. Variance Risk Premium (VRP) — The Central Metric

### Definition

The Variance Risk Premium is the difference between what the options market *expects* volatility to be (implied) and what volatility *actually was* (realized):

```
VRP = IV − RV
```

Where:
- **IV** = Implied Volatility (annualized, in percentage points)
- **RV** = Realized Volatility (annualized, in percentage points)

### Interpretation

| VRP Value     | Color in UI | Meaning |
|---------------|-------------|---------|
| VRP > +5%     | 🟢 Green    | Options are **overpriced** relative to historical movement. Selling premium has a statistical edge. |
| 0% < VRP ≤ 5% | 🟡 Yellow   | Options are **fairly priced** — the premium is small or within noise. |
| VRP < 0%      | 🔴 Red      | Options are **underpriced** — the market expects *less* movement than history suggests. Buying options may have an edge. |

### Why This Matters

Academic research (Carr & Wu, 2009; Bollerslev, Tauchen & Zhou, 2009) has repeatedly shown that, on average, **IV > RV** in equity markets. This persistent positive spread is the Variance Risk Premium — the compensation that option sellers demand for bearing the risk that realized volatility might spike.

Our hypothesis: In retail-dominated markets like India's NSE, this premium is structurally wider because retail traders tend to overpay for options as speculative instruments, inflating IV beyond what institutional pricing models would suggest.

---

## 2. Implied Volatility (IV)

### What It Is

Implied Volatility is the market's consensus expectation of the future standard deviation of the underlying asset's returns over the life of the option. It is not directly observable — it is **backed out** from the observed market price of the option using a pricing model.

### How It Is Derived (Black-Scholes Framework)

The Black-Scholes formula for a European call option is:

```
C = S₀ · N(d₁) − K · e^(−rT) · N(d₂)
```

Where:
```
d₁ = [ln(S₀ / K) + (r + σ² / 2) · T] / (σ · √T)
d₂ = d₁ − σ · √T
```

| Symbol | Meaning |
|--------|---------|
| C      | Call option market price |
| S₀     | Current underlying price |
| K      | Strike price |
| r      | Risk-free interest rate |
| T      | Time to expiration (in years) |
| σ      | Volatility (this is IV when solved inversely) |
| N(·)   | Cumulative standard normal distribution |

**IV is the value of σ that makes the Black-Scholes price equal to the observed market price.** There is no closed-form solution for σ — it must be found numerically (e.g., Newton-Raphson iteration).

### Data Sources

| Source | IV Calculation |
|--------|---------------|
| **MarketData.app** (US) | IV is provided directly by the API in the `iv[]` array as a decimal (e.g., `0.25` = 25%). We multiply by 100 to convert to percentage. |
| **NSE India** | IV is provided directly in the `impliedVolatility` field as a percentage (e.g., `25.0` = 25%). No conversion needed. |
| **Mock/Simulated** | IV is generated synthetically (see Section 6). |

### Code Reference

**US equities** (`route.ts`, line 187):
```typescript
const impliedVol = (data.iv[i] || 0) * 100;  // Convert decimal → percentage
```

**NSE equities** (`route.ts`, line 48):
```typescript
const impliedVol = ce.impliedVolatility || 0; // Already in percentage
```

---

## 3. Realized Volatility (RV)

### What It Is

Realized Volatility (also called Historical Volatility) measures how much the underlying asset's price actually fluctuated over a past window. It is a backward-looking statistic.

### Standard Calculation (Close-to-Close)

Given a series of N+1 daily closing prices `P₀, P₁, ..., Pₙ`:

1. Compute logarithmic returns:
```
rᵢ = ln(Pᵢ / Pᵢ₋₁)    for i = 1, ..., N
```

2. Compute the sample standard deviation of returns:
```
σ_daily = √[ (1 / (N−1)) · Σᵢ (rᵢ − r̄)² ]
```
Where `r̄` is the mean of all `rᵢ`.

3. Annualize:
```
RV = σ_daily × √252
```

The factor `√252` converts from daily to annual volatility, based on the ~252 trading days in a year.

### Current Implementation — Placeholder

> ⚠️ **Important Assumption**: In the current version of the application, Realized Volatility is set to a **static placeholder value of 15%** for all tickers and all contracts.

```typescript
const realizedVol = 15; // Placeholder — will be replaced with historical vol calculation
```

This means the VRP values shown are:
```
VRP_displayed = IV_live − 15
```

This is a deliberate simplification for the initial release. The placeholder was chosen because:
- **15% is close to the long-run average annualized volatility** of broad US equity indices (the S&P 500 has a long-term average around 15–18%).
- It provides a consistent baseline that makes the VRP column immediately useful for comparing *relative* IV across contracts and markets.

### Planned Enhancement

In a future version, RV will be calculated dynamically using historical price data fetched from a data provider. The planned approach:
1. Fetch the most recent 30 daily closing prices for the underlying.
2. Compute the 30-day realized volatility using the close-to-close formula above.
3. Annualize with `√252`.

---

## 4. The Option Greeks

The Greeks measure the sensitivity of an option's price to various factors. They are essential risk management tools.

### 4.1 Delta (Δ)

**Definition:** The rate of change of the option price with respect to a $1 change in the underlying price.

```
Δ_call = N(d₁)
Δ_put  = N(d₁) − 1
```

| Delta Value | Meaning |
|-------------|---------|
| Δ ≈ +1.0 (call) | Deep in-the-money. Option moves ~$1 for every $1 move in stock. |
| Δ ≈ +0.5 (call) | At-the-money. 50/50 chance of expiring in the money. |
| Δ ≈ 0.0 | Far out-of-the-money. Very little sensitivity to stock movement. |
| Δ ≈ −0.5 (put) | At-the-money put. |
| Δ ≈ −1.0 (put) | Deep in-the-money put. |

**Data source:** For US equities, delta is provided directly by the MarketData.app API (`data.delta[i]`). For NSE equities, delta is currently set to `0` (not provided by the NSE API).

### 4.2 Gamma (Γ)

**Definition:** The rate of change of delta with respect to a $1 change in the underlying price. It measures the *curvature* of the option's price sensitivity.

```
Γ = N'(d₁) / (S₀ · σ · √T)
```

Where `N'(d₁)` is the standard normal probability density function evaluated at `d₁`.

| Gamma Value | Meaning |
|-------------|---------|
| High Γ     | Delta is changing rapidly — large risk if the stock moves. Common for ATM, short-dated options. |
| Low Γ      | Delta is stable — less risk from stock movement. Common for deep ITM/OTM or long-dated options. |

**Data source:** Provided by MarketData.app for US equities. Set to `0` for NSE equities.

### 4.3 Theta (Θ)

**Definition:** The rate of change of the option price with respect to the passage of one day (time decay).

```
Θ_call = −[S₀ · N'(d₁) · σ] / (2√T) − r · K · e^(−rT) · N(d₂)
```

Theta is almost always negative — options lose value as time passes (all else being equal).

**Data source:** Provided by MarketData.app. Set to `0` for NSE equities.

### 4.4 Vega (ν)

**Definition:** The rate of change of the option price with respect to a 1% change in implied volatility.

```
ν = S₀ · N'(d₁) · √T
```

Vega is always positive for both calls and puts — higher volatility means higher option prices.

**Data source:** Provided by MarketData.app. Set to `0` for NSE equities.

### Mock Greeks (Simulated Mode)

When using simulated data, the Greeks are approximated:

```typescript
// Delta: Simplified moneyness-based approximation
delta_call = strike < underlyingPrice ? 0.8  : 0.2   // ITM : OTM
delta_atm  = 0.5                                      // |strike - price| < interval
delta_put  = -1 × delta_call

// Gamma: Peaks at ATM, decreases as delta moves away from 0.5
gamma = 0.05 - |delta - 0.5| × 0.05

// Theta: Proportional to IV, inversely proportional to days to expiry
theta = -(IV / 100) / daysToExpiry

// Vega: Proportional to IV
vega = IV / 50
```

---

## 5. Volatility Smile & Moneyness

### Moneyness

Moneyness describes how far an option's strike is from the current underlying price:

```
Moneyness_call = Strike / Underlying Price
Moneyness_put  = Underlying Price / Strike
```

| Value | Description |
|-------|-------------|
| < 1.0 | In-the-money (ITM) |
| = 1.0 | At-the-money (ATM) |
| > 1.0 | Out-of-the-money (OTM) |

### The Volatility Smile

In real markets, IV is not constant across strikes. Instead, it forms a characteristic "smile" or "skew" pattern:

```
          IV
          ^
          |    ╲         ╱
          |      ╲     ╱
          |        ╲ ╱
          |         ·  ← ATM
          +------------------→ Strike
        Deep OTM    ATM    Deep OTM
```

Far OTM options (both calls and puts) tend to have higher IV than ATM options. This happens because:
1. **Demand for tail protection:** Institutional investors buy OTM puts for portfolio insurance, driving up their prices (and IV).
2. **Lottery-ticket demand:** Retail traders buy cheap OTM calls hoping for large payoffs, inflating their IV.

### Smile in Mock Data

Our mock data generator reproduces this pattern using a quadratic smile adjustment:

```typescript
const moneyness = type === "CALL"
  ? (strike / underlyingPrice)
  : (underlyingPrice / strike);

const smileAdjust = Math.pow(Math.abs(1 - moneyness), 2) * 50;
```

This means:
- **ATM options** (moneyness ≈ 1.0): `smileAdjust ≈ 0`
- **5% OTM** (moneyness ≈ 1.05): `smileAdjust ≈ 0.05² × 50 = 0.125%`
- **10% OTM** (moneyness ≈ 1.10): `smileAdjust ≈ 0.10² × 50 = 0.50%`
- **20% OTM** (moneyness ≈ 1.20): `smileAdjust ≈ 0.20² × 50 = 2.00%`

The final mock IV is:
```
IV = RV + 2% (base premium) + smileAdjust + noise
```
Where `noise ∈ [-1, +1]` is uniform random.

---

## 6. Mock Data Generation Model

When live data is unavailable, the screener generates realistic synthetic options chains. Here is the complete model:

### Strike Price Generation

```typescript
const strikeInterval = underlyingPrice > 1000 ? 50 : 5;
const startStrike = floor(underlyingPrice / strikeInterval) * strikeInterval - (strikeInterval × 5);
// Generates 11 strikes centered around the underlying price
```

For a stock at $315: strikes from $290 to $340 in $5 increments.
For a stock at ₹2900: strikes from ₹2650 to ₹3150 in ₹50 increments.

### Expiration Dates

Three standard tenors are generated:
- **7 days** — Weekly options
- **30 days** — Monthly options
- **90 days** — Quarterly options

### Bid/Ask Spread

```typescript
bid = max(0.1, (IV / 10) - 0.2)
ask = max(0.1, (IV / 10) + 0.2)
lastPrice = max(0.1, IV / 10)
```

The spread is a fixed $0.40 wide, centered on the last price. Options with higher IV are proportionally more expensive.

### Volume & Open Interest

```typescript
volume = floor(random() × 5000)       // 0 to 4,999
openInterest = floor(random() × 20000) // 0 to 19,999
```

Uniformly random. In production, these come from the live exchanges.

---

## 7. VRP Heatmap — Color Logic

The VRP column in the screener table uses a three-tier color-coding system to allow instant visual scanning:

```typescript
const vrpColor = contract.vrp > 5
  ? "var(--positive)"    // Green — strong premium
  : contract.vrp < 0
    ? "var(--negative)"  // Red — negative premium
    : "var(--warning)";  // Yellow — neutral zone
```

### Thresholds

| Condition   | Background | Border | Text Color | Signal |
|-------------|-----------|--------|------------|--------|
| VRP > +5%   | Green tint | Green  | Green      | **Sell premium** — options are expensive |
| 0% ≤ VRP ≤ 5% | Yellow tint | Yellow | Yellow   | **Neutral** — fair value zone |
| VRP < 0%    | Red tint  | Red    | Red        | **Buy premium** — options are cheap |

### Why +5% as the Threshold?

The +5% threshold was chosen because:
- The long-run average VRP for the S&P 500 is approximately **+3% to +5%** (Bollerslev et al., 2009).
- A VRP above +5% indicates that IV is meaningfully elevated relative to historical norms.
- This threshold balances sensitivity (catching real opportunities) with specificity (avoiding false signals from noise).

---

## 8. Data Pipeline & Transformations

### US Equities (MarketData.app)

The API returns columnar arrays. The transformation logic zips them into row objects:

```
API Response:
  strike: [100, 105, 110, ...]
  side:   ["call", "put", "call", ...]
  iv:     [0.25, 0.30, 0.22, ...]      ← decimal
  delta:  [0.85, -0.70, 0.55, ...]
  ...

Transformation:
  For each index i:
    type       = side[i] === "call" ? "CALL" : "PUT"
    impliedVol = iv[i] × 100                         ← to percentage
    daysToExp  = ceil(|expDate - now| / 86400000)     ← ms to days
    vrp        = impliedVol - 15                      ← minus placeholder RV
```

### NSE India (stock-nse-india)

The NSE API returns an array of records, each potentially containing CE (Call European) and PE (Put European) sub-objects:

```
API Response:
  data: [
    { optionType: "CE", strikePrice: 2900, impliedVolatility: 22.5, ... },
    { optionType: "PE", strikePrice: 2900, impliedVolatility: 28.1, ... },
    ...
  ]

Transformation:
  For each record:
    type       = CE → "CALL", PE → "PUT"
    impliedVol = record.impliedVolatility              ← already percentage
    strike     = parseFloat(record.strikePrice.trim()) ← sometimes string
    daysToExp  = ceil(|expiryDate - now| / 86400000)
    vrp        = impliedVol - 15
```

### Caching

All responses are cached in-memory for 10 seconds to avoid burning API credits:

```typescript
const CACHE_TTL_MS = 10_000;
```

---

## 9. Assumptions & Limitations

### Current Assumptions

| # | Assumption | Impact | Planned Fix |
|---|-----------|--------|-------------|
| 1 | **Realized Volatility is fixed at 15%** for all tickers | VRP values are relative to a static benchmark, not the ticker's actual historical volatility | Compute 30-day RV dynamically from historical price data |
| 2 | **Greeks are zero for NSE data** (delta, gamma, theta, vega) | Greek columns show 0.00 for Indian equities | Compute Greeks server-side using Black-Scholes given the NSE's IV, strike, and time to expiry |
| 3 | **No dividend adjustment** | IV may be slightly off for high-dividend-yield stocks | Incorporate dividend yield into the pricing model |
| 4 | **European-style pricing model** | US equity options are American-style and can be exercised early | Use a binomial tree or Bjerksund-Stensland model for American options |
| 5 | **Risk-free rate is implicit** | The API providers handle this internally; mock data ignores it | Fetch the current US Treasury yield or India's RBI repo rate |
| 6 | **No intraday updates** | Data reflects the last available snapshot, not real-time streaming | Integrate WebSocket feeds for live streaming |

### Known Biases in Mock Data

- The mock volatility smile uses a **symmetric quadratic** model. Real markets exhibit asymmetric skew (the "smirk"), with put IV typically higher than equidistant call IV.
- Mock volume and open interest are **uniformly random** and do not reflect the concentration of liquidity around ATM strikes that occurs in real markets.
- Mock bid-ask spreads are **fixed-width** ($0.40), whereas real spreads widen for illiquid, deep OTM options.

---

## References

1. **Carr, P. & Wu, L.** (2009). "Variance Risk Premiums." *The Review of Financial Studies*, 22(3), 1311–1341.
2. **Bollerslev, T., Tauchen, G. & Zhou, H.** (2009). "Expected Stock Returns and Variance Risk Premia." *The Review of Financial Studies*, 22(11), 4463–4492.
3. **Black, F. & Scholes, M.** (1973). "The Pricing of Options and Corporate Liabilities." *Journal of Political Economy*, 81(3), 637–654.
4. **Hull, J.C.** (2018). *Options, Futures, and Other Derivatives*, 10th edition. Pearson.

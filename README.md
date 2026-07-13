# VRP Global — Variance Risk Premium Analytics

VRP Global is an advanced, institutional-grade options analytics web application designed for analyzing the **Variance Risk Premium (VRP)** of equities across global markets. 

The platform allows traders to dynamically fetch live option chain data, calculate realized vs. implied volatility, and identify options that are potentially mispriced based on historical variance.

## 🎯 The Core Problem Addressed

This project was built to empirically answer a fundamental quantitative finance question: **Do variance risk premiums exist more prevalently in retail-heavy markets (like India) compared to institutional-heavy markets (like the US)?**

*   **Implied Volatility (IV)** is the market's expectation of future price movement, driven by the demand and price of options.
*   **Realized Volatility (RV)** is the actual historical movement of the underlying asset.
*   **Variance Risk Premium (VRP)** is the spread between the two (`VRP = IV - RV`).

In highly retail-driven markets like the National Stock Exchange of India (NSE), massive speculative demand for options can artificially inflate option prices and Implied Volatility. By comparing the live VRP of NSE equities side-by-side with US equities, this tool visually and mathematically proves whether a structural, positive premium exists for sellers in these environments.

## 🌟 Institutional-Grade Features

*   **True Mathematics Engine:**
    *   **Dynamic Realized Volatility:** Integrates `yahoo-finance2` to dynamically fetch historical daily closing prices, calculating a rolling True Realized Volatility (annualized Close-to-Close log returns standard deviation).
    *   **Server-Side Black-Scholes:** For exchanges like the NSE that do not natively supply Greeks, a bespoke TypeScript Black-Scholes-Merton engine calculates and injects Delta, Gamma, Theta, and Vega into the live data pipeline.
*   **Global Options Data Routing:** Automatically detects the exchange based on the ticker symbol (e.g., `.NS` suffix for India) and routes to MarketData.app (US) or natively to NSE India.
*   **Surface Analytics & DB Logging:** Silently logs aggregate market state snapshots (Average IV, Average VRP, Put-Call Ratio) to a SQLite database. The **Surface Analytics** dashboard charts these intraday developments alongside Volatility Skew.
*   **Volatility Surface 3D UI:** Integrates `plotly.js` for advanced quantitative visualization. A 3D topological plot maps Implied Volatility against Strike and Days to Expiry, allowing traders to instantly spot localized mispricings.
*   **Portfolio Risk Engine:** Simulates hypothetical option portfolios in real-time. Calculates aggregated Portfolio Net Delta, Gamma, Vega, Theta, and an institutional **99% Value at Risk (VaR)** approximation based on a Delta-Gamma model.
*   **Graceful Degradation:** Transitions smoothly to localized simulated data if an API rate limit is hit or a network error occurs.

## 🚀 Getting Started

### Prerequisites

*   Node.js 18+
*   pnpm (recommended) or npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/vrp-global.git
    cd vrp-global/web-app
    ```

2.  Install dependencies:
    ```bash
    pnpm install
    ```

3.  Configure Environment Variables:
    Create a `.env.local` file in the `web-app` directory and add your MarketData.app API key:
    ```env
    MARKETDATA_API_TOKEN=your_free_token_here
    ```

4.  Setup Database:
    ```bash
    npx prisma db push
    ```

5.  Start the development server:
    ```bash
    pnpm dev
    ```

6.  Open `http://localhost:3002/screener` in your browser.

## 📡 API Routing Assumptions

To keep the application highly scalable without running up massive API bills, the following data routing assumptions are made:

1.  **US Equities (e.g., `AAPL`, `SPY`):**
    *   Requests are routed to **MarketData.app** via the `/api/option-chain` route.
    *   MarketData provides delayed live options data for free accounts, with a hard limit on request frequency.

2.  **Indian Equities (e.g., `RELIANCE.NS`, `TCS.NS`):**
    *   Requests are routed natively to the **National Stock Exchange of India (NSE)** using the `stock-nse-india` package.
    *   *Note:* The NSE applies anti-bot protections. The backend will automatically negotiate session cookies on the very first request.

## 🛠 Tech Stack

*   **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Plotly.js, Recharts
*   **Backend:** Next.js API Routes (Serverless)
*   **Database:** SQLite via Prisma ORM
*   **Data Providers:** MarketData.app (US), NSE India (IN), Yahoo Finance (Historical)
*   **Package Management:** pnpm

## 📐 Mathematics & Methodology

For a complete breakdown of every formula, assumption, and calculation used in this project — including Black-Scholes, the Greeks, volatility smile modeling, VRP heatmap thresholds, and the mock data generation model — see:

**📄 [docs/MATHEMATICS.md](docs/MATHEMATICS.md)**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

# VRP Global — Variance Risk Premium Analytics

VRP Global is an advanced options analytics web application designed for analyzing the **Variance Risk Premium (VRP)** of equities across global markets. 

The screener allows traders to dynamically fetch live option chain data, calculate realized vs. implied volatility, and identify options that are potentially mispriced based on historical variance.

## 🎯 The Core Problem Addressed

This project was built to empirically answer a fundamental quantitative finance question: **Do variance risk premiums exist more prevalently in retail-heavy markets (like India) compared to institutional-heavy markets (like the US)?**

*   **Implied Volatility (IV)** is the market's expectation of future price movement, driven by the demand and price of options.
*   **Realized Volatility (RV)** is the actual historical movement of the underlying asset.
*   **Variance Risk Premium (VRP)** is the spread between the two (`VRP = IV - RV`).

In highly retail-driven markets like the National Stock Exchange of India (NSE), there is often massive speculative demand for options, which artificially inflates option prices and, consequently, Implied Volatility. By comparing the live VRP of NSE equities (e.g., `RELIANCE.NS`) side-by-side with US equities (e.g., `AAPL`), this tool visually and mathematically proves whether a structural, positive premium exists for sellers in these retail-heavy environments.
![US Screener](/public/screenshots/us_screener.png)
![NSE Screener](/public/screenshots/nse_screener.png)

## 🌟 Key Features

*   **Global Options Data:** Supports both US Equities (via MarketData.app) and Indian Equities (via NSE India natively).
*   **Intelligent Routing:** The custom backend API automatically detects the exchange based on the ticker symbol (e.g., `.NS` suffix for India) and routes the request to the appropriate data provider.
*   **Live Data Badges:** The UI actively reflects the real-time status of your data, distinguishing between `"Live Data"`, `"NSE Live Data"`, and `"Simulated Data"` (fallback).
*   **Advanced Analytics:** Calculates and displays Implied Volatility, Realized Volatility, Delta, Gamma, Theta, Vega, and the VRP spread.
*   **Graceful Degradation:** If an API rate limit is hit or a network error occurs, the system smoothly transitions to localized simulated data to prevent the UI from crashing.

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

4.  Start the development server:
    ```bash
    pnpm dev
    ```

5.  Open `http://localhost:3002/screener` in your browser.

## 📡 API Routing Assumptions

To keep the application highly scalable without running up massive API bills, the following data routing assumptions are made:

1.  **US Equities (e.g., `AAPL`, `SPY`):**
    *   Requests are routed to **MarketData.app** via the `/api/option-chain` route.
    *   MarketData provides delayed live options data for free accounts, with a hard limit on request frequency.
    *   If the request times out or is rejected (e.g., 400/404), the backend falls back to simulated VRP calculations.

2.  **Indian Equities (e.g., `RELIANCE.NS`, `TCS.NS`):**
    *   Requests are routed natively to the **National Stock Exchange of India (NSE)** using the `stock-nse-india` package.
    *   *Note:* The NSE applies anti-bot protections. The backend will automatically negotiate session cookies on the very first request. This first request may take up to 15 seconds to resolve, but all subsequent requests are cached and resolve rapidly.
    *   Requires the `.NS` suffix to correctly route.

## 🛠 Tech Stack

*   **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
*   **Backend:** Next.js API Routes (Serverless)
*   **Data Providers:** MarketData.app (US), NSE India (IN)
*   **Package Management:** pnpm

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

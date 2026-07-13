# VRP Global — Institutional Options Risk & Analytics

VRP Global is an institutional-grade options analytics platform designed to analyze the **Variance Risk Premium (VRP)** of equities across global markets. 

By comparing the market's expectation of volatility (Implied Volatility) against the actual historical movement of an asset (Realized Volatility), VRP Global helps traders visually and mathematically identify mispriced options.

![US Screener](/public/screenshots/us_screener.png)

---

## 🎯 The Core Philosophy: Why VRP?

**Do variance risk premiums exist more prevalently in retail-heavy markets (like India) compared to institutional-heavy markets (like the US)?**

In highly speculative markets, immense retail demand for options artificially inflates option prices and Implied Volatility (IV). 
*   **IV (Implied Volatility):** The market's expectation of future price movement.
*   **RV (Realized Volatility):** The actual historical movement of the asset.
*   **VRP = IV - RV**

By dynamically calculating the true realized volatility of an asset and comparing it to live option prices, this platform proves whether a structural premium exists for option sellers in these environments.

---

## 🚀 Key Features Explained

### 1. The Options Screener & 3D Volatility Surface
The core of the platform. Enter any US ticker (e.g., `AAPL`) or Indian ticker (e.g., `RELIANCE.NS`) to fetch a live options chain.
- **Data Table:** Instantly calculates the Black-Scholes Greeks (Delta, Gamma, Theta, Vega) and the exact Variance Risk Premium for every strike.
- **3D Volatility Surface:** Toggle the 3D view to visualize the "Volatility Smile" across Strike Prices and Days to Expiry. This interactive Plotly graph allows you to instantly spot localized mispricings where IV spikes unnaturally.

### 2. Live Surface Analytics
As you query different tickers, the backend silently logs the aggregate market state (Average IV, Average VRP, Put-Call Ratio) to a local SQLite database.
- Navigate to the **Surface Analytics** tab to view real-time charts tracking how the Volatility Skew and overall VRP trends evolve throughout the trading day.

### 3. Portfolio Risk Engine (Value at Risk)
Simulate a hypothetical options portfolio based on current live data.
- The **Portfolio Risk** tab aggregates the net Greeks of your simulated positions.
- It calculates an institutional **99% Value at Risk (VaR)** approximation, displaying the maximum expected loss over a 24-hour period based on your Delta and Gamma exposure.

### 4. Bespoke Mathematics Engine
Unlike basic screeners, VRP Global calculates its own math for markets that lack native Greeks (like the NSE).
- Integrates `yahoo-finance2` to dynamically fetch closing prices and calculate rolling True Realized Volatility.
- A custom TypeScript Black-Scholes-Merton engine calculates all Greeks on the server-side before serving them to the client.

---

## 🛠 Installation & Setup

### Prerequisites
*   Node.js 18+
*   pnpm (recommended) or npm

### Quick Start

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/creeedd89/vrp-web-app.git
    cd vrp-web-app/web-app
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Configure API Keys:**
    Create a `.env.local` file in the `web-app` directory and add your MarketData.app token (used for US Equities):
    ```env
    MARKETDATA_API_TOKEN=your_free_token_here
    ```

4.  **Initialize the Database:**
    Push the Prisma schema to create the local SQLite database for analytics tracking:
    ```bash
    npx prisma db push
    ```

5.  **Start the Server:**
    ```bash
    pnpm dev
    ```

Navigate to `http://localhost:3000/screener` to begin!

![NSE Screener](/public/screenshots/nse_screener.png)

---

## 📡 API Routing Architecture

To keep the application highly scalable and free to run:
1.  **US Equities (`AAPL`, `SPY`):** Routed to MarketData.app. If rate limits are hit, it gracefully falls back to simulated VRP calculations.
2.  **Indian Equities (`RELIANCE.NS`):** Routed natively to the National Stock Exchange of India (NSE). The backend automatically handles bot-protection session cookies.

## 📐 Methodology
For a complete breakdown of the Black-Scholes formulas, Greek derivations, and VRP heatmap thresholds, please see the **[docs/MATHEMATICS.md](docs/MATHEMATICS.md)** file.

"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

// Plotly needs to be dynamically imported with SSR disabled because it relies on the window object
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export interface OptionContract {
  id: string;
  strike: number;
  type: "CALL" | "PUT";
  daysToExpiry: number;
  impliedVol: number;
}

interface VolatilitySurface3DProps {
  data: OptionContract[];
  type?: "CALL" | "PUT";
}

export default function VolatilitySurface3D({ data, type = "CALL" }: VolatilitySurface3DProps) {
  // Filter by type and where IV > 0
  const filteredData = data.filter((c) => c.type === type && c.impliedVol > 0);

  // Get unique strikes and expiries
  const strikes = Array.from(new Set(filteredData.map((c) => c.strike))).sort((a, b) => a - b);
  const expiries = Array.from(new Set(filteredData.map((c) => c.daysToExpiry))).sort((a, b) => a - b);

  // Create a 2D array for the Z axis (Implied Volatility)
  // z[y][x] where y is expiry index and x is strike index
  const zData = useMemo(() => {
    return expiries.map((expiry) => {
      return strikes.map((strike) => {
        const contract = filteredData.find((c) => c.strike === strike && c.daysToExpiry === expiry);
        return contract ? contract.impliedVol : null; // null leaves a gap in the surface
      });
    });
  }, [filteredData, strikes, expiries]);

  return (
    <div className="w-full h-[500px] flex items-center justify-center bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
      <Plot
        data={[
          {
            x: strikes,
            y: expiries,
            z: zData,
            type: "surface",
            colorscale: "Viridis",
            showscale: false,
          } as any,
        ]}
        layout={{
          autosize: true,
          margin: { l: 0, r: 0, b: 0, t: 0 },
          paper_bgcolor: "transparent",
          scene: {
            xaxis: { title: "Strike", color: "#94a3b8", gridcolor: "#334155" },
            yaxis: { title: "DTE", color: "#94a3b8", gridcolor: "#334155" },
            zaxis: { title: "IV (%)", color: "#94a3b8", gridcolor: "#334155" },
            camera: {
              eye: { x: 1.5, y: -1.5, z: 1.2 }
            }
          },
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

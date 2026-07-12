import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/shared/components/Sidebar";
import { ThemeProvider } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VRP Global — Variance Risk Premium Analytics",
  description:
    "Professional-grade Variance Risk Premium dashboard for global stock markets. Calculate premiums, analyze risk, and get real-time market advisory across NYSE, NSE, LSE, TSE, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex">
        <ThemeProvider>
          <Sidebar />
          <main className="flex-1 ml-[240px] min-h-screen">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}

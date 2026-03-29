"use client";

import { useState } from "react";
import useSWR from "swr";
import { Header } from "./header";
import { PriceTicker } from "./price-ticker";
import { StatsCards } from "./stats-card";
import { CoinTable } from "./coin-table";
import { TradingViewChart } from "./trading-view-chart";
import { FearGreedGauge } from "./fear-greed-gauge";
import { SentimentCard } from "./sentiment-card";
import { WhaleAlerts } from "./whale-alerts";
import { Spinner } from "@/components/ui/spinner";
import type { CoinData } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function Dashboard() {
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);

  const { data: coins, error, isLoading } = useSWR<CoinData[]>(
    "/api/coins",
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="w-12 h-12 text-primary" />
          <p className="text-muted-foreground">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error || !coins) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load market data</p>
          <p className="text-muted-foreground text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  // Set default selected coin
  if (!selectedCoin && coins.length > 0) {
    setSelectedCoin(coins[0]);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Price Ticker */}
      <PriceTicker coins={coins} />

      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <StatsCards coins={coins} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Table */}
          <div className="xl:col-span-2">
            <CoinTable
              coins={coins}
              onSelectCoin={setSelectedCoin}
              selectedCoin={selectedCoin}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <FearGreedGauge />
            <SentimentCard />
          </div>
        </div>

        {/* Chart and Whale Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TradingViewChart coin={selectedCoin} />
          </div>
          <div>
            <WhaleAlerts />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-border/50 py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>Data provided by CoinGecko & Binance</p>
          <p>Built with Next.js & TradingView</p>
        </div>
      </footer>
    </div>
  );
}

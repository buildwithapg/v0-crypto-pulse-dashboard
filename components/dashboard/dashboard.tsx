"use client";

import { useState, useEffect, useRef } from "react";
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

// Simulate realistic price movements
function simulatePriceChange(price: number, volatility: number = 0.002): number {
  const change = (Math.random() - 0.5) * 2 * volatility;
  return price * (1 + change);
}

export function Dashboard() {
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [liveCoins, setLiveCoins] = useState<CoinData[]>([]);
  const initializedRef = useRef(false);

  const { data: coins, error, isLoading } = useSWR<CoinData[]>(
    "/api/coins",
    fetcher,
    {
      refreshInterval: 60000, // Refresh from API every 60 seconds
      revalidateOnFocus: true,
    }
  );

  // Initialize live coins when API data arrives
  useEffect(() => {
    if (coins && coins.length > 0 && !initializedRef.current) {
      setLiveCoins(coins);
      initializedRef.current = true;
    }
  }, [coins]);

  // Simulate live price movements
  useEffect(() => {
    if (liveCoins.length === 0) return;

    const interval = setInterval(() => {
      setLiveCoins((prevCoins) => {
        // Randomly update 3-8 coins each tick for realistic market feel
        const numToUpdate = Math.floor(Math.random() * 6) + 3;
        const indicesToUpdate = new Set<number>();
        
        while (indicesToUpdate.size < numToUpdate && indicesToUpdate.size < prevCoins.length) {
          indicesToUpdate.add(Math.floor(Math.random() * prevCoins.length));
        }

        return prevCoins.map((coin, index) => {
          if (!indicesToUpdate.has(index)) return coin;

          // Higher volatility for smaller cap coins
          const volatility = coin.market_cap_rank <= 10 ? 0.001 : 
                           coin.market_cap_rank <= 50 ? 0.002 : 0.004;
          
          const newPrice = simulatePriceChange(coin.current_price, volatility);
          const priceChange = ((newPrice - coin.current_price) / coin.current_price) * 100;
          
          return {
            ...coin,
            current_price: newPrice,
            price_change_percentage_24h: coin.price_change_percentage_24h + priceChange * 0.1,
          };
        });
      });
    }, 1500); // Update every 1.5 seconds

    return () => clearInterval(interval);
  }, [liveCoins.length]);

  // Update selected coin reference when prices change
  useEffect(() => {
    if (selectedCoin && liveCoins.length > 0) {
      const updated = liveCoins.find((c) => c.id === selectedCoin.id);
      if (updated && updated.current_price !== selectedCoin.current_price) {
        setSelectedCoin(updated);
      }
    }
  }, [liveCoins, selectedCoin]);

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

  // Use liveCoins if available, otherwise fall back to API data
  const displayCoins = liveCoins.length > 0 ? liveCoins : coins;

  // Set default selected coin
  if (!selectedCoin && displayCoins.length > 0) {
    setSelectedCoin(displayCoins[0]);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Price Ticker */}
      <PriceTicker coins={displayCoins} />

      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <StatsCards coins={displayCoins} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Table */}
          <div className="xl:col-span-2">
            <CoinTable
              coins={displayCoins}
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
      <footer className="glass-strong border-t border-primary/20 py-4 mt-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
            Data provided by CoinGecko & Binance
          </p>
          <p className="text-primary/70">Built with Next.js & TradingView</p>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, Coins } from "lucide-react";
import type { CoinData } from "@/lib/types";

interface StatsCardsProps {
  coins: CoinData[];
}

export function StatsCards({ coins }: StatsCardsProps) {
  // Calculate global stats
  const totalMarketCap = coins.reduce((sum, coin) => sum + coin.market_cap, 0);
  const totalVolume = coins.reduce((sum, coin) => sum + coin.total_volume, 0);
  const avgChange = coins.reduce((sum, coin) => sum + coin.price_change_percentage_24h, 0) / coins.length;
  const gainers = coins.filter((coin) => coin.price_change_percentage_24h > 0).length;
  const losers = coins.length - gainers;

  const btc = coins.find((c) => c.id === "bitcoin");
  const eth = coins.find((c) => c.id === "ethereum");

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const stats = [
    {
      label: "Total Market Cap",
      value: formatLargeNumber(totalMarketCap),
      change: avgChange,
      icon: DollarSign,
    },
    {
      label: "24h Volume",
      value: formatLargeNumber(totalVolume),
      icon: BarChart3,
    },
    {
      label: "BTC Dominance",
      value: btc ? `${((btc.market_cap / totalMarketCap) * 100).toFixed(1)}%` : "—",
      subValue: btc ? `$${btc.current_price.toLocaleString()}` : undefined,
      icon: Coins,
    },
    {
      label: "ETH Price",
      value: eth ? `$${eth.current_price.toLocaleString()}` : "—",
      change: eth?.price_change_percentage_24h,
      icon: Activity,
    },
    {
      label: "Gainers / Losers",
      value: `${gainers} / ${losers}`,
      ratio: gainers / (gainers + losers),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="glass border-border/50 glass-hover transition-all relative overflow-hidden">
          {index === 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green"></span>
              </span>
              <span className="text-[10px] text-neon-green font-medium">LIVE</span>
            </div>
          )}
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              {index !== 0 && <stat.icon className="w-4 h-4 text-primary/70" />}
            </div>
            <div className="text-xl font-bold font-mono">{stat.value}</div>
            {stat.change !== undefined && (
              <div
                className={`flex items-center gap-1 text-xs mt-1 ${
                  stat.change >= 0 ? "text-neon-green" : "text-neon-red"
                }`}
              >
                {stat.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(stat.change).toFixed(2)}%
              </div>
            )}
            {stat.subValue && (
              <div className="text-xs text-muted-foreground mt-1">{stat.subValue}</div>
            )}
            {stat.ratio !== undefined && (
              <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-neon-green rounded-full"
                  style={{ width: `${stat.ratio * 100}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

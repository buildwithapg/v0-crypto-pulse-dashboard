"use client";

import { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { CoinData } from "@/lib/types";

interface TickerCoin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  image: string;
  priceDirection?: "up" | "down" | null;
}

export function PriceTicker({ coins }: { coins: CoinData[] }) {
  const [tickerCoins, setTickerCoins] = useState<TickerCoin[]>([]);
  const prevPricesRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    // Update ticker with new prices from parent
    const updatedCoins = coins.slice(0, 20).map((coin) => {
      const prevPrice = prevPricesRef.current.get(coin.id);
      let priceDirection: "up" | "down" | null = null;
      
      if (prevPrice !== undefined && prevPrice !== coin.current_price) {
        priceDirection = coin.current_price > prevPrice ? "up" : "down";
      }
      
      prevPricesRef.current.set(coin.id, coin.current_price);

      return {
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_percentage_24h,
        image: coin.image,
        priceDirection,
      };
    });

    setTickerCoins(updatedCoins);

    // Clear price direction indicators after animation
    const timeout = setTimeout(() => {
      setTickerCoins((prev) =>
        prev.map((coin) => ({ ...coin, priceDirection: null }))
      );
    }, 800);

    return () => clearTimeout(timeout);
  }, [coins]);

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(6)}`;
  };

  // Double the coins for seamless loop
  const displayCoins = [...tickerCoins, ...tickerCoins];

  return (
    <div className="w-full overflow-hidden glass py-3">
      <div className="flex animate-ticker">
        {displayCoins.map((coin, index) => (
          <div
            key={`${coin.id}-${index}`}
            className="flex items-center gap-3 px-6 border-r border-border/30 shrink-0"
          >
            <img
              src={coin.image}
              alt={coin.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="font-medium text-foreground">{coin.symbol}</span>
            <span 
              className={`font-mono text-sm transition-colors duration-300 ${
                coin.priceDirection === "up" 
                  ? "text-neon-green" 
                  : coin.priceDirection === "down" 
                  ? "text-neon-red" 
                  : "text-foreground/90"
              }`}
            >
              {formatPrice(coin.price)}
            </span>
            <span
              className={`flex items-center gap-1 text-sm font-medium ${
                coin.change >= 0 ? "text-neon-green" : "text-neon-red"
              }`}
            >
              {coin.change >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {Math.abs(coin.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

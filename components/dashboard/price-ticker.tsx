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
}

export function PriceTicker({ coins }: { coins: CoinData[] }) {
  const [tickerCoins, setTickerCoins] = useState<TickerCoin[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const pricesRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    // Initialize with CoinGecko data
    const initialCoins = coins.slice(0, 20).map((coin) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change: coin.price_change_percentage_24h,
      image: coin.image,
    }));
    setTickerCoins(initialCoins);
    initialCoins.forEach((coin) => pricesRef.current.set(coin.symbol, coin.price));

    // Connect to Binance WebSocket for real-time updates
    const symbols = initialCoins
      .map((c) => `${c.symbol.toLowerCase()}usdt@ticker`)
      .join("/");
    
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbols}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.s) {
        const symbol = data.s.replace("USDT", "");
        const price = parseFloat(data.c);
        const change = parseFloat(data.P);

        setTickerCoins((prev) =>
          prev.map((coin) =>
            coin.symbol === symbol
              ? { ...coin, price, change }
              : coin
          )
        );
      }
    };

    return () => {
      ws.close();
    };
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
            <span className="font-mono text-sm text-foreground/90">
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

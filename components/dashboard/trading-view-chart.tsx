"use client";

import { useEffect, useRef, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart } from "lucide-react";
import type { CoinData } from "@/lib/types";

interface TradingViewChartProps {
  coin: CoinData | null;
}

function TradingViewChartComponent({ coin }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !coin) return;

    // Clear previous widget
    containerRef.current.innerHTML = "";

    // Map common coin IDs to TradingView symbols
    const symbolMap: Record<string, string> = {
      bitcoin: "BTCUSD",
      ethereum: "ETHUSD",
      tether: "USDTUSD",
      "binance-coin": "BNBUSD",
      ripple: "XRPUSD",
      cardano: "ADAUSD",
      solana: "SOLUSD",
      dogecoin: "DOGEUSD",
      polkadot: "DOTUSD",
      "shiba-inu": "SHIBUSD",
      litecoin: "LTCUSD",
      avalanche: "AVAXUSD",
      chainlink: "LINKUSD",
      polygon: "MATICUSD",
      uniswap: "UNIUSD",
    };

    const symbol = symbolMap[coin.id] || `${coin.symbol.toUpperCase()}USD`;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `BINANCE:${symbol}`,
      interval: "60",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(15, 23, 42, 0)",
      gridColor: "rgba(42, 46, 57, 0.3)",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    });

    containerRef.current.appendChild(script);
  }, [coin]);

  if (!coin) {
    return (
      <Card className="glass border-border/50 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <LineChart className="w-4 h-4" />
            Price Chart
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[500px]">
          <div className="text-center text-muted-foreground">
            <LineChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Select a coin to view chart</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/50 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <LineChart className="w-4 h-4" />
            Price Chart
          </CardTitle>
          <div className="flex items-center gap-2">
            <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />
            <span className="font-medium text-foreground">{coin.name}</span>
            <Badge variant="outline" className="text-xs uppercase">
              {coin.symbol}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={containerRef}
          className="tradingview-widget-container h-[500px] w-full"
        />
      </CardContent>
    </Card>
  );
}

export const TradingViewChart = memo(TradingViewChartComponent);

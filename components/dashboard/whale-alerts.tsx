"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Fish, ArrowRight, ExternalLink } from "lucide-react";

interface WhaleTransaction {
  id: string;
  symbol: string;
  amount: number;
  amountUsd: number;
  from: string;
  to: string;
  fromType: string;
  toType: string;
  hash: string;
  timestamp: number;
  blockchain: string;
}

// Generate mock whale alerts for demo (real API would need API key)
function generateMockWhaleAlerts(): WhaleTransaction[] {
  const symbols = ["BTC", "ETH", "USDT", "USDC", "XRP", "SOL"];
  const walletTypes = ["exchange", "unknown", "whale", "fund"];
  const exchanges = ["Binance", "Coinbase", "Kraken", "FTX", "Unknown"];
  const blockchains = ["bitcoin", "ethereum", "solana", "ripple"];

  return Array.from({ length: 20 }, (_, i) => {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const isStable = symbol === "USDT" || symbol === "USDC";
    const amount = isStable
      ? Math.floor(Math.random() * 100000000) + 10000000
      : symbol === "BTC"
      ? Math.floor(Math.random() * 5000) + 100
      : Math.floor(Math.random() * 50000) + 1000;

    const priceMap: Record<string, number> = {
      BTC: 67000,
      ETH: 3500,
      USDT: 1,
      USDC: 1,
      XRP: 0.5,
      SOL: 150,
    };

    const fromType = walletTypes[Math.floor(Math.random() * walletTypes.length)];
    const toType = walletTypes[Math.floor(Math.random() * walletTypes.length)];

    return {
      id: `tx-${i}-${Date.now()}`,
      symbol,
      amount,
      amountUsd: amount * priceMap[symbol],
      from: fromType === "exchange" ? exchanges[Math.floor(Math.random() * exchanges.length)] : "Unknown Wallet",
      to: toType === "exchange" ? exchanges[Math.floor(Math.random() * exchanges.length)] : "Unknown Wallet",
      fromType,
      toType,
      hash: `0x${Math.random().toString(16).slice(2, 18)}...`,
      timestamp: Date.now() - Math.floor(Math.random() * 3600000),
      blockchain: blockchains[Math.floor(Math.random() * blockchains.length)],
    };
  });
}

export function WhaleAlerts() {
  const [alerts, setAlerts] = useState<WhaleTransaction[]>([]);

  useEffect(() => {
    // Initialize with mock data
    setAlerts(generateMockWhaleAlerts());

    // Add new alerts periodically - faster for live market feel
    const interval = setInterval(() => {
      const newAlert = generateMockWhaleAlerts()[0];
      newAlert.timestamp = Date.now();
      newAlert.id = `tx-${Date.now()}-${Math.random()}`;
      setAlerts((prev) => [newAlert, ...prev.slice(0, 19)]);
    }, 5000); // New whale alert every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const formatAmount = (amount: number, symbol: string) => {
    if (symbol === "USDT" || symbol === "USDC") {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K ${symbol}`;
    }
    return `${amount.toLocaleString()} ${symbol}`;
  };

  const formatUsd = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    return `$${(amount / 1e3).toFixed(0)}K`;
  };

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "exchange":
        return "text-primary bg-primary/10 border-primary/30";
      case "whale":
        return "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30";
      case "fund":
        return "text-warning bg-warning/10 border-warning/30";
      default:
        return "text-muted-foreground bg-muted/50 border-border";
    }
  };

  return (
    <Card className="glass border-border/50 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Fish className="w-4 h-4" />
          Whale Alerts
          <Badge variant="outline" className="ml-auto text-xs">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 p-4 pt-0">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors border border-transparent hover:border-border/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="font-mono text-xs font-semibold"
                    >
                      {alert.symbol}
                    </Badge>
                    <span className="text-sm font-semibold text-foreground">
                      {formatAmount(alert.amount, alert.symbol)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({formatUsd(alert.amountUsd)})
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(alert.timestamp)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className={`${getTypeColor(alert.fromType)} text-xs`}>
                    {alert.from}
                  </Badge>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <Badge variant="outline" className={`${getTypeColor(alert.toType)} text-xs`}>
                    {alert.to}
                  </Badge>
                  <a
                    href="#"
                    className="ml-auto text-muted-foreground hover:text-foreground"
                    title="View transaction"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

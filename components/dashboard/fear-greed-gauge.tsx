"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge } from "lucide-react";

interface FearGreedData {
  value: number;
  classification: string;
  timestamp: string;
}

export function FearGreedGauge() {
  const [data, setData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFearGreed() {
      try {
        const res = await fetch("https://api.alternative.me/fng/?limit=1");
        const json = await res.json();
        if (json.data?.[0]) {
          setData({
            value: parseInt(json.data[0].value),
            classification: json.data[0].value_classification,
            timestamp: json.data[0].timestamp,
          });
        }
      } catch (error) {
        console.error("Failed to fetch Fear & Greed index:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFearGreed();
    const interval = setInterval(fetchFearGreed, 60000);
    return () => clearInterval(interval);
  }, []);

  const getColor = (value: number) => {
    if (value <= 25) return "text-neon-red";
    if (value <= 45) return "text-orange-400";
    if (value <= 55) return "text-yellow-400";
    if (value <= 75) return "text-lime-400";
    return "text-neon-green";
  };

  const getGradient = (value: number) => {
    const rotation = (value / 100) * 180;
    return `conic-gradient(from 180deg, 
      oklch(0.6 0.24 25) 0deg, 
      oklch(0.75 0.2 60) 45deg, 
      oklch(0.85 0.2 90) 90deg, 
      oklch(0.8 0.22 130) 135deg, 
      oklch(0.75 0.25 145) 180deg, 
      transparent 180deg)`;
  };

  if (loading) {
    return (
      <Card className="glass border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <Gauge className="w-4 h-4" />
            Fear & Greed Index
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="glass border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Gauge className="w-4 h-4" />
          Fear & Greed Index
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Gauge */}
          <div className="relative w-44 h-24 mb-4">
            {/* Background arc */}
            <div
              className="absolute inset-0 rounded-t-full overflow-hidden"
              style={{
                background: getGradient(100),
                clipPath: "polygon(0 100%, 0 0, 100% 0, 100% 100%, 85% 100%, 50% 15%, 15% 100%)",
              }}
            />
            {/* Needle */}
            <div
              className="absolute bottom-0 left-1/2 w-1 h-20 bg-foreground rounded-full origin-bottom transition-transform duration-700"
              style={{
                transform: `translateX(-50%) rotate(${(data.value / 100) * 180 - 90}deg)`,
              }}
            />
            {/* Center dot */}
            <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-foreground rounded-full -translate-x-1/2 translate-y-1/2" />
          </div>

          {/* Value */}
          <div className={`text-5xl font-bold font-mono ${getColor(data.value)}`}>
            {data.value}
          </div>
          <div className={`text-lg font-medium mt-1 ${getColor(data.value)}`}>
            {data.classification}
          </div>

          {/* Scale labels */}
          <div className="flex justify-between w-full mt-4 text-xs text-muted-foreground">
            <span>Extreme Fear</span>
            <span>Neutral</span>
            <span>Extreme Greed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

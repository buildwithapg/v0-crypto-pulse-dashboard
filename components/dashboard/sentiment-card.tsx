"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MessageCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
  overall: "bullish" | "bearish" | "neutral";
  sources: {
    twitter: number;
    reddit: number;
    news: number;
  };
}

// Simulated sentiment analysis
function generateSentiment(): SentimentData {
  const positive = 30 + Math.random() * 40;
  const negative = 10 + Math.random() * 30;
  const neutral = 100 - positive - negative;

  let overall: "bullish" | "bearish" | "neutral";
  if (positive > negative + 15) overall = "bullish";
  else if (negative > positive + 10) overall = "bearish";
  else overall = "neutral";

  return {
    positive: Math.round(positive),
    negative: Math.round(negative),
    neutral: Math.round(neutral),
    overall,
    sources: {
      twitter: 35 + Math.random() * 30,
      reddit: 40 + Math.random() * 25,
      news: 45 + Math.random() * 20,
    },
  };
}

export function SentimentCard() {
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);

  useEffect(() => {
    setSentiment(generateSentiment());

    // Update every 30 seconds
    const interval = setInterval(() => {
      setSentiment(generateSentiment());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!sentiment) {
    return (
      <Card className="glass border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            Market Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const getOverallIcon = () => {
    switch (sentiment.overall) {
      case "bullish":
        return <TrendingUp className="w-5 h-5 text-neon-green" />;
      case "bearish":
        return <TrendingDown className="w-5 h-5 text-neon-red" />;
      default:
        return <Minus className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getOverallColor = () => {
    switch (sentiment.overall) {
      case "bullish":
        return "text-neon-green bg-neon-green/10 border-neon-green/30";
      case "bearish":
        return "text-neon-red bg-neon-red/10 border-neon-red/30";
      default:
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    }
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            Market Sentiment
          </CardTitle>
          <Badge variant="outline" className={getOverallColor()}>
            {getOverallIcon()}
            <span className="ml-1 capitalize">{sentiment.overall}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sentiment bars */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-neon-green">Bullish</span>
              <span className="font-mono">{sentiment.positive}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-neon-green rounded-full transition-all duration-500"
                style={{ width: `${sentiment.positive}%` }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-yellow-400">Neutral</span>
              <span className="font-mono">{sentiment.neutral}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${sentiment.neutral}%` }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-neon-red">Bearish</span>
              <span className="font-mono">{sentiment.negative}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-neon-red rounded-full transition-all duration-500"
                style={{ width: `${sentiment.negative}%` }}
              />
            </div>
          </div>
        </div>

        {/* Source breakdown */}
        <div className="pt-3 border-t border-border/50">
          <div className="text-xs text-muted-foreground mb-2">By Source</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-secondary/30">
              <div className="text-xs text-muted-foreground">Twitter</div>
              <div className={`text-sm font-semibold ${sentiment.sources.twitter >= 50 ? "text-neon-green" : "text-neon-red"}`}>
                {sentiment.sources.twitter.toFixed(0)}%
              </div>
            </div>
            <div className="p-2 rounded-lg bg-secondary/30">
              <div className="text-xs text-muted-foreground">Reddit</div>
              <div className={`text-sm font-semibold ${sentiment.sources.reddit >= 50 ? "text-neon-green" : "text-neon-red"}`}>
                {sentiment.sources.reddit.toFixed(0)}%
              </div>
            </div>
            <div className="p-2 rounded-lg bg-secondary/30">
              <div className="text-xs text-muted-foreground">News</div>
              <div className={`text-sm font-semibold ${sentiment.sources.news >= 50 ? "text-neon-green" : "text-neon-red"}`}>
                {sentiment.sources.news.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

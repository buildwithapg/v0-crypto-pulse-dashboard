"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Star,
  TrendingUp,
  TrendingDown,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { CoinData, Favorite } from "@/lib/types";
import { Sparkline } from "./sparkline";

interface CoinTableProps {
  coins: CoinData[];
  onSelectCoin: (coin: CoinData) => void;
  selectedCoin: CoinData | null;
}

type SortField = "market_cap" | "current_price" | "price_change_percentage_24h" | "total_volume";
type SortDirection = "asc" | "desc";

export function CoinTable({ coins, onSelectCoin, selectedCoin }: CoinTableProps) {
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>("market_cap");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();
  const prevPrices = useRef<Map<string, number>>(new Map());
  const [priceChanges, setPriceChanges] = useState<Map<string, "up" | "down">>(new Map());

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadFavorites(user.id);
      }
    }
    getUser();
  }, []);

  useEffect(() => {
    // Track price changes for animation
    const newChanges = new Map<string, "up" | "down">();
    coins.forEach((coin) => {
      const prevPrice = prevPrices.current.get(coin.id);
      if (prevPrice !== undefined && prevPrice !== coin.current_price) {
        newChanges.set(coin.id, coin.current_price > prevPrice ? "up" : "down");
      }
      prevPrices.current.set(coin.id, coin.current_price);
    });
    
    if (newChanges.size > 0) {
      setPriceChanges(newChanges);
      setTimeout(() => setPriceChanges(new Map()), 1000);
    }
  }, [coins]);

  async function loadFavorites(uid: string) {
    const { data } = await supabase
      .from("favorites")
      .select("coin_id")
      .eq("user_id", uid);
    
    if (data) {
      setFavorites(new Set(data.map((f) => f.coin_id)));
    }
  }

  async function toggleFavorite(coin: CoinData) {
    if (!userId) {
      toast.error("Please sign in to save favorites");
      return;
    }

    const isFavorite = favorites.has(coin.id);

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("coin_id", coin.id);

      if (error) {
        toast.error("Failed to remove favorite");
        return;
      }

      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(coin.id);
        return next;
      });
      toast.success(`Removed ${coin.name} from favorites`);
    } else {
      const { error } = await supabase.from("favorites").insert({
        user_id: userId,
        coin_id: coin.id,
        coin_symbol: coin.symbol,
        coin_name: coin.name,
      });

      if (error) {
        toast.error("Failed to add favorite");
        return;
      }

      setFavorites((prev) => new Set(prev).add(coin.id));
      toast.success(`Added ${coin.name} to favorites`);
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredCoins = coins
    .filter((coin) => {
      const matchesSearch =
        coin.name.toLowerCase().includes(search.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(search.toLowerCase());
      const matchesFavorites = showFavoritesOnly ? favorites.has(coin.id) : true;
      return matchesSearch && matchesFavorites;
    })
    .sort((a, b) => {
      const multiplier = sortDirection === "asc" ? 1 : -1;
      return (a[sortField] - b[sortField]) * multiplier;
    });

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <CardTitle className="text-lg font-semibold">Market Overview</CardTitle>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search coins..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50 border-border/50"
              />
            </div>
            {userId && (
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="shrink-0"
              >
                <Star className={`w-4 h-4 mr-1 ${showFavoritesOnly ? "fill-current" : ""}`} />
                Favorites
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-10"></TableHead>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("current_price")}
                >
                  <span className="flex items-center justify-end gap-1">
                    Price
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("price_change_percentage_24h")}
                >
                  <span className="flex items-center justify-end gap-1">
                    24h %
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:text-foreground hidden md:table-cell"
                  onClick={() => handleSort("market_cap")}
                >
                  <span className="flex items-center justify-end gap-1">
                    Market Cap
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </TableHead>
                <TableHead className="text-right hidden lg:table-cell">7d Chart</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoins.slice(0, 50).map((coin, index) => (
                <TableRow
                  key={coin.id}
                  className={`border-border/30 cursor-pointer transition-colors ${
                    selectedCoin?.id === coin.id
                      ? "bg-primary/10 hover:bg-primary/15"
                      : "hover:bg-secondary/30"
                  }`}
                  onClick={() => onSelectCoin(coin)}
                >
                  <TableCell className="py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(coin);
                      }}
                      className="p-1 hover:bg-secondary/50 rounded transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          favorites.has(coin.id)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  </TableCell>
                  <TableCell className="py-3 text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium">{coin.name}</div>
                        <div className="text-sm text-muted-foreground uppercase">
                          {coin.symbol}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    className={`py-3 text-right font-mono ${
                      priceChanges.get(coin.id) === "up"
                        ? "price-up"
                        : priceChanges.get(coin.id) === "down"
                        ? "price-down"
                        : ""
                    }`}
                  >
                    {formatPrice(coin.current_price)}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <Badge
                      variant="outline"
                      className={`font-mono ${
                        coin.price_change_percentage_24h >= 0
                          ? "text-neon-green border-neon-green/30 bg-neon-green/10"
                          : "text-neon-red border-neon-red/30 bg-neon-red/10"
                      }`}
                    >
                      {coin.price_change_percentage_24h >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-right font-mono hidden md:table-cell">
                    {formatMarketCap(coin.market_cap)}
                  </TableCell>
                  <TableCell className="py-3 hidden lg:table-cell">
                    {coin.sparkline_in_7d && (
                      <Sparkline
                        data={coin.sparkline_in_7d.price}
                        positive={coin.price_change_percentage_24h >= 0}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

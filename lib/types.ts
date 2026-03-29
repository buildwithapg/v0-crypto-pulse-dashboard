export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface BinanceTicker {
  s: string; // Symbol
  c: string; // Close price
  P: string; // Price change percent
}

export interface WhaleAlert {
  id: string;
  blockchain: string;
  symbol: string;
  transaction_type: string;
  hash: string;
  from: {
    address: string;
    owner?: string;
    owner_type?: string;
  };
  to: {
    address: string;
    owner?: string;
    owner_type?: string;
  };
  timestamp: number;
  amount: number;
  amount_usd: number;
}

export interface FearGreedData {
  value: string;
  value_classification: string;
  timestamp: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  coin_id: string;
  coin_symbol: string;
  coin_name: string;
  created_at: string;
}

export interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
  overall: 'bullish' | 'bearish' | 'neutral';
}

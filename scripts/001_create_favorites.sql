-- Create favorites table for storing user's favorite cryptocurrencies
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, coin_id)
);

-- Enable Row Level Security
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own favorites" 
  ON public.favorites FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
  ON public.favorites FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
  ON public.favorites FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow anonymous users to view favorites (for localStorage fallback)
CREATE POLICY "Allow anonymous read for demo" 
  ON public.favorites FOR SELECT 
  USING (user_id IS NULL);

CREATE POLICY "Allow anonymous insert for demo" 
  ON public.favorites FOR INSERT 
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Allow anonymous delete for demo" 
  ON public.favorites FOR DELETE 
  USING (user_id IS NULL);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_coin_id ON public.favorites(coin_id);

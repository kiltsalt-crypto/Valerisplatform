import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  starting_capital: number;
  current_capital: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  best_trade: number;
  worst_trade: number;
  created_at: string;
  updated_at: string;
  theme?: string | null;
  subscription_tier?: string | null;
  subscription_expires_at?: string | null;
  is_admin?: boolean;
  avatar_url?: string | null;
  bio?: string | null;
};

export type Trade = {
  id: string;
  user_id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  entry_price: number;
  exit_price: number | null;
  entry_date: string;
  exit_date: string | null;
  status: 'open' | 'closed';
  profit_loss: number;
  profit_loss_percentage: number;
  notes: string | null;
  strategy: string | null;
  stop_loss: number | null;
  take_profit: number | null;
  created_at: string;
};

export type LearningModule = {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'basics' | 'technical' | 'fundamental' | 'risk' | 'psychology' | 'strategies';
  order_index: number;
  duration_minutes: number;
  created_at: string;
};

export type UserProgress = {
  id: string;
  user_id: string;
  module_id: string;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
};

export type DailyPerformance = {
  id: string;
  user_id: string;
  date: string;
  starting_balance: number;
  ending_balance: number;
  profit_loss: number;
  trades_count: number;
  win_rate: number;
  created_at: string;
};

export type WatchlistItem = {
  id: string;
  user_id: string;
  symbol: string;
  notes: string | null;
  target_entry: number | null;
  created_at: string;
};

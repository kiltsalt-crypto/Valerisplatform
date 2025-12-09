import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type SubscriptionTier = 'free' | 'pro' | 'elite' | 'mentorship';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export interface UserSubscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_start: string;
  current_period_end: string;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeatureAccess {
  hasAccess: boolean;
  limit?: number;
  currentUsage?: number;
  remaining?: number;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    fetchSubscription();
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setSubscription(data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  const checkFeatureAccess = async (featureKey: string): Promise<FeatureAccess> => {
    if (!user || !subscription) {
      return { hasAccess: false };
    }

    try {
      const { data: feature } = await supabase
        .from('subscription_features')
        .select('*')
        .eq('tier', subscription.tier)
        .eq('feature_key', featureKey)
        .maybeSingle();

      if (!feature) {
        return { hasAccess: false };
      }

      if (feature.limit_value === null) {
        return { hasAccess: true };
      }

      const { data: usage } = await supabase
        .from('user_feature_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('feature_key', featureKey)
        .gt('reset_at', new Date().toISOString())
        .maybeSingle();

      const currentUsage = usage?.usage_count || 0;
      const limit = feature.limit_value;

      return {
        hasAccess: currentUsage < limit,
        limit,
        currentUsage,
        remaining: Math.max(0, limit - currentUsage)
      };
    } catch (err) {
      console.error('Error checking feature access:', err);
      return { hasAccess: false };
    }
  };

  const incrementUsage = async (featureKey: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('check_and_increment_usage', {
        p_user_id: user.id,
        p_feature_key: featureKey
      });

      if (error) throw error;
      return data as boolean;
    } catch (err) {
      console.error('Error incrementing usage:', err);
      return false;
    }
  };

  const upgradeTier = async (newTier: SubscriptionTier): Promise<boolean> => {
    if (!user || !subscription) return false;

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          tier: newTier,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchSubscription();
      return true;
    } catch (err) {
      console.error('Error upgrading tier:', err);
      return false;
    }
  };

  const cancelSubscription = async (): Promise<boolean> => {
    if (!user || !subscription) return false;

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchSubscription();
      return true;
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      return false;
    }
  };

  const isFeatureAvailable = (featureKey: string): boolean => {
    if (!subscription) return false;

    const tierFeatures: Record<SubscriptionTier, string[]> = {
      free: ['journal_entries', 'paper_trading', 'basic_analytics', 'community_forum'],
      pro: [
        'journal_entries', 'paper_trading', 'basic_analytics', 'topstep_tracker',
        'video_courses', 'community_forum', 'risk_calculator', 'economic_calendar',
        'daily_checklist', 'single_chart'
      ],
      elite: [
        'journal_entries', 'paper_trading', 'advanced_analytics', 'topstep_tracker',
        'video_courses', 'ai_coach', 'community_forum', 'live_trading_room',
        'strategy_builder', 'market_scanner', 'backtesting', 'trade_replay',
        'multi_chart', 'level2_data', 'stock_comparison', 'heat_maps',
        'trade_templates', 'broker_integration', 'custom_alerts',
        'trading_challenges', 'export_reports', 'risk_calculator',
        'economic_calendar', 'daily_checklist'
      ],
      mentorship: [
        'journal_entries', 'one_on_one_coaching', 'weekly_review',
        'priority_support', 'custom_strategies'
      ]
    };

    return tierFeatures[subscription.tier]?.includes(featureKey) || false;
  };

  return {
    subscription,
    loading,
    error,
    checkFeatureAccess,
    incrementUsage,
    upgradeTier,
    cancelSubscription,
    isFeatureAvailable,
    refetch: fetchSubscription
  };
}

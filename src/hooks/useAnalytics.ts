import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const calculateAnalytics = async (period: string = 'all') => {
    if (!user) return null;

    setLoading(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-analytics`;
      const { data: session } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, period }),
      });

      const result = await response.json();
      return result.analytics;
    } catch (error) {
      console.error('Error calculating analytics:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkAchievements = async () => {
    if (!user) return [];

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-achievements`;
      const { data: session } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await response.json();
      return result.newAchievements || [];
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  };

  return {
    calculateAnalytics,
    checkAchievements,
    loading,
  };
}

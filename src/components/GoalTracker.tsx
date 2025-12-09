import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Target, Plus, TrendingUp } from 'lucide-react';

interface Goal {
  id: string;
  goal_type: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  status: string;
}

export default function GoalTracker() {
  const { profile } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    goal_type: 'daily',
    target_amount: 500,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadGoals();
  }, [profile]);

  const loadGoals = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('pnl_goals')
      .select('*')
      .eq('user_id', profile.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data) {
      const goalsWithProgress = await Promise.all(
        data.map(async (goal) => {
          const { data: trades } = await supabase
            .from('trades')
            .select('profit_loss')
            .eq('user_id', profile.id)
            .gte('created_at', goal.start_date)
            .lte('created_at', goal.end_date);

          const current = trades?.reduce((sum, t: any) => sum + (t.profit_loss || 0), 0) || 0;

          await supabase
            .from('pnl_goals')
            .update({ current_amount: current })
            .eq('id', goal.id);

          return { ...goal, current_amount: current };
        })
      );

      setGoals(goalsWithProgress);
    }
  };

  const createGoal = async () => {
    if (!profile) return;

    await supabase.from('pnl_goals').insert({
      user_id: profile.id,
      ...formData,
      current_amount: 0,
      status: 'active'
    });

    loadGoals();
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-400" />
          P&L Goals
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition text-sm"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Type</label>
              <select
                value={formData.goal_type}
                onChange={(e) => setFormData({ ...formData, goal_type: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Target Amount</label>
              <input
                type="number"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: parseFloat(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <button
            onClick={createGoal}
            className="mt-3 w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
          >
            Create Goal
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {goals.map(goal => {
          const progress = (goal.current_amount / goal.target_amount) * 100;
          return (
            <div key={goal.id} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm capitalize">{goal.goal_type} Goal</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mb-3">
                <p className="text-white text-2xl font-bold">${goal.current_amount.toFixed(0)}</p>
                <p className="text-slate-400 text-sm">of ${goal.target_amount.toFixed(0)}</p>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    progress >= 100 ? 'bg-green-500' : progress >= 50 ? 'bg-purple-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-slate-400 text-xs text-right">{progress.toFixed(0)}% Complete</p>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && !showForm && (
        <div className="glass-card p-8 text-center">
          <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No active goals</p>
        </div>
      )}
    </div>
  );
}

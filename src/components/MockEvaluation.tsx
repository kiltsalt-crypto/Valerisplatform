import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, AlertTriangle, TrendingUp, TrendingDown, Calendar, Target, DollarSign, X } from 'lucide-react';

type EvaluationChallenge = {
  id: string;
  user_id: string;
  challenge_type: string;
  start_date: string;
  end_date: string | null;
  starting_balance: number;
  current_balance: number;
  profit_target: number;
  max_loss: number;
  daily_loss_limit: number;
  min_trading_days: number;
  days_traded: number;
  status: 'active' | 'passed' | 'failed';
  rules_broken: string[];
  created_at: string;
};

type ChallengeTemplate = {
  id: string;
  name: string;
  balance: number;
  profitTarget: number;
  maxLoss: number;
  dailyLossLimit: number;
  minDays: number;
};

const challengeTemplates: ChallengeTemplate[] = [
  {
    id: 'topstep_50k',
    name: 'TopStep $50K',
    balance: 50000,
    profitTarget: 3000,
    maxLoss: 2000,
    dailyLossLimit: 1000,
    minDays: 5,
  },
  {
    id: 'topstep_100k',
    name: 'TopStep $100K',
    balance: 100000,
    profitTarget: 6000,
    maxLoss: 3000,
    dailyLossLimit: 2000,
    minDays: 5,
  },
  {
    id: 'topstep_150k',
    name: 'TopStep $150K',
    balance: 150000,
    profitTarget: 9000,
    maxLoss: 4000,
    dailyLossLimit: 3000,
    minDays: 5,
  },
  {
    id: 'apex_50k',
    name: 'Apex $50K',
    balance: 50000,
    profitTarget: 3000,
    maxLoss: 2500,
    dailyLossLimit: 1250,
    minDays: 0,
  },
  {
    id: 'apex_100k',
    name: 'Apex $100K',
    balance: 100000,
    profitTarget: 6000,
    maxLoss: 5000,
    dailyLossLimit: 2500,
    minDays: 0,
  },
];

export default function MockEvaluation() {
  const { user } = useAuth();
  const [activeChallenge, setActiveChallenge] = useState<EvaluationChallenge | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActiveChallenge();
    }
  }, [user]);

  const fetchActiveChallenge = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('evaluation_challenges')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      console.error('Error fetching challenge:', error);
      return;
    }

    setActiveChallenge(data);
    setLoading(false);
  };

  const createChallenge = async (template: ChallengeTemplate) => {
    if (!user) return;

    const { error } = await supabase.from('evaluation_challenges').insert({
      user_id: user.id,
      challenge_type: template.id,
      start_date: new Date().toISOString().split('T')[0],
      starting_balance: template.balance,
      current_balance: template.balance,
      profit_target: template.profitTarget,
      max_loss: template.maxLoss,
      daily_loss_limit: template.dailyLossLimit,
      min_trading_days: template.minDays,
      status: 'active',
    });

    if (error) {
      console.error('Error creating challenge:', error);
      alert('Error creating challenge');
      return;
    }

    setShowCreateModal(false);
    fetchActiveChallenge();
  };

  const endChallenge = async (status: 'passed' | 'failed') => {
    if (!activeChallenge) return;

    const { error } = await supabase
      .from('evaluation_challenges')
      .update({
        status,
        end_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', activeChallenge.id);

    if (error) {
      console.error('Error ending challenge:', error);
      return;
    }

    fetchActiveChallenge();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!activeChallenge) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Mock Evaluation Challenge</h1>
          <p className="text-slate-400">Practice funded account evaluations with real rules before paying</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/50 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <Trophy className="w-12 h-12 text-emerald-400 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Why Practice First?</h2>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Learn the rules without risking $165-$375/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Understand trailing drawdown and daily loss limits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Test your strategies under real pressure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Build confidence before the real evaluation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challengeTemplates.map((template) => (
            <div key={template.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                <div className="text-3xl font-bold text-emerald-400">
                  ${template.balance.toLocaleString()}
                </div>
              </div>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">Profit Target:</span>
                  <span className="text-white font-semibold">
                    ${template.profitTarget.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Loss:</span>
                  <span className="text-red-400 font-semibold">
                    ${template.maxLoss.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Daily Loss Limit:</span>
                  <span className="text-orange-400 font-semibold">
                    ${template.dailyLossLimit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Min Days:</span>
                  <span className="text-white font-semibold">
                    {template.minDays > 0 ? `${template.minDays} days` : 'None'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => createChallenge(template)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition"
              >
                Start Challenge
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const template = challengeTemplates.find((t) => t.id === activeChallenge.challenge_type);
  const profitLoss = activeChallenge.current_balance - activeChallenge.starting_balance;
  const profitProgress = (profitLoss / activeChallenge.profit_target) * 100;
  const drawdown = activeChallenge.starting_balance - activeChallenge.current_balance;
  const drawdownPercent = (drawdown / activeChallenge.max_loss) * 100;
  const daysProgress = (activeChallenge.days_traded / activeChallenge.min_trading_days) * 100;

  const canPass =
    profitLoss >= activeChallenge.profit_target &&
    activeChallenge.days_traded >= activeChallenge.min_trading_days &&
    drawdown <= activeChallenge.max_loss;

  const hasFailed = drawdown >= activeChallenge.max_loss;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mock Evaluation: {template?.name}</h1>
          <p className="text-slate-400">Track your progress and master the rules</p>
        </div>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to end this challenge?')) {
              endChallenge('failed');
            }
          }}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
        >
          End Challenge
        </button>
      </div>

      {hasFailed && (
        <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div>
              <div className="text-xl font-bold text-red-400">Challenge Failed</div>
              <div className="text-slate-300">
                You exceeded the maximum loss limit. Time to analyze what went wrong and try again.
              </div>
            </div>
          </div>
        </div>
      )}

      {canPass && !hasFailed && (
        <div className="bg-emerald-500/10 border border-emerald-500 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-emerald-400" />
              <div>
                <div className="text-xl font-bold text-emerald-400">Ready to Pass!</div>
                <div className="text-slate-300">You've met all requirements. Congratulations!</div>
              </div>
            </div>
            <button
              onClick={() => endChallenge('passed')}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition"
            >
              Complete Challenge
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-400 text-sm">Current Balance</div>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            ${activeChallenge.current_balance.toLocaleString()}
          </div>
          <div className={`text-sm font-semibold ${profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString()} P/L
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-400 text-sm">Drawdown</div>
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            ${drawdown.toLocaleString()}
          </div>
          <div className="text-sm text-slate-400">
            {drawdownPercent.toFixed(1)}% of max
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-400 text-sm">Trading Days</div>
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {activeChallenge.days_traded}
          </div>
          <div className="text-sm text-slate-400">
            of {activeChallenge.min_trading_days} required
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Profit Progress</h2>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-slate-400">Target: ${activeChallenge.profit_target.toLocaleString()}</span>
              <span className="text-emerald-400 font-bold">{profitProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(profitProgress, 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <span className="text-slate-300">Current Profit</span>
              <span className="text-emerald-400 font-bold text-lg">
                ${Math.max(profitLoss, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <span className="text-slate-300">Still Needed</span>
              <span className="text-white font-bold text-lg">
                ${Math.max(activeChallenge.profit_target - profitLoss, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Risk Limits</h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Max Drawdown</span>
                <span className="text-red-400 font-bold">{drawdownPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    drawdownPercent > 80 ? 'bg-red-500' : drawdownPercent > 50 ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min(drawdownPercent, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-sm">
                <span className="text-slate-500">$0</span>
                <span className="text-slate-500">${activeChallenge.max_loss.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Minimum Days</span>
                <span className="text-blue-400 font-bold">{daysProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(daysProgress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-sm">
                <span className="text-slate-500">0 days</span>
                <span className="text-slate-500">{activeChallenge.min_trading_days} days</span>
              </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-orange-400 font-semibold mb-1">Daily Loss Limit</div>
                  <div className="text-sm text-slate-300">
                    Max ${activeChallenge.daily_loss_limit.toLocaleString()} per day
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Challenge Rules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">✓</span>
            <div>
              <div className="text-white font-semibold">Profit Target</div>
              <div className="text-slate-400">Reach ${activeChallenge.profit_target.toLocaleString()} in profit</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">✓</span>
            <div>
              <div className="text-white font-semibold">Minimum Days</div>
              <div className="text-slate-400">Trade at least {activeChallenge.min_trading_days} different days</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-400 mt-1">×</span>
            <div>
              <div className="text-white font-semibold">Max Drawdown</div>
              <div className="text-slate-400">Don't lose more than ${activeChallenge.max_loss.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-400 mt-1">×</span>
            <div>
              <div className="text-white font-semibold">Daily Loss Limit</div>
              <div className="text-slate-400">Max ${activeChallenge.daily_loss_limit.toLocaleString()} loss per day</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

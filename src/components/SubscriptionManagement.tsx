import { useState, useEffect } from 'react';
import { X, Crown, TrendingUp, Rocket, Check, ArrowRight, AlertCircle } from 'lucide-react';
import { useSubscription, SubscriptionTier } from '../hooks/useSubscription';

interface SubscriptionManagementProps {
  onClose: () => void;
}

export default function SubscriptionManagement({ onClose }: SubscriptionManagementProps) {
  const { subscription, loading, upgradeTier, cancelSubscription } = useSubscription();
  const [upgrading, setUpgrading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    setUpgrading(true);
    const success = await upgradeTier(tier);
    setUpgrading(false);

    if (success) {
      setMessage({ type: 'success', text: `Successfully upgraded to ${tier.toUpperCase()} tier!` });
    } else {
      setMessage({ type: 'error', text: 'Failed to upgrade subscription. Please try again.' });
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    const success = await cancelSubscription();
    setCancelling(false);
    setShowCancelConfirm(false);

    if (success) {
      setMessage({ type: 'success', text: 'Subscription cancelled. Access continues until period end.' });
    } else {
      setMessage({ type: 'error', text: 'Failed to cancel subscription. Please try again.' });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-300 mt-4">Loading subscription...</p>
        </div>
      </div>
    );
  }

  const currentTier = subscription?.tier || 'free';
  const isActive = subscription?.status === 'active' || subscription?.status === 'trial';

  const tiers = [
    {
      id: 'pro' as SubscriptionTier,
      name: 'Pro Trader',
      price: 50,
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-500',
      features: [
        'Basic Trading Journal (100 entries/month)',
        'TopStep Evaluation Tracker',
        'Basic Performance Metrics',
        '10 Beginner Video Courses',
        'Paper Trading Simulator',
        'Community Forum Access'
      ]
    },
    {
      id: 'elite' as SubscriptionTier,
      name: 'Elite Trader',
      price: 100,
      icon: Crown,
      gradient: 'from-purple-500 to-pink-500',
      popular: true,
      features: [
        'Unlimited Trading Journal',
        'AI Trading Coach',
        'Advanced Performance Analytics',
        '100+ Video Courses',
        'Live Trading Room',
        'Advanced Strategy Builder',
        'Market Scanner & Backtesting',
        'Multi-Chart Layouts',
        'All Advanced Features'
      ]
    },
    {
      id: 'mentorship' as SubscriptionTier,
      name: 'Mentorship',
      price: 500,
      icon: Rocket,
      gradient: 'from-orange-500 to-red-500',
      features: [
        'Everything in Elite',
        'One-on-One Coaching Sessions',
        'Weekly Trade Review Calls',
        'Custom Strategy Development',
        'Priority 24/7 Support',
        'Direct Access to Mentors'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Subscription Management</h2>
            <p className="text-slate-400 text-sm mt-1">
              Current Plan: <span className="text-white font-semibold capitalize">{currentTier}</span>
              {subscription?.status === 'trial' && (
                <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Trial</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{message.text}</p>
          </div>
        )}

        <div className="p-6">
          {subscription && subscription.status === 'cancelled' && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <p className="text-yellow-400">
                Your subscription has been cancelled and will end on{' '}
                <strong>{new Date(subscription.current_period_end).toLocaleDateString()}</strong>.
                You can reactivate anytime before this date.
              </p>
            </div>
          )}

          {subscription && subscription.status === 'trial' && subscription.trial_ends_at && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <p className="text-blue-400">
                Your free trial ends on{' '}
                <strong>{new Date(subscription.trial_ends_at).toLocaleDateString()}</strong>.
                Upgrade now to continue accessing premium features.
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              const isCurrent = currentTier === tier.id;
              const canUpgrade =
                (currentTier === 'free' || currentTier === 'pro') && tier.id !== 'pro' ||
                currentTier === 'pro' && (tier.id === 'elite' || tier.id === 'mentorship') ||
                currentTier === 'elite' && tier.id === 'mentorship';

              return (
                <div
                  key={tier.id}
                  className={`relative bg-slate-800/50 border rounded-2xl p-6 ${
                    tier.popular ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-700'
                  } ${isCurrent ? 'ring-2 ring-blue-500/50' : ''}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        CURRENT
                      </span>
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-black text-white">${tier.price}</span>
                    <span className="text-slate-400">/month</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full bg-slate-700 text-slate-400 font-semibold py-3 rounded-xl cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : canUpgrade ? (
                    <button
                      onClick={() => handleUpgrade(tier.id)}
                      disabled={upgrading}
                      className={`w-full bg-gradient-to-r ${tier.gradient} text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50`}
                    >
                      {upgrading ? 'Upgrading...' : 'Upgrade Now'}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-slate-700 text-slate-400 font-semibold py-3 rounded-xl cursor-not-allowed"
                    >
                      Not Available
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {isActive && currentTier !== 'free' && (
            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-bold text-white mb-4">Danger Zone</h3>
              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancel Subscription
                </button>
              ) : (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                  <p className="text-red-400 mb-4">
                    Are you sure you want to cancel? You'll lose access to premium features at the end of your billing period.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Keep Subscription
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

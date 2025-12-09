import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Crown, Check, Zap } from 'lucide-react';

const tiers = [
  {
    name: 'Basic',
    price: 0,
    interval: 'forever',
    features: [
      'Paper trading',
      'Basic analytics',
      'Trading journal',
      'Up to 50 trades/month',
      'Community access',
    ]
  },
  {
    name: 'Pro',
    price: 29,
    interval: 'month',
    features: [
      'Everything in Basic',
      'Unlimited trades',
      'Advanced analytics',
      'AI trading coach',
      'TradingView charts',
      'Backtesting',
      'Priority support',
    ],
    popular: true
  },
  {
    name: 'Elite',
    price: 99,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Broker integrations',
      'Live streaming',
      'Private mentorship',
      'API access',
      'Custom indicators',
      'White-label option',
      'Dedicated support',
    ]
  }
];

export default function SubscriptionManager() {
  const { profile } = useAuth();
  const [currentTier, setCurrentTier] = useState('basic');

  useEffect(() => {
    if (profile?.subscription_tier) {
      setCurrentTier(profile.subscription_tier);
    }
  }, [profile]);

  const upgradeTier = async (tier: string) => {
    if (!profile) return;

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await supabase
      .from('profiles')
      .update({
        subscription_tier: tier.toLowerCase(),
        subscription_expires_at: expiresAt.toISOString()
      })
      .eq('id', profile.id);

    setCurrentTier(tier.toLowerCase());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Crown className="w-7 h-7 text-purple-400" />
          Subscription Plans
        </h1>
        <p className="text-slate-400 text-sm">Choose the plan that fits your trading needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier, index) => {
          const isActive = currentTier === tier.name.toLowerCase();

          return (
            <div
              key={index}
              className={`glass-card p-6 relative ${
                tier.popular ? 'border-2 border-purple-500' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-white font-bold text-2xl mb-2">{tier.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">${tier.price}</span>
                  <span className="text-slate-400">/{tier.interval}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => upgradeTier(tier.name)}
                disabled={isActive}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  isActive
                    ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                    : tier.popular
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                {isActive ? 'Current Plan' : tier.price === 0 ? 'Downgrade' : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <p className="text-white font-semibold mb-1">Can I cancel anytime?</p>
            <p className="text-slate-400 text-sm">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-1">Do you offer refunds?</p>
            <p className="text-slate-400 text-sm">We offer a 14-day money-back guarantee for all paid plans if you're not satisfied.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-1">What payment methods do you accept?</p>
            <p className="text-slate-400 text-sm">We accept all major credit cards, PayPal, and cryptocurrency payments.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

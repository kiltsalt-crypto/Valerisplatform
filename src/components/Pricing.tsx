import { Check, Zap, Crown, Sparkles, TrendingUp, Target, Video, Users, Brain, MessageSquare, Trophy, BookOpen, BarChart3, Lock, Star, Rocket, Shield, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const tiers = [
    {
      name: 'Pro Trader',
      price: billingCycle === 'monthly' ? 50 : 40,
      originalPrice: billingCycle === 'monthly' ? null : 50,
      period: billingCycle === 'monthly' ? '/month' : '/month',
      billingNote: billingCycle === 'annual' ? 'Billed annually at $480' : null,
      description: 'Essential tools to start your journey',
      gradient: 'from-blue-500 to-cyan-500',
      icon: TrendingUp,
      features: [
        { text: 'Basic Trading Journal (100 entries/month)', icon: BookOpen },
        { text: 'TopStep Evaluation Tracker', icon: Target },
        { text: 'Basic Performance Metrics', icon: BarChart3 },
        { text: '10 Beginner Video Courses', icon: Video },
        { text: 'Paper Trading Simulator', icon: Zap },
        { text: 'Daily Trading Checklist', icon: Check },
        { text: 'Economic Calendar', icon: Target },
        { text: 'Community Forum Access', icon: MessageSquare },
        { text: 'Basic Risk Calculator', icon: Shield },
        { text: 'Single Chart View', icon: BarChart3 },
        { text: 'Email Support (48hr response)', icon: Shield }
      ],
      cta: 'Start Pro Trial',
      popular: false
    },
    {
      name: 'Elite Trader',
      price: billingCycle === 'monthly' ? 100 : 83,
      originalPrice: billingCycle === 'monthly' ? null : 100,
      period: billingCycle === 'monthly' ? '/month' : '/month',
      billingNote: billingCycle === 'annual' ? 'Billed annually at $996' : null,
      description: 'Complete analytics & advanced tools',
      gradient: 'from-purple-500 to-pink-500',
      icon: Crown,
      features: [
        { text: 'Everything in Pro Trader', icon: Check, emphasized: true },
        { text: 'Unlimited Trading Journal Entries', icon: BookOpen, emphasized: true },
        { text: 'AI Trading Coach & Pattern Recognition', icon: Brain, emphasized: true },
        { text: 'Advanced Performance Analytics Dashboard', icon: BarChart3, emphasized: true },
        { text: '100+ Advanced Video Courses', icon: Video },
        { text: 'Interactive Quizzes & Assessments', icon: Brain },
        { text: 'Live Trading Room Access', icon: Users },
        { text: 'Advanced Strategy Builder', icon: Target },
        { text: 'Market Scanner & Stock Screener', icon: BarChart3 },
        { text: 'Backtesting Engine', icon: TrendingUp },
        { text: 'Trade & Market Replay', icon: TrendingUp },
        { text: 'Multi-Chart Layouts', icon: BarChart3 },
        { text: 'Order Book Level 2 Data', icon: BarChart3 },
        { text: 'Stock Comparison Tools', icon: BarChart3 },
        { text: 'Advanced Heat Maps & Streak Analytics', icon: BarChart3 },
        { text: 'Trade Templates & Strategies Library', icon: BookOpen },
        { text: 'Broker API Integration', icon: Zap },
        { text: 'Custom Alerts & Automation', icon: Zap },
        { text: 'Price Alerts & Notifications', icon: Zap },
        { text: 'Trading Challenges & Competitions', icon: Trophy },
        { text: 'Export Reports & Data', icon: BookOpen },
        { text: 'Priority Support (24hr response)', icon: Shield }
      ],
      cta: 'Upgrade to Elite',
      popular: true
    },
    {
      name: 'Mentorship',
      price: billingCycle === 'monthly' ? 500 : 450,
      originalPrice: billingCycle === 'monthly' ? null : 500,
      period: billingCycle === 'monthly' ? '/month' : '/month',
      billingNote: billingCycle === 'annual' ? 'Billed annually at $5,400' : null,
      description: '1-on-1 guidance from funded traders',
      gradient: 'from-amber-500 to-orange-500',
      icon: Rocket,
      features: [
        { text: 'Everything in Elite Trader', icon: Check, emphasized: true },
        { text: 'Weekly 1-on-1 Coaching Sessions', icon: Users, emphasized: true },
        { text: 'Personalized Trading Plan', icon: Target, emphasized: true },
        { text: 'Direct Access to Funded Traders', icon: Crown },
        { text: 'Live Trade Reviews & Feedback', icon: Video },
        { text: 'Custom Strategy Development', icon: Brain },
        { text: 'Exclusive Mentor Marketplace', icon: Users },
        { text: 'Monthly Performance Reviews', icon: BarChart3 },
        { text: 'Psychology & Mindset Coaching', icon: Brain },
        { text: 'VIP Community Access', icon: MessageSquare },
        { text: 'Early Access to New Features', icon: Rocket },
        { text: 'Direct Message Support (2hr response)', icon: Shield },
        { text: 'Evaluation Day Support', icon: Target },
        { text: 'Lifetime Course Updates', icon: Star },
        { text: 'Accountability & Check-ins', icon: Trophy }
      ],
      cta: 'Apply for Mentorship',
      popular: false,
      exclusive: true
    }
  ];

  const testimonials = [
    {
      name: 'Marcus T.',
      role: 'Passed TopStep 150K',
      quote: 'The TopStep tracker and analytics helped me pass my evaluation in just 12 days. Worth every penny.',
      rating: 5
    },
    {
      name: 'Sarah K.',
      role: 'Funded Trader',
      quote: 'The mentorship tier changed my trading completely. Having a funded trader review my trades weekly was invaluable.',
      rating: 5
    },
    {
      name: 'David L.',
      role: 'Elite Member',
      quote: 'The video courses and AI coach are incredible. I went from losing money to consistent profits in 3 months.',
      rating: 5
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 border border-purple-500/30 p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"></div>

        <div className="relative text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-semibold">Limited Time: Save 20% on Annual Plans</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            Pass Your Evaluation.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              Become Funded.
            </span>
          </h1>

          <p className="text-slate-300 text-xl mb-8 max-w-2xl mx-auto">
            The complete platform to master your trading psychology, track your progress, and pass funded account evaluations.
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-xl font-semibold transition ${
                billingCycle === 'monthly'
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-3 rounded-xl font-semibold transition relative ${
                billingCycle === 'annual'
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-black text-xs font-bold rounded-full">
                Save 20%
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>7-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {tiers.map((tier) => {
          const IconComponent = tier.icon;
          return (
            <div
              key={tier.name}
              className={`relative rounded-3xl transition-all duration-300 hover:scale-105 ${
                tier.popular
                  ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 p-[2px]'
                  : tier.exclusive
                  ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-[2px]'
                  : 'bg-gradient-to-br from-blue-500 to-cyan-500 p-[2px]'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <Zap className="w-4 h-4 text-white fill-white" />
                    <span className="text-white font-bold text-sm">MOST POPULAR</span>
                  </div>
                </div>
              )}

              {tier.exclusive && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <Crown className="w-4 h-4 text-white fill-white" />
                    <span className="text-white font-bold text-sm">EXCLUSIVE</span>
                  </div>
                </div>
              )}

              <div className="bg-slate-900 rounded-3xl p-8 h-full flex flex-col">
                <div className="mb-6">
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${tier.gradient} mb-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-3xl font-black text-white mb-2">{tier.name}</h3>
                  <p className="text-slate-400 mb-6">{tier.description}</p>

                  <div className="flex items-baseline gap-2 mb-2">
                    {tier.originalPrice && (
                      <span className="text-2xl text-slate-500 line-through font-semibold">
                        ${tier.originalPrice}
                      </span>
                    )}
                    <span className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${tier.gradient}`}>
                      ${tier.price}
                    </span>
                    <span className="text-slate-400 font-semibold">{tier.period}</span>
                  </div>

                  {tier.billingNote && (
                    <p className="text-sm text-slate-500">{tier.billingNote}</p>
                  )}
                </div>

                <button
                  className={`w-full py-4 rounded-xl font-bold text-lg mb-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                    tier.popular
                      ? `bg-gradient-to-r ${tier.gradient} text-white shadow-lg shadow-purple-500/30`
                      : tier.exclusive
                      ? `bg-gradient-to-r ${tier.gradient} text-white shadow-lg shadow-amber-500/30`
                      : `bg-gradient-to-r ${tier.gradient} text-white shadow-lg shadow-blue-500/30`
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {tier.cta}
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </button>

                <div className="border-t border-slate-800 pt-6 space-y-3 flex-grow">
                  {tier.features.map((feature, index) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <div
                        key={index}
                        className={`flex items-start gap-3 ${
                          feature.emphasized ? 'bg-slate-800/50 p-2 rounded-lg' : ''
                        }`}
                      >
                        <div className={`flex-shrink-0 p-1 rounded-lg ${
                          feature.emphasized
                            ? `bg-gradient-to-br ${tier.gradient}`
                            : 'bg-green-500/20'
                        }`}>
                          <FeatureIcon className={`w-4 h-4 ${
                            feature.emphasized ? 'text-white' : 'text-green-400'
                          }`} />
                        </div>
                        <span className={`text-sm ${
                          feature.emphasized ? 'text-white font-semibold' : 'text-slate-300'
                        }`}>
                          {feature.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Trusted by Funded Traders Worldwide
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-slate-300 mb-4 italic">"{testimonial.quote}"</p>
              <div>
                <p className="text-white font-bold">{testimonial.name}</p>
                <p className="text-slate-500 text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-3xl p-8">
          <Target className="w-12 h-12 text-blue-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">Built for Evaluation Success</h3>
          <p className="text-slate-300 mb-4">
            Track your TopStep, Apex, or other funded account evaluations with specialized tools designed to help you stay disciplined and consistent.
          </p>
          <div className="flex items-center gap-2 text-blue-400 font-semibold">
            <span>Evaluation-focused tools</span>
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-3xl p-8">
          <Brain className="w-12 h-12 text-purple-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">AI-Powered Learning</h3>
          <p className="text-slate-300 mb-4">
            Our AI coach analyzes your trades, identifies patterns, and provides personalized improvement suggestions based on your trading style.
          </p>
          <div className="flex items-center gap-2 text-purple-400 font-semibold">
            <span>Smart recommendations daily</span>
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div>
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              Can I cancel anytime?
            </h3>
            <p className="text-slate-400 text-sm">
              Yes! Cancel anytime from your account settings. You'll retain access until the end of your billing period, and we'll never charge you again.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              Is there a money-back guarantee?
            </h3>
            <p className="text-slate-400 text-sm">
              Absolutely. Try any plan risk-free for 7 days. If you're not satisfied, we'll refund you in full, no questions asked.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              What if I'm already trading live?
            </h3>
            <p className="text-slate-400 text-sm">
              Perfect! Our analytics, journaling, and coaching work for both evaluation traders and funded traders looking to improve their edge.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              Who are the mentors?
            </h3>
            <p className="text-slate-400 text-sm">
              All mentors are verified funded traders with TopStep, Apex, or similar firms. Many manage 6-figure accounts and have passed multiple evaluations.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              Can I upgrade or downgrade?
            </h3>
            <p className="text-slate-400 text-sm">
              Yes! Change your plan anytime. Upgrades take effect immediately, downgrades at the next billing cycle.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              Is this suitable for beginners?
            </h3>
            <p className="text-slate-400 text-sm">
              Absolutely! We have comprehensive courses starting from the basics. Many members started with zero trading experience.
            </p>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 p-12 text-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative">
          <Rocket className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white mb-4">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Start your journey to becoming a funded trader with the most comprehensive trading journal and analytics platform.
          </p>
          <button className="bg-white text-black font-bold px-10 py-5 rounded-xl text-lg hover:scale-105 transition-transform shadow-2xl inline-flex items-center gap-3">
            Start Your Free 7-Day Trial
            <ChevronRight className="w-6 h-6" />
          </button>
          <p className="text-white/70 text-sm mt-4">
            No credit card required • Cancel anytime • Full access
          </p>
        </div>
      </div>
    </div>
  );
}

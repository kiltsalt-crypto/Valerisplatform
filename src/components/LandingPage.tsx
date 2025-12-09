import { ArrowRight, TrendingUp, BarChart3, Brain, Target, Shield, Zap, Users, Crown, Check } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-700 rounded-xl blur-lg opacity-60 group-hover:opacity-80 transition-all duration-300"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-xl shadow-2xl shadow-blue-600/40 transform group-hover:scale-105 transition-transform duration-200 border border-blue-400/20">
                <TrendingUp className="w-7 h-7 text-white" strokeWidth={3} />
              </div>
            </div>
            <div className="flex flex-col -space-y-0.5">
              <span className="text-3xl font-black text-white tracking-tight">Valeris</span>
              <span className="text-xs font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 text-transparent bg-clip-text uppercase tracking-wider">Futures Trading Mastery</span>
            </div>
          </div>
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-500 hover:via-cyan-500 hover:to-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105"
          >
            Get Started Free
          </button>
        </div>
      </header>

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-black text-white mb-6">
            Master Your Trading.<br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 text-transparent bg-clip-text">
              Pass Your Evaluation.
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            The complete platform for day traders to track performance, analyze patterns, and develop the discipline needed to pass funded account evaluations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-500 hover:via-cyan-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onGetStarted}
              className="bg-slate-800 border border-slate-700 hover:border-blue-500/50 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-700 transition-all hover:shadow-lg hover:shadow-blue-500/20"
            >
              View Pricing
            </button>
          </div>
          <p className="text-slate-400 mt-4">7-day free trial. No credit card required.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: 'AI-Powered Insights',
              description: 'Get personalized coaching and pattern recognition to improve your trading decisions.',
              gradient: 'from-blue-500 to-cyan-500'
            },
            {
              icon: BarChart3,
              title: 'Advanced Analytics',
              description: 'Track every metric that matters with comprehensive performance dashboards and heat maps.',
              gradient: 'from-purple-500 to-pink-500'
            },
            {
              icon: Target,
              title: 'Evaluation Tracker',
              description: 'Monitor your TopStep, Apex, or funded account evaluation progress in real-time.',
              gradient: 'from-orange-500 to-red-500'
            }
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:border-slate-600 transition-colors">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-300">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-black text-white mb-6">Why Traders Choose Valeris</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {[
              { icon: Shield, text: 'Secure & Private' },
              { icon: Zap, text: 'Lightning Fast' },
              { icon: Users, text: 'Active Community' },
              { icon: Crown, text: 'Premium Features' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-white">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-slate-300">Choose the plan that fits your trading goals</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: 'Pro Trader',
              price: 50,
              gradient: 'from-blue-500 to-cyan-500',
              features: [
                'Basic Trading Journal (100 entries/month)',
                'TopStep Tracker',
                'Basic Performance Metrics',
                '10 Video Courses',
                'Paper Trading',
                'Community Access'
              ]
            },
            {
              name: 'Elite Trader',
              price: 100,
              gradient: 'from-purple-500 to-pink-500',
              popular: true,
              features: [
                'Unlimited Trading Journal',
                'AI Trading Coach',
                'Advanced Analytics',
                '100+ Video Courses',
                'Live Trading Room',
                'Strategy Builder',
                'Market Scanner',
                'All Premium Features'
              ]
            },
            {
              name: 'Mentorship',
              price: 500,
              gradient: 'from-orange-500 to-red-500',
              features: [
                'Everything in Elite',
                'One-on-One Coaching',
                'Weekly Trade Reviews',
                'Custom Strategies',
                'Priority Support',
                'Direct Mentor Access'
              ]
            }
          ].map((tier, idx) => (
            <div
              key={idx}
              className={`relative bg-slate-800/50 border rounded-2xl p-8 ${
                tier.popular ? 'border-purple-500 ring-2 ring-purple-500/20 scale-105' : 'border-slate-700'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-black text-white">${tier.price}</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className={`w-full bg-gradient-to-r ${tier.gradient} text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-black text-white mb-4">Ready to Level Up Your Trading?</h2>
          <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
            Join traders who are using Valeris to develop the consistency and discipline needed for funded trading.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-blue-600 font-bold px-10 py-5 rounded-xl text-lg hover:scale-105 transition-transform shadow-2xl inline-flex items-center gap-3"
          >
            Start Your Free Trial
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-white/80 mt-4">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      <footer className="border-t border-slate-700 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
            <p>&copy; 2025 Valeris. All rights reserved.</p>
            <div className="flex gap-6">
              <button className="hover:text-white transition-colors">Terms of Service</button>
              <button className="hover:text-white transition-colors">Privacy Policy</button>
              <button className="hover:text-white transition-colors">Risk Disclaimer</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

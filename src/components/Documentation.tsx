import { useState } from 'react';
import { X, BookOpen, Search, TrendingUp, BarChart3, Brain, Shield, Zap, Target, Users, Award, Video, MessageSquare } from 'lucide-react';

interface DocumentationProps {
  onClose: () => void;
}

export default function Documentation({ onClose }: DocumentationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Zap,
      color: 'blue',
      articles: [
        {
          title: 'Quick Start Guide',
          content: 'Learn the basics of Valeris in 5 minutes. Set up your profile, create your first trade entry, and start tracking your performance.'
        },
        {
          title: 'Setting Up Your Profile',
          content: 'Customize your trading profile with your preferred instruments, risk tolerance, and trading goals.'
        },
        {
          title: 'Understanding Subscription Tiers',
          content: 'Compare Pro, Elite, and Mentorship tiers to find the right plan for your trading journey.'
        }
      ]
    },
    {
      id: 'trading-journal',
      title: 'Trading Journal',
      icon: BookOpen,
      color: 'purple',
      articles: [
        {
          title: 'Creating a Trade Entry',
          content: 'Log your trades with detailed information including entry/exit prices, position size, stop loss, take profit, and trade notes.'
        },
        {
          title: 'Adding Screenshots and Charts',
          content: 'Capture and attach screenshots of your trades to review your setups and analyze what worked.'
        },
        {
          title: 'Using Trade Tags',
          content: 'Organize your trades with custom tags to identify patterns and filter by strategy type.'
        },
        {
          title: 'Trade Templates',
          content: 'Create reusable trade templates for your favorite strategies to log trades faster.'
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Performance',
      icon: BarChart3,
      color: 'green',
      articles: [
        {
          title: 'Understanding Your Dashboard',
          content: 'Navigate the analytics dashboard to view win rate, profit factor, average win/loss, and more.'
        },
        {
          title: 'Performance Metrics Explained',
          content: 'Learn what each metric means: win rate, expectancy, profit factor, Sharpe ratio, and maximum drawdown.'
        },
        {
          title: 'Heat Maps and Pattern Analysis',
          content: 'Visualize your trading patterns by time of day, day of week, and market conditions.'
        },
        {
          title: 'Advanced Analytics (Elite Tier)',
          content: 'Access advanced metrics including psychological analysis, streak tracking, and predictive insights.'
        }
      ]
    },
    {
      id: 'ai-coach',
      title: 'AI Trading Coach',
      icon: Brain,
      color: 'pink',
      articles: [
        {
          title: 'Introduction to AI Coach',
          content: 'Your personal AI trading coach analyzes your trades and provides personalized recommendations.'
        },
        {
          title: 'Pattern Recognition',
          content: 'The AI identifies recurring patterns in your trading behavior and highlights areas for improvement.'
        },
        {
          title: 'Getting Personalized Advice',
          content: 'Ask the AI coach questions about your performance, risk management, or trading psychology.'
        },
        {
          title: 'Weekly AI Reports',
          content: 'Receive automated weekly performance reports with actionable insights and suggestions.'
        }
      ]
    },
    {
      id: 'risk-management',
      title: 'Risk Management',
      icon: Shield,
      color: 'orange',
      articles: [
        {
          title: 'Position Sizing Calculator',
          content: 'Calculate the optimal position size based on your account size, risk tolerance, and stop loss distance.'
        },
        {
          title: 'Setting Stop Losses',
          content: 'Best practices for setting effective stop losses that protect your capital without getting stopped out prematurely.'
        },
        {
          title: 'Risk Per Trade Guidelines',
          content: 'Learn the 1-2% rule and why protecting capital is more important than making money.'
        },
        {
          title: 'Portfolio Risk Management',
          content: 'Manage risk across multiple positions and avoid overexposure to correlated instruments.'
        }
      ]
    },
    {
      id: 'evaluation-tracker',
      title: 'Evaluation Tracker',
      icon: Target,
      color: 'cyan',
      articles: [
        {
          title: 'Setting Up TopStep Tracking',
          content: 'Connect your TopStep evaluation account and track your progress in real-time.'
        },
        {
          title: 'Understanding Evaluation Rules',
          content: 'Review common evaluation rules including profit targets, max loss limits, and daily loss limits.'
        },
        {
          title: 'Strategies for Passing',
          content: 'Proven strategies to increase your chances of passing funded account evaluations.'
        },
        {
          title: 'Mock Evaluations',
          content: 'Practice with simulated evaluations before risking real money on actual evaluation accounts.'
        }
      ]
    },
    {
      id: 'education',
      title: 'Education & Learning',
      icon: Video,
      color: 'indigo',
      articles: [
        {
          title: 'Video Course Library',
          content: 'Access structured video courses covering technical analysis, strategies, and trading psychology.'
        },
        {
          title: 'Taking Quizzes',
          content: 'Test your knowledge with interactive quizzes after completing each learning module.'
        },
        {
          title: 'Learning Paths',
          content: 'Follow curated learning paths from beginner to advanced based on your experience level.'
        },
        {
          title: 'Certification Programs',
          content: 'Earn certificates by completing comprehensive trading education programs.'
        }
      ]
    },
    {
      id: 'community',
      title: 'Community & Social',
      icon: Users,
      color: 'teal',
      articles: [
        {
          title: 'Joining the Forum',
          content: 'Participate in community discussions, ask questions, and share your trading experiences.'
        },
        {
          title: 'Finding a Mentor',
          content: 'Browse the mentor marketplace to find experienced traders offering personalized coaching.'
        },
        {
          title: 'Trading Room Access',
          content: 'Join live trading rooms to watch experienced traders in action and learn in real-time.'
        },
        {
          title: 'Leaderboards and Challenges',
          content: 'Compete in trading challenges and climb the leaderboards to earn recognition and prizes.'
        }
      ]
    },
    {
      id: 'advanced-features',
      title: 'Advanced Features',
      icon: Award,
      color: 'red',
      articles: [
        {
          title: 'Strategy Builder',
          content: 'Create and test custom trading strategies with our visual strategy builder tool.'
        },
        {
          title: 'Backtesting Engine',
          content: 'Test your strategies against historical data to validate their effectiveness.'
        },
        {
          title: 'Market Scanner',
          content: 'Scan thousands of instruments for trading opportunities based on your criteria.'
        },
        {
          title: 'Broker Integration',
          content: 'Connect your broker account for automated trade logging and real-time synchronization.'
        },
        {
          title: 'Custom Alerts',
          content: 'Set up advanced alerts for price levels, technical indicators, and news events.'
        }
      ]
    }
  ];

  const filteredCategories = categories.filter(category => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const titleMatch = category.title.toLowerCase().includes(query);
    const articleMatch = category.articles.some(article =>
      article.title.toLowerCase().includes(query) ||
      article.content.toLowerCase().includes(query)
    );

    return titleMatch || articleMatch;
  });

  const selectedCat = categories.find(c => c.id === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Documentation</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!selectedCategory ? (
            <div className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => {
                  const Icon = category.icon;
                  const colorClasses = {
                    blue: 'from-blue-500 to-cyan-500',
                    green: 'from-green-500 to-emerald-500',
                    pink: 'from-pink-500 to-rose-500',
                    orange: 'from-orange-500 to-red-500',
                    cyan: 'from-cyan-500 to-blue-500',
                    indigo: 'from-indigo-500 to-blue-500',
                    teal: 'from-teal-500 to-cyan-500',
                    red: 'from-red-500 to-orange-500'
                  };

                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all hover:scale-105 text-left"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[category.color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{category.title}</h3>
                      <p className="text-slate-400 text-sm">{category.articles.length} articles</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <MessageSquare className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Need More Help?</h3>
                    <p className="text-slate-300 mb-4">
                      Can't find what you're looking for? Our support team and community are here to help.
                    </p>
                    <div className="flex gap-3">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                        Contact Support
                      </button>
                      <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                        Visit Forum
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-blue-400 hover:text-blue-300 transition-colors mb-6 flex items-center gap-2"
              >
                ← Back to Categories
              </button>

              {selectedCat && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                      selectedCat.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                      selectedCat.color === 'green' ? 'from-green-500 to-emerald-500' :
                      selectedCat.color === 'pink' ? 'from-pink-500 to-rose-500' :
                      selectedCat.color === 'orange' ? 'from-orange-500 to-red-500' :
                      selectedCat.color === 'cyan' ? 'from-cyan-500 to-blue-500' :
                      selectedCat.color === 'indigo' ? 'from-indigo-500 to-blue-500' :
                      selectedCat.color === 'teal' ? 'from-teal-500 to-cyan-500' :
                      'from-red-500 to-orange-500'
                    } flex items-center justify-center`}>
                      {(() => {
                        const Icon = selectedCat.icon;
                        return <Icon className="w-7 h-7 text-white" />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">{selectedCat.title}</h2>
                      <p className="text-slate-400">{selectedCat.articles.length} articles in this category</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedCat.articles.map((article, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
                      >
                        <h3 className="text-xl font-bold text-white mb-3">{article.title}</h3>
                        <p className="text-slate-300 leading-relaxed">{article.content}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

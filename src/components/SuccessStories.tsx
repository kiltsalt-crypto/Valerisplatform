import { useState } from 'react';
import { Trophy, TrendingUp, DollarSign, Quote, Star, Award } from 'lucide-react';

interface Story {
  id: string;
  name: string;
  role: string;
  image: string;
  achievement: string;
  stats: {
    label: string;
    value: string;
  }[];
  story: string;
  rating: number;
  fundingCompany?: string;
}

export default function SuccessStories() {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const stories: Story[] = [
    {
      id: '1',
      name: 'Michael Rodriguez',
      role: 'Professional Day Trader',
      image: 'MR',
      achievement: 'Funded $200K with TopStep',
      stats: [
        { label: 'Win Rate', value: '68%' },
        { label: 'Profit Factor', value: '2.4' },
        { label: 'Monthly Return', value: '$12,500' }
      ],
      story: "I started with Valeris as a complete beginner. The educational resources and paper trading simulator helped me develop a solid strategy without risking real money. After 6 months of consistent practice and tracking my trades in the journal, I passed TopStep's evaluation and now trade a $200K funded account. The key was following the risk management principles taught here.",
      rating: 5,
      fundingCompany: 'TopStep'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      role: 'Swing Trader',
      image: 'SC',
      achievement: 'From $5K to $45K in 8 Months',
      stats: [
        { label: 'Account Growth', value: '800%' },
        { label: 'Win Rate', value: '61%' },
        { label: 'Max Drawdown', value: '8.2%' }
      ],
      story: "The analytics dashboard was a game-changer for me. Being able to see exactly where I was losing money and which setups were most profitable transformed my trading. I went from inconsistent results to steady growth. The AI Coach feature also helped me identify bad habits I didn't even know I had. Highly recommend this platform for serious traders.",
      rating: 5
    },
    {
      id: '3',
      name: 'James Patterson',
      role: 'Futures Trader',
      image: 'JP',
      achievement: 'Consistent 15% Monthly Returns',
      stats: [
        { label: 'Average Monthly', value: '15.2%' },
        { label: 'Winning Months', value: '11/12' },
        { label: 'Sharpe Ratio', value: '2.8' }
      ],
      story: "After blowing two accounts, I realized I needed structure and discipline. Valeris's daily checklist and trade templates kept me accountable. The backtesting feature let me validate my strategies before risking capital. Now I trade ES futures full-time and haven't had a losing month in almost a year. This platform literally saved my trading career.",
      rating: 5
    },
    {
      id: '4',
      name: 'Emily Watson',
      role: 'Options Trader',
      image: 'EW',
      achievement: 'Passed 3 Prop Firm Evaluations',
      stats: [
        { label: 'Pass Rate', value: '3/3' },
        { label: 'Combined Funding', value: '$350K' },
        { label: 'Avg Evaluation Time', value: '21 days' }
      ],
      story: "The TopStep tracker and evaluation simulator were invaluable. I practiced the evaluation rules over and over in paper trading until they became second nature. When it came time for the real evaluations, I was confident and prepared. The community forum also connected me with other traders who shared strategies and tips. Worth every penny of the subscription.",
      rating: 5,
      fundingCompany: 'Multiple Firms'
    },
    {
      id: '5',
      name: 'David Kim',
      role: 'Part-Time Trader',
      image: 'DK',
      achievement: 'Replaced Full-Time Income',
      stats: [
        { label: 'Monthly Income', value: '$8,500' },
        { label: 'Hours Traded', value: '2-3/day' },
        { label: 'Success Rate', value: '73%' }
      ],
      story: "I was skeptical about trading while working full-time, but the scanner and alerts system made it possible. I focus on high-probability setups during specific market hours. The risk calculator ensures I never overleverage. After a year of consistent profits, I'm seriously considering going full-time. This platform made trading accessible for someone with limited time.",
      rating: 5
    },
    {
      id: '6',
      name: 'Alexandra Martinez',
      role: 'Technical Analyst',
      image: 'AM',
      achievement: 'Built 6-Figure Portfolio',
      stats: [
        { label: 'Portfolio Value', value: '$127K' },
        { label: 'Starting Capital', value: '$15K' },
        { label: 'Time Period', value: '18 months' }
      ],
      story: "The charting tools and technical indicators are professional-grade. Combined with the journal for tracking my analysis, I've refined my edge significantly. The education center helped me understand advanced concepts like market structure and order flow. Going from $15K to over $100K still feels surreal, but the data in my analytics proves it's real.",
      rating: 5
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Success Stories</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Real traders, real results. See how our platform has helped traders achieve their goals and get funded.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {stories.map((story) => (
          <div
            key={story.id}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all cursor-pointer group"
            onClick={() => setSelectedStory(story)}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {story.image}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">
                  {story.name}
                </h3>
                <p className="text-slate-400 text-sm">{story.role}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(story.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-green-400" />
                <p className="text-green-400 font-semibold text-sm">{story.achievement}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {story.stats.map((stat, idx) => (
                <div key={idx} className="bg-slate-700/50 rounded-lg p-2 text-center">
                  <p className="text-slate-400 text-xs mb-1">{stat.label}</p>
                  <p className="text-white font-bold text-sm">{stat.value}</p>
                </div>
              ))}
            </div>

            <p className="text-slate-300 text-sm line-clamp-3">{story.story}</p>

            <button className="mt-4 w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 py-2 rounded-lg font-semibold text-sm transition-colors">
              Read Full Story
            </button>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-3xl font-black text-white mb-2">1,247</h3>
          <p className="text-slate-300">Traders Funded</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-3xl font-black text-white mb-2">$47M+</h3>
          <p className="text-slate-300">Total Funding Secured</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-3xl font-black text-white mb-2">89%</h3>
          <p className="text-slate-300">Success Rate (Elite Users)</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/10 border border-blue-500/30 rounded-xl p-8">
        <div className="max-w-4xl mx-auto">
          <Quote className="w-12 h-12 text-blue-400 mb-6" />
          <blockquote className="text-2xl text-white font-semibold mb-6">
            "Valeris transformed how I approach trading. The combination of education, analytics, and community support is unmatched. I went from struggling trader to consistently profitable in under a year."
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              TR
            </div>
            <div>
              <p className="text-white font-semibold">Thomas Reynolds</p>
              <p className="text-slate-400 text-sm">Elite Member, $150K Funded</p>
            </div>
          </div>
        </div>
      </div>

      {selectedStory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Success Story</h2>
              <button
                onClick={() => setSelectedStory(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                  {selectedStory.image}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1">{selectedStory.name}</h3>
                  <p className="text-slate-400 mb-2">{selectedStory.role}</p>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(selectedStory.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 inline-flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-green-400" />
                    <div>
                      <p className="text-green-400 font-bold text-lg">{selectedStory.achievement}</p>
                      {selectedStory.fundingCompany && (
                        <p className="text-green-300 text-sm">{selectedStory.fundingCompany}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {selectedStory.stats.map((stat, idx) => (
                  <div key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
                    <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                    <p className="text-white font-bold text-2xl">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h4 className="text-white font-semibold text-lg mb-4">Their Journey</h4>
                <p className="text-slate-300 leading-relaxed">{selectedStory.story}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

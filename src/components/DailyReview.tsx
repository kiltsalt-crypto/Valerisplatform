import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, TrendingUp, TrendingDown, Target, Lightbulb, Heart, CloudRain } from 'lucide-react';

interface DailyReviewData {
  id?: string;
  review_date: string;
  what_went_well: string;
  what_to_improve: string;
  lessons_learned: string;
  emotional_state: string;
  market_conditions: string;
  goals_for_tomorrow: string;
  overall_rating: number;
}

export default function DailyReview() {
  const { user } = useAuth();
  const [hasReviewToday, setHasReviewToday] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [recentReviews, setRecentReviews] = useState<DailyReviewData[]>([]);
  const [formData, setFormData] = useState<DailyReviewData>({
    review_date: new Date().toISOString().split('T')[0],
    what_went_well: '',
    what_to_improve: '',
    lessons_learned: '',
    emotional_state: '',
    market_conditions: '',
    goals_for_tomorrow: '',
    overall_rating: 3,
  });

  useEffect(() => {
    if (user) {
      checkTodayReview();
      fetchRecentReviews();
    }
  }, [user]);

  const checkTodayReview = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('daily_reviews')
      .select('*')
      .eq('user_id', user.id)
      .eq('review_date', today)
      .maybeSingle();

    setHasReviewToday(!!data);

    const now = new Date();
    const endOfTrading = new Date();
    endOfTrading.setHours(16, 0, 0, 0);

    if (!data && now >= endOfTrading) {
      setShowPrompt(true);
    }
  };

  const fetchRecentReviews = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('daily_reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('review_date', { ascending: false })
      .limit(7);

    setRecentReviews(data || []);
  };

  const saveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from('daily_reviews').upsert({
      user_id: user.id,
      ...formData,
    });

    if (error) {
      console.error('Error saving review:', error);
      alert('Failed to save daily review');
      return;
    }

    setShowPrompt(false);
    setHasReviewToday(true);
    fetchRecentReviews();
  };

  const prompts = [
    { icon: TrendingUp, label: 'What went well today?', field: 'what_went_well' },
    { icon: TrendingDown, label: 'What could be improved?', field: 'what_to_improve' },
    { icon: Lightbulb, label: 'Key lessons learned', field: 'lessons_learned' },
    { icon: Heart, label: 'How did you feel today?', field: 'emotional_state' },
    { icon: CloudRain, label: 'Market conditions', field: 'market_conditions' },
    { icon: Target, label: 'Goals for tomorrow', field: 'goals_for_tomorrow' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Daily Trading Review</h1>
        <p className="text-slate-400">Reflect on your trading day and plan for tomorrow</p>
      </div>

      {showPrompt && !hasReviewToday && (
        <div className="bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-blue-500/50 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Calendar className="w-8 h-8 text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Time for Your Daily Review!</h3>
              <p className="text-slate-300 mb-4">
                Take 5 minutes to reflect on today's trading. This helps you identify patterns and improve consistently.
              </p>
              <button
                onClick={() => setShowPrompt(false)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Start Review
              </button>
            </div>
          </div>
        </div>
      )}

      {!hasReviewToday && !showPrompt && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 mb-8">
          <form onSubmit={saveReview} className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Today's Review</h3>
              <p className="text-slate-400">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {prompts.map(({ icon: Icon, label, field }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {label}
                </label>
                <textarea
                  value={formData[field as keyof DailyReviewData] as string}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  placeholder={`Share your thoughts about ${label.toLowerCase()}...`}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Overall Day Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, overall_rating: rating })}
                    className={`flex-1 py-3 rounded-lg font-semibold transition ${
                      formData.overall_rating === rating
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Save Daily Review
            </button>
          </form>
        </div>
      )}

      {hasReviewToday && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 mb-8 text-center">
          <div className="text-5xl mb-2">✅</div>
          <h3 className="text-xl font-bold text-white mb-2">Review Complete!</h3>
          <p className="text-slate-300">
            You've completed your daily review. Great job building the habit!
          </p>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Recent Reviews</h2>
        <div className="space-y-4">
          {recentReviews.map((review) => (
            <div key={review.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">
                    {new Date(review.review_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </h3>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= review.overall_rating ? 'text-yellow-400' : 'text-slate-600'}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {review.what_went_well && (
                <div className="mb-3">
                  <div className="text-sm font-semibold text-emerald-400 mb-1">What Went Well</div>
                  <div className="text-slate-300">{review.what_went_well}</div>
                </div>
              )}

              {review.what_to_improve && (
                <div className="mb-3">
                  <div className="text-sm font-semibold text-orange-400 mb-1">To Improve</div>
                  <div className="text-slate-300">{review.what_to_improve}</div>
                </div>
              )}

              {review.lessons_learned && (
                <div className="mb-3">
                  <div className="text-sm font-semibold text-blue-400 mb-1">Lessons Learned</div>
                  <div className="text-slate-300">{review.lessons_learned}</div>
                </div>
              )}
            </div>
          ))}

          {recentReviews.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No reviews yet. Complete your first review above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

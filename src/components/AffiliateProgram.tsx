import { useState, useEffect } from 'react';
import { X, Users, DollarSign, Link2, Copy, TrendingUp, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AffiliateProgramProps {
  onClose: () => void;
}

export default function AffiliateProgram({ onClose }: AffiliateProgramProps) {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalReferrals: 0, activeReferrals: 0, totalEarnings: 0 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generateOrFetchReferralCode();
      fetchAffiliateData();
    }
  }, [user]);

  const generateOrFetchReferralCode = async () => {
    if (!user) return;

    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('referral_code')
      .eq('referrer_id', user.id)
      .limit(1)
      .maybeSingle();

    if (existingReferral) {
      setReferralCode(existingReferral.referral_code);
    } else {
      const { data } = await supabase.rpc('generate_referral_code');
      if (data) {
        setReferralCode(data);
      }
    }
  };

  const fetchAffiliateData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [{ data: referralsData }, { data: earningsData }] = await Promise.all([
        supabase
          .from('referrals')
          .select(`
            *,
            referred:auth.users!referrals_referred_id_fkey(email)
          `)
          .eq('referrer_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('referral_earnings')
          .select('*, referral:referrals(*)')
          .eq('referral.referrer_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      setReferrals(referralsData || []);
      setEarnings(earningsData || []);

      const totalEarnings = earningsData?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;
      const activeReferrals = referralsData?.filter((r) => r.status === 'active').length || 0;

      setStats({
        totalReferrals: referralsData?.length || 0,
        activeReferrals,
        totalEarnings
      });
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Affiliate Program</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-8 mb-6">
                <h3 className="text-2xl font-bold text-white mb-4">Earn 20% Recurring Commission</h3>
                <p className="text-slate-300 mb-6">
                  Share Valeris with other traders and earn 20% commission on all their subscription payments,
                  every month for as long as they remain active subscribers.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <Users className="w-8 h-8 text-blue-400 mb-2" />
                    <p className="text-2xl font-bold text-white">{stats.totalReferrals}</p>
                    <p className="text-slate-400 text-sm">Total Referrals</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
                    <p className="text-2xl font-bold text-white">{stats.activeReferrals}</p>
                    <p className="text-slate-400 text-sm">Active Referrals</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <DollarSign className="w-8 h-8 text-green-400 mb-2" />
                    <p className="text-2xl font-bold text-white">${stats.totalEarnings.toFixed(2)}</p>
                    <p className="text-slate-400 text-sm">Total Earnings</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Your Referral Links</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Referral Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={referralCode}
                        readOnly
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      />
                      <button
                        onClick={copyReferralCode}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Referral Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={`${window.location.origin}?ref=${referralCode}`}
                        readOnly
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      />
                      <button
                        onClick={copyReferralLink}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        <Link2 className="w-5 h-5" />
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Your Referrals</h3>
                {referrals.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    No referrals yet. Start sharing your link to earn commissions!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {referrals.map((referral) => (
                      <div
                        key={referral.id}
                        className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-white font-medium">{referral.referred?.email || 'User'}</p>
                          <p className="text-slate-400 text-sm">
                            Joined {new Date(referral.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            referral.status === 'active'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                          }`}
                        >
                          {referral.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Earnings History</h3>
                {earnings.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No earnings yet</p>
                ) : (
                  <div className="space-y-3">
                    {earnings.map((earning) => (
                      <div
                        key={earning.id}
                        className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-white font-medium">${earning.amount} {earning.currency}</p>
                          <p className="text-slate-400 text-sm">{earning.description}</p>
                        </div>
                        <p className="text-slate-400 text-sm">
                          {new Date(earning.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">How It Works</h3>
                <ol className="space-y-2 text-slate-300 list-decimal list-inside">
                  <li>Share your unique referral link with other traders</li>
                  <li>When they sign up and subscribe, you earn 20% commission</li>
                  <li>You continue earning as long as they stay subscribed</li>
                  <li>Minimum payout threshold is $50</li>
                  <li>Payments are processed monthly via your preferred method</li>
                </ol>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

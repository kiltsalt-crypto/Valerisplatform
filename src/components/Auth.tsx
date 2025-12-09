import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Zap, Target, Trophy } from 'lucide-react';
import Captcha, { CaptchaRef } from './Captcha';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<CaptchaRef>(null);
  const { signUp, signIn } = useAuth();

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const handleCaptchaError = () => {
    setError('CAPTCHA verification failed. Please try again.');
    setCaptchaToken(null);
  };

  const handleCaptchaExpire = () => {
    setCaptchaToken(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const hasCaptcha = !!import.meta.env.VITE_HCAPTCHA_SITE_KEY;

    if (hasCaptcha && !captchaToken) {
      setError('Please complete the CAPTCHA verification');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      captchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 relative z-10">
        <div className="hidden lg:flex flex-col justify-center space-y-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-xl border border-blue-400/20 shadow-xl">
                  <TrendingUp className="w-10 h-10 text-white" strokeWidth={3} />
                </div>
              </div>
              <div>
                <h1 className="text-gradient from-blue-400 to-blue-500 font-black text-4xl tracking-tight">
                  Valeris
                </h1>
                <p className="text-blue-400/70 text-xs font-bold tracking-widest mt-1">FUTURES TRADING MASTERY</p>
              </div>
            </div>
            <p className="text-slate-300 text-xl leading-relaxed mb-8">
              The ultimate platform for traders serious about passing funded account evaluations and achieving consistent profitability.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-6 bg-slate-800/50 border border-blue-500/20 rounded-2xl hover:border-blue-500/40 transition backdrop-blur-sm">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">12 Expert Modules</h3>
                <p className="text-slate-400 text-sm">From basics to advanced strategies, psychology to TopStep mastery</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-slate-800/50 border border-blue-500/20 rounded-2xl hover:border-blue-500/40 transition backdrop-blur-sm">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl flex-shrink-0">
                <Target className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Mock Evaluations</h3>
                <p className="text-slate-400 text-sm">Practice TopStep and Apex rules before paying hundreds per month</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-slate-800/50 border border-blue-500/20 rounded-2xl hover:border-blue-500/40 transition backdrop-blur-sm">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl flex-shrink-0">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Futures Calculator</h3>
                <p className="text-slate-400 text-sm">Master ES, NQ, CL with real contract specs and position sizing</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-slate-800/50 border border-blue-500/20 rounded-2xl hover:border-blue-500/40 transition backdrop-blur-sm">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl flex-shrink-0">
                <Trophy className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Track Everything</h3>
                <p className="text-slate-400 text-sm">Journal, analytics, achievements, and economic calendar</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center animate-scale-in">
          <div className="w-full max-w-md">
            <div className="glass-effect rounded-3xl shadow-2xl p-8 border border-blue-500/30">
              <div className="flex items-center justify-center mb-8 lg:hidden">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl blur-sm opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 p-2 rounded-xl border border-blue-400/20">
                    <TrendingUp className="w-8 h-8 text-white" strokeWidth={3} />
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-black text-white text-center mb-2">
                {isSignUp ? 'Start Your Journey' : 'Welcome Back'}
              </h2>
              <p className="text-slate-400 text-center mb-8 font-medium">
                {isSignUp ? 'Join Valeris today' : 'Continue mastering your craft'}
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-xl">
                  <p className="text-red-400 text-sm font-semibold">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {isSignUp && (
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-bold text-slate-300 mb-2">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-medium"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-medium"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-slate-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-medium"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                </div>

                <div className="pt-2">
                  <Captcha
                    ref={captchaRef}
                    onVerify={handleCaptchaVerify}
                    onError={handleCaptchaError}
                    onExpire={handleCaptchaExpire}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || (!!import.meta.env.VITE_HCAPTCHA_SITE_KEY && !captchaToken)}
                  className="relative w-full group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-black font-black py-4 rounded-xl transition-all duration-200 group-hover:shadow-2xl flex items-center justify-center gap-2">
                    {loading ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                        <TrendingUp className="w-5 h-5" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="text-slate-400 hover:text-blue-400 transition font-medium text-sm"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>

              {isSignUp && (
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <p className="text-blue-400 text-xs font-semibold text-center">
                    Start with $100,000 virtual capital and unlock all features instantly
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

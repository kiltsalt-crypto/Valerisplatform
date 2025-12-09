import { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import ErrorBoundary from './components/ErrorBoundary';
import Auth from './components/Auth';
import QuickStats from './components/QuickStats';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { Home, BookOpen, TrendingUp, BarChart3, Calculator, Zap, Trophy, Calendar, FileText, Target, LogOut, Menu, X, Bell, Lightbulb, Users, DollarSign, ChevronDown, User, Bot, Briefcase, LineChart, Award, Flame, Upload, Globe, Settings, Eye, PlayCircle, Crown, Link2, Moon, Sun, Search, CheckSquare, Video, Activity, Smartphone, Heart, TrendingDown, Grid, Pencil, RotateCcw, BookOpenIcon, GitCompare, MessageSquare, Brain, Shield, HelpCircle, TicketIcon } from 'lucide-react';

const Dashboard = lazy(() => import('./components/Dashboard'));
const LearningModules = lazy(() => import('./components/LearningModules'));
const PaperTrading = lazy(() => import('./components/PaperTrading'));
const Analytics = lazy(() => import('./components/Analytics'));
const RiskCalculator = lazy(() => import('./components/RiskCalculator'));
const FuturesTrading = lazy(() => import('./components/FuturesTrading'));
const MockEvaluation = lazy(() => import('./components/MockEvaluation'));
const TradingJournal = lazy(() => import('./components/TradingJournal'));
const EconomicCalendar = lazy(() => import('./components/EconomicCalendar'));
const Achievements = lazy(() => import('./components/Achievements'));
const TradeIdeas = lazy(() => import('./components/TradeIdeas'));
const Notifications = lazy(() => import('./components/Notifications'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const Pricing = lazy(() => import('./components/Pricing'));
const Onboarding = lazy(() => import('./components/Onboarding'));
const AICoach = lazy(() => import('./components/AICoach'));
const SocialHub = lazy(() => import('./components/SocialHub'));
const AdvancedAnalytics = lazy(() => import('./components/AdvancedAnalytics'));
const AlertsAutomation = lazy(() => import('./components/AlertsAutomation'));
const PortfolioManager = lazy(() => import('./components/PortfolioManager'));
const EducationCenter = lazy(() => import('./components/EducationCenter'));
const GamificationHub = lazy(() => import('./components/GamificationHub'));
const ImportExport = lazy(() => import('./components/ImportExport'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const MarketNews = lazy(() => import('./components/MarketNews'));
const Watchlist = lazy(() => import('./components/Watchlist'));
const TradeTemplates = lazy(() => import('./components/TradeTemplates'));
const GoalTracker = lazy(() => import('./components/GoalTracker'));
const TradingViewChart = lazy(() => import('./components/TradingViewChart'));
const Backtesting = lazy(() => import('./components/Backtesting'));
const TradingChallenges = lazy(() => import('./components/TradingChallenges'));
// Subscription manager removed - using pricing page for subscriptions
const BrokerIntegration = lazy(() => import('./components/BrokerIntegration'));
const KeyboardShortcutsModal = lazy(() => import('./components/KeyboardShortcutsModal'));
const TradeReplay = lazy(() => import('./components/TradeReplay'));
const PerformanceDashboard = lazy(() => import('./components/PerformanceDashboard'));
const StrategyBuilder = lazy(() => import('./components/StrategyBuilder'));
const MarketScanner = lazy(() => import('./components/MarketScanner'));
const TradeSimulator = lazy(() => import('./components/TradeSimulator'));
const TradingRoom = lazy(() => import('./components/TradingRoom'));
const TradeChecklist = lazy(() => import('./components/TradeChecklist'));
const EconomicImpact = lazy(() => import('./components/EconomicImpact'));
const MentorMarketplace = lazy(() => import('./components/MentorMarketplace'));
const TradingSignals = lazy(() => import('./components/TradingSignals'));
const DailyReview = lazy(() => import('./components/DailyReview'));
const StreakTracker = lazy(() => import('./components/StreakTracker'));
const TradingHeatMap = lazy(() => import('./components/TradingHeatMap'));
const TradeExecutionSimulator = lazy(() => import('./components/TradeExecutionSimulator'));
const PriceAlerts = lazy(() => import('./components/PriceAlerts'));
const MultiChartLayout = lazy(() => import('./components/MultiChartLayout'));
const ChartDrawingTools = lazy(() => import('./components/ChartDrawingTools'));
const MarketReplay = lazy(() => import('./components/MarketReplay'));
const OrderBookLevel2 = lazy(() => import('./components/OrderBookLevel2'));
const StockComparison = lazy(() => import('./components/StockComparison'));
const TradingJournalEnhanced = lazy(() => import('./components/TradingJournalEnhanced'));
const VideoCourseLibrary = lazy(() => import('./components/VideoCourseLibrary'));
const QuizSystem = lazy(() => import('./components/QuizSystem'));
const CommunityForum = lazy(() => import('./components/CommunityForum'));
const TopStepTracker = lazy(() => import('./components/TopStepTracker'));
const UserProfilePage = lazy(() => import('./components/UserProfilePage'));
const DailyChecklistEnhanced = lazy(() => import('./components/DailyChecklistEnhanced'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const MyTickets = lazy(() => import('./components/MyTickets'));
const BusinessMetrics = lazy(() => import('./components/BusinessMetrics'));
const NotificationsCenter = lazy(() => import('./components/NotificationsCenter'));
const SuccessStories = lazy(() => import('./components/SuccessStories'));
const AnalyticsEnhanced = lazy(() => import('./components/AnalyticsEnhanced'));
const TicketSubmission = lazy(() => import('./components/TicketSubmission'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-slate-400">Loading...</p>
    </div>
  </div>
);

type Tab = 'home' | 'learn' | 'trade' | 'futures' | 'journal' | 'analytics' | 'risk' | 'evaluation' | 'calendar' | 'achievements' | 'ideas' | 'notifications' | 'leaderboard' | 'pricing' | 'aicoach' | 'social' | 'advanced-analytics' | 'alerts' | 'portfolio' | 'education' | 'gamification' | 'import' | 'profile' | 'news' | 'watchlist' | 'templates' | 'goals' | 'charts' | 'backtesting' | 'challenges' | 'subscription' | 'brokers' | 'replay' | 'performance' | 'strategy-builder' | 'scanner' | 'simulator' | 'trading-room' | 'checklist' | 'economic-impact' | 'mentors' | 'signals' | 'daily-review' | 'streaks' | 'heatmap' | 'trade-execution' | 'price-alerts' | 'multi-chart' | 'drawing-tools' | 'market-replay' | 'orderbook' | 'comparison' | 'journal-enhanced' | 'video-courses' | 'quizzes' | 'forum' | 'topstep' | 'user-profile' | 'daily-checklist-enhanced' | 'my-tickets' | 'business-metrics' | 'notifications-center' | 'success-stories' | 'analytics-enhanced';

function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navDropdownOpen, setNavDropdownOpen] = useState(false);
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [socialDropdownOpen, setSocialDropdownOpen] = useState(false);
  const [practiceDropdownOpen, setPracticeDropdownOpen] = useState(false);
  const [analyticsDropdownOpen, setAnalyticsDropdownOpen] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (userDropdownOpen && !target.closest('.user-dropdown-container')) {
        setUserDropdownOpen(false);
      }
      if (navDropdownOpen && !target.closest('.nav-dropdown-container')) {
        setNavDropdownOpen(false);
      }
      if (educationDropdownOpen && !target.closest('.education-dropdown-container')) {
        setEducationDropdownOpen(false);
      }
      if (socialDropdownOpen && !target.closest('.social-dropdown-container')) {
        setSocialDropdownOpen(false);
      }
      if (practiceDropdownOpen && !target.closest('.practice-dropdown-container')) {
        setPracticeDropdownOpen(false);
      }
      if (analyticsDropdownOpen && !target.closest('.analytics-dropdown-container')) {
        setAnalyticsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen, navDropdownOpen, educationDropdownOpen, socialDropdownOpen, practiceDropdownOpen, analyticsDropdownOpen]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [profile]);

  const checkOnboardingStatus = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_status')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data || !data.tour_completed) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
    }
  };

  useKeyboardShortcuts((key) => {
    if (key === 'shortcuts') {
      setShowShortcuts(!showShortcuts);
    } else {
      setActiveTab(key as Tab);
    }
  });

  const mainTabs = [
    { id: 'home' as Tab, label: 'Home', icon: Home },
    { id: 'news' as Tab, label: 'Market News', icon: Globe },
    { id: 'charts' as Tab, label: 'Live Charts', icon: BarChart3 },
    { id: 'multi-chart' as Tab, label: 'Multi-Chart', icon: Grid },
    { id: 'comparison' as Tab, label: 'Stock Comparison', icon: GitCompare },
    { id: 'orderbook' as Tab, label: 'Order Book L2', icon: BookOpenIcon },
    { id: 'watchlist' as Tab, label: 'Watchlists', icon: Eye },
    { id: 'portfolio' as Tab, label: 'Portfolio', icon: Briefcase },
    { id: 'journal-enhanced' as Tab, label: 'Trading Journal Pro', icon: FileText },
    { id: 'daily-checklist-enhanced' as Tab, label: 'Daily Checklist', icon: CheckSquare },
    { id: 'brokers' as Tab, label: 'Broker API', icon: Link2 },
    { id: 'import' as Tab, label: 'Import/Export', icon: Upload },
    { id: 'notifications-center' as Tab, label: 'Notifications', icon: Bell },
    { id: 'my-tickets' as Tab, label: 'My Tickets', icon: TicketIcon },
    { id: 'success-stories' as Tab, label: 'Success Stories', icon: Trophy },
  ];

  const educationTabs = [
    { id: 'learn' as Tab, label: 'Learn', icon: BookOpen },
    { id: 'video-courses' as Tab, label: 'Video Courses', icon: Video },
    { id: 'quizzes' as Tab, label: 'Quizzes', icon: Brain },
    { id: 'education' as Tab, label: 'Education Center', icon: Award },
    { id: 'aicoach' as Tab, label: 'AI Coach', icon: Bot },
    { id: 'goals' as Tab, label: 'Goals', icon: Target },
  ];

  const socialTabs = [
    { id: 'forum' as Tab, label: 'Community Forum', icon: MessageSquare },
    { id: 'social' as Tab, label: 'Social Hub', icon: Users },
    { id: 'leaderboard' as Tab, label: 'Leaderboard', icon: Users },
    { id: 'trading-room' as Tab, label: 'Trading Room', icon: Video },
    { id: 'mentors' as Tab, label: 'Mentor Marketplace', icon: Users },
  ];

  const practiceTabs = [
    { id: 'topstep' as Tab, label: 'TopStep Tracker', icon: Target },
    { id: 'trade' as Tab, label: 'Paper Trade', icon: TrendingUp },
    { id: 'trade-execution' as Tab, label: 'Trade Execution', icon: DollarSign },
    { id: 'futures' as Tab, label: 'Futures', icon: Zap },
    { id: 'evaluation' as Tab, label: 'Evaluation', icon: Target },
    { id: 'simulator' as Tab, label: 'Trade Simulator', icon: Calculator },
    { id: 'backtesting' as Tab, label: 'Backtesting', icon: PlayCircle },
    { id: 'replay' as Tab, label: 'Trade Replay', icon: PlayCircle },
    { id: 'market-replay' as Tab, label: 'Market Replay', icon: RotateCcw },
    { id: 'strategy-builder' as Tab, label: 'Strategy Builder', icon: Target },
    { id: 'gamification' as Tab, label: 'Challenges', icon: Flame },
    { id: 'achievements' as Tab, label: 'Achievements', icon: Trophy },
  ];

  const analyticsTabs = [
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
    { id: 'analytics-enhanced' as Tab, label: 'Analytics Pro', icon: LineChart },
    { id: 'advanced-analytics' as Tab, label: 'Advanced Analytics', icon: LineChart },
    { id: 'business-metrics' as Tab, label: 'Business Metrics', icon: DollarSign },
    { id: 'performance' as Tab, label: 'Performance', icon: Activity },
    { id: 'heatmap' as Tab, label: 'Heat Map', icon: Activity },
    { id: 'streaks' as Tab, label: 'Win/Loss Streaks', icon: TrendingDown },
    { id: 'scanner' as Tab, label: 'Market Scanner', icon: Search },
    { id: 'calendar' as Tab, label: 'Economic Calendar', icon: Calendar },
    { id: 'economic-impact' as Tab, label: 'Economic Impact', icon: Calendar },
    { id: 'alerts' as Tab, label: 'Alerts', icon: Bell },
    { id: 'price-alerts' as Tab, label: 'Price Alerts', icon: Bell },
    { id: 'signals' as Tab, label: 'Trading Signals', icon: Smartphone },
    { id: 'risk' as Tab, label: 'Risk Tools', icon: Calculator },
    { id: 'ideas' as Tab, label: 'Trade Ideas', icon: Lightbulb },
    { id: 'templates' as Tab, label: 'Templates', icon: FileText },
    { id: 'drawing-tools' as Tab, label: 'Drawing Tools', icon: Pencil },
    { id: 'checklist' as Tab, label: 'Trade Checklist', icon: CheckSquare },
    { id: 'daily-review' as Tab, label: 'Daily Review', icon: Heart },
  ];

  const allTabs = [...mainTabs, ...educationTabs, ...socialTabs, ...practiceTabs, ...analyticsTabs];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <nav className="glass-effect border-b border-blue-500/20 sticky top-0 z-50 backdrop-blur-xl">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 gap-2">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-700 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 p-2.5 rounded-xl shadow-xl shadow-blue-600/30 transform group-hover:scale-105 transition-transform duration-200 border border-blue-400/20">
                  <TrendingUp className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
              </div>
              <div className="flex flex-col -space-y-0.5">
                <h1 className="font-black text-lg text-white tracking-tight">Valeris</h1>
                <span className="text-[10px] font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 text-transparent bg-clip-text uppercase tracking-wider">Futures Trading Mastery</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 flex-grow justify-center">
              <div className="relative nav-dropdown-container">
                <button
                  onClick={() => setNavDropdownOpen(!navDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 text-white rounded-lg transition-all duration-200 font-semibold text-sm"
                >
                  <Home className="w-4 h-4" />
                  Main
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${navDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {navDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-blue-500/20 rounded-lg shadow-xl overflow-hidden z-50 animate-fade-in">
                    <div className="p-2 space-y-1">
                      {mainTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id);
                              setNavDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left ${
                              activeTab === tab.id
                                ? 'bg-blue-500/20 text-blue-400 font-semibold'
                                : 'text-slate-300 hover:bg-slate-800/50 hover:text-blue-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative education-dropdown-container">
                <button
                  onClick={() => setEducationDropdownOpen(!educationDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-green-500/50 text-white rounded-lg transition-all duration-200 font-semibold text-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  Education
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${educationDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {educationDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-green-500/20 rounded-lg shadow-xl overflow-hidden z-50 animate-fade-in">
                    <div className="p-2 space-y-1">
                      {educationTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id);
                              setEducationDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left ${
                              activeTab === tab.id
                                ? 'bg-green-500/20 text-green-400 font-semibold'
                                : 'text-slate-300 hover:bg-slate-800/50 hover:text-green-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative social-dropdown-container">
                <button
                  onClick={() => setSocialDropdownOpen(!socialDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 text-white rounded-lg transition-all duration-200 font-semibold text-sm"
                >
                  <Users className="w-4 h-4" />
                  Social
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${socialDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {socialDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-blue-500/20 rounded-lg shadow-xl overflow-hidden z-50 animate-fade-in">
                    <div className="p-2 space-y-1">
                      {socialTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id);
                              setSocialDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left ${
                              activeTab === tab.id
                                ? 'bg-blue-500/20 text-blue-400 font-semibold'
                                : 'text-slate-300 hover:bg-slate-800/50 hover:text-blue-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative practice-dropdown-container">
                <button
                  onClick={() => setPracticeDropdownOpen(!practiceDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-orange-500/50 text-white rounded-lg transition-all duration-200 font-semibold text-sm"
                >
                  <TrendingUp className="w-4 h-4" />
                  Practice
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${practiceDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {practiceDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-orange-500/20 rounded-lg shadow-xl overflow-hidden z-50 animate-fade-in">
                    <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
                      {practiceTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id);
                              setPracticeDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left ${
                              activeTab === tab.id
                                ? 'bg-orange-500/20 text-orange-400 font-semibold'
                                : 'text-slate-300 hover:bg-slate-800/50 hover:text-orange-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative analytics-dropdown-container">
                <button
                  onClick={() => setAnalyticsDropdownOpen(!analyticsDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-white rounded-lg transition-all duration-200 font-semibold text-sm"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${analyticsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {analyticsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-cyan-500/20 rounded-lg shadow-xl overflow-hidden z-50 animate-fade-in">
                    <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
                      {analyticsTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id);
                              setAnalyticsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left ${
                              activeTab === tab.id
                                ? 'bg-cyan-500/20 text-cyan-400 font-semibold'
                                : 'text-slate-300 hover:bg-slate-800/50 hover:text-cyan-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setShowTicketForm(true)}
                  className="p-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-lg transition-all duration-200 group"
                  title="Submit Support Ticket"
                >
                  <HelpCircle className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/30 rounded-lg border border-blue-500/20">
                  <DollarSign className="w-4 h-4 text-blue-400" />
                  <span className="text-gradient from-blue-400 to-blue-600 font-bold text-sm">
                    {profile?.current_capital ? Number(profile.current_capital).toLocaleString() : '0'}
                  </span>
                </div>
              </div>

              <div className="relative hidden md:block user-dropdown-container">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-lg transition-all duration-200"
                >
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-xs font-semibold">{profile?.full_name || 'User'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-blue-500/20 rounded-lg shadow-xl overflow-hidden z-50 animate-fade-in">
                    <div className="p-3 border-b border-slate-800">
                      <p className="text-white font-semibold text-sm">{profile?.full_name || 'User'}</p>
                      <p className="text-slate-400 text-xs">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <div className="px-3 py-2 rounded hover:bg-slate-800/50">
                        <p className="text-slate-400 text-xs">Balance</p>
                        <p className="text-blue-400 font-bold">${profile?.current_capital ? Number(profile.current_capital).toLocaleString() : '0'}</p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('user-profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-300 hover:bg-slate-800/50 hover:text-blue-400 rounded transition text-sm"
                      >
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('subscription');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-300 hover:bg-slate-800/50 hover:text-blue-400 rounded transition text-sm"
                      >
                        <Crown className="w-4 h-4" />
                        <span>Subscription</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowAdminDashboard(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-300 hover:bg-slate-800/50 hover:text-red-400 rounded transition text-sm"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-300 hover:bg-slate-800/50 hover:text-blue-400 rounded transition text-sm"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <ThemeToggleButton />
                      <button
                        onClick={() => {
                          signOut();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-400 hover:bg-slate-800/50 rounded transition text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-blue-400 hover:bg-slate-800 rounded-lg transition"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between px-5 py-3 bg-slate-800/30 rounded-xl border border-blue-500/20 mb-3">
                <div>
                  <p className="text-slate-400 text-xs">Balance</p>
                  <p className="text-gradient from-blue-400 to-blue-600 font-bold text-lg">
                    ${profile?.current_capital ? Number(profile.current_capital).toLocaleString() : '0'}
                  </p>
                </div>
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
              {allTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg font-bold'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-blue-400 font-semibold'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-5 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl transition font-semibold"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
        <Suspense fallback={<LoadingFallback />}>
          {activeTab === 'home' && (
            <>
              <QuickStats />
              <div className="mt-4">
                <Dashboard />
              </div>
            </>
          )}
          {activeTab === 'profile' && <UserProfile />}
          {activeTab === 'user-profile' && <UserProfilePage />}
          {activeTab === 'journal-enhanced' && <TradingJournalEnhanced />}
          {activeTab === 'video-courses' && <VideoCourseLibrary />}
          {activeTab === 'quizzes' && <QuizSystem />}
          {activeTab === 'forum' && <CommunityForum />}
          {activeTab === 'topstep' && <TopStepTracker />}
          {activeTab === 'daily-checklist-enhanced' && <DailyChecklistEnhanced />}
          {activeTab === 'news' && <MarketNews />}
          {activeTab === 'charts' && <TradingViewChart />}
          {activeTab === 'multi-chart' && <MultiChartLayout />}
          {activeTab === 'comparison' && <StockComparison />}
          {activeTab === 'orderbook' && <OrderBookLevel2 />}
          {activeTab === 'watchlist' && <Watchlist />}
          {activeTab === 'templates' && <TradeTemplates />}
          {activeTab === 'goals' && <GoalTracker />}
          {activeTab === 'backtesting' && <Backtesting />}
          {activeTab === 'trade-execution' && <TradeExecutionSimulator />}
          {activeTab === 'price-alerts' && <PriceAlerts />}
          {activeTab === 'drawing-tools' && <ChartDrawingTools />}
          {activeTab === 'market-replay' && <MarketReplay />}
          {activeTab === 'challenges' && <TradingChallenges />}
          {activeTab === 'subscription' && <Pricing />}
          {activeTab === 'brokers' && <BrokerIntegration />}
          {activeTab === 'replay' && <TradeReplay />}
          {activeTab === 'performance' && <PerformanceDashboard />}
          {activeTab === 'strategy-builder' && <StrategyBuilder />}
          {activeTab === 'scanner' && <MarketScanner />}
          {activeTab === 'simulator' && <TradeSimulator />}
          {activeTab === 'trading-room' && <TradingRoom />}
          {activeTab === 'checklist' && <TradeChecklist />}
          {activeTab === 'economic-impact' && <EconomicImpact />}
          {activeTab === 'mentors' && <MentorMarketplace />}
          {activeTab === 'signals' && <TradingSignals />}
          {activeTab === 'aicoach' && <AICoach />}
          {activeTab === 'social' && <SocialHub />}
          {activeTab === 'learn' && <LearningModules />}
          {activeTab === 'education' && <EducationCenter />}
          {activeTab === 'trade' && <PaperTrading />}
          {activeTab === 'futures' && <FuturesTrading />}
          {activeTab === 'portfolio' && <PortfolioManager />}
          {activeTab === 'journal' && <TradingJournal />}
          {activeTab === 'evaluation' && <MockEvaluation />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'analytics-enhanced' && <AnalyticsEnhanced />}
          {activeTab === 'advanced-analytics' && <AdvancedAnalytics />}
          {activeTab === 'business-metrics' && <BusinessMetrics />}
          {activeTab === 'alerts' && <AlertsAutomation />}
          {activeTab === 'calendar' && <EconomicCalendar />}
          {activeTab === 'risk' && <RiskCalculator />}
          {activeTab === 'gamification' && <GamificationHub />}
          {activeTab === 'achievements' && <Achievements />}
          {activeTab === 'ideas' && <TradeIdeas />}
          {activeTab === 'notifications' && <Notifications />}
          {activeTab === 'notifications-center' && <NotificationsCenter />}
          {activeTab === 'my-tickets' && <MyTickets />}
          {activeTab === 'success-stories' && <SuccessStories />}
          {activeTab === 'leaderboard' && <Leaderboard />}
          {activeTab === 'import' && <ImportExport />}
          {activeTab === 'pricing' && <Pricing />}
          {activeTab === 'daily-review' && <DailyReview />}
          {activeTab === 'streaks' && <StreakTracker />}
          {activeTab === 'heatmap' && <TradingHeatMap />}
        </Suspense>
      </main>

      {showOnboarding && (
        <Suspense fallback={<LoadingFallback />}>
          <Onboarding onComplete={() => setShowOnboarding(false)} />
        </Suspense>
      )}

      {showShortcuts && (
        <Suspense fallback={<LoadingFallback />}>
          <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
        </Suspense>
      )}
      {showAdminDashboard && (
        <Suspense fallback={<LoadingFallback />}>
          <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
        </Suspense>
      )}
      {showTicketForm && (
        <Suspense fallback={<LoadingFallback />}>
          <TicketSubmission onClose={() => setShowTicketForm(false)} />
        </Suspense>
      )}
    </div>
  );
}

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-300 hover:bg-slate-800/50 hover:text-blue-400 rounded transition text-sm"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}

function AppWithAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <MainApp />;
}

function AppWithTheme() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <AppWithAuth />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default AppWithTheme;

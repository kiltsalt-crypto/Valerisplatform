import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Check, ArrowRight, X } from 'lucide-react';

interface OnboardingStatus {
  welcome_completed: boolean;
  profile_setup_completed: boolean;
  first_module_completed: boolean;
  first_trade_completed: boolean;
  tour_completed: boolean;
}

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { profile } = useAuth();
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<OnboardingStatus>({
    welcome_completed: false,
    profile_setup_completed: false,
    first_module_completed: false,
    first_trade_completed: false,
    tour_completed: false
  });

  useEffect(() => {
    loadOnboardingStatus();
  }, [profile]);

  const loadOnboardingStatus = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_status')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setStatus(data);
        if (data.tour_completed) {
          onComplete();
        }
      } else {
        const { error: insertError } = await supabase
          .from('onboarding_status')
          .insert({ user_id: profile.id });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error loading onboarding status:', error);
    }
  };

  const updateStatus = async (field: keyof OnboardingStatus, value: boolean) => {
    if (!profile) return;

    try {
      const updates: any = { [field]: value };

      if (field === 'tour_completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('onboarding_status')
        .update(updates)
        .eq('user_id', profile.id);

      if (error) throw error;

      setStatus({ ...status, [field]: value });

      if (field === 'tour_completed' && value) {
        onComplete();
      }
    } catch (error) {
      console.error('Error updating onboarding status:', error);
    }
  };

  const steps = [
    {
      title: 'Welcome to Valeris!',
      description: 'Your journey to becoming a profitable futures trader starts here.',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 leading-relaxed">
            Valeris is designed to help you master futures trading and pass funded account evaluations like TopStep, Apex, and more.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="glass-card p-4 text-center">
              <div className="text-3xl mb-2">📚</div>
              <h4 className="text-white font-semibold mb-1">Learn</h4>
              <p className="text-slate-400 text-sm">Comprehensive trading education</p>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-3xl mb-2">📈</div>
              <h4 className="text-white font-semibold mb-1">Practice</h4>
              <p className="text-slate-400 text-sm">Paper trade and track performance</p>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <h4 className="text-white font-semibold mb-1">Pass</h4>
              <p className="text-slate-400 text-sm">Ace your evaluation challenges</p>
            </div>
          </div>
        </div>
      ),
      onNext: () => updateStatus('welcome_completed', true)
    },
    {
      title: 'Navigate the Platform',
      description: 'Here is what you can do with Valeris:',
      content: (
        <div className="space-y-3">
          <div className="glass-card p-4">
            <h4 className="text-white font-semibold mb-2">🏠 Home Dashboard</h4>
            <p className="text-slate-400 text-sm">Get a quick overview of your performance, progress, and active evaluations</p>
          </div>
          <div className="glass-card p-4">
            <h4 className="text-white font-semibold mb-2">📖 Learning Modules</h4>
            <p className="text-slate-400 text-sm">Master trading fundamentals, technical analysis, and psychology</p>
          </div>
          <div className="glass-card p-4">
            <h4 className="text-white font-semibold mb-2">💹 Paper Trading</h4>
            <p className="text-slate-400 text-sm">Practice with virtual money before risking real capital</p>
          </div>
          <div className="glass-card p-4">
            <h4 className="text-white font-semibold mb-2">📝 Trading Journal</h4>
            <p className="text-slate-400 text-sm">Document your trades and learn from every experience</p>
          </div>
          <div className="glass-card p-4">
            <h4 className="text-white font-semibold mb-2">🎯 Mock Evaluations</h4>
            <p className="text-slate-400 text-sm">Simulate real funding challenges with our evaluation tracker</p>
          </div>
        </div>
      ),
      onNext: () => setStep(step + 1)
    },
    {
      title: 'Start Your Journey',
      description: 'Choose your path to trading success:',
      content: (
        <div className="space-y-4">
          <button
            onClick={() => {
              updateStatus('profile_setup_completed', true);
              updateStatus('tour_completed', true);
            }}
            className="w-full glass-card p-6 text-left hover:bg-slate-800/50 transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold text-lg mb-2 group-hover:text-blue-400 transition">
                  Start Learning
                </h4>
                <p className="text-slate-400 text-sm">
                  Begin with Module 1: Futures Trading Basics
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-blue-400" />
            </div>
          </button>

          <button
            onClick={() => {
              updateStatus('profile_setup_completed', true);
              updateStatus('tour_completed', true);
            }}
            className="w-full glass-card p-6 text-left hover:bg-slate-800/50 transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold text-lg mb-2 group-hover:text-blue-400 transition">
                  Start Paper Trading
                </h4>
                <p className="text-slate-400 text-sm">
                  Practice trading with virtual capital
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-blue-400" />
            </div>
          </button>

          <button
            onClick={() => {
              updateStatus('profile_setup_completed', true);
              updateStatus('tour_completed', true);
            }}
            className="w-full glass-card p-6 text-left hover:bg-slate-800/50 transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold text-lg mb-2 group-hover:text-blue-400 transition">
                  Start an Evaluation
                </h4>
                <p className="text-slate-400 text-sm">
                  Begin your mock funding challenge
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-blue-400" />
            </div>
          </button>

          <div className="text-center pt-4">
            <button
              onClick={() => {
                updateStatus('profile_setup_completed', true);
                updateStatus('tour_completed', true);
              }}
              className="text-slate-400 hover:text-white text-sm transition"
            >
              Skip and explore on my own
            </button>
          </div>
        </div>
      ),
      onNext: () => {}
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-3xl w-full p-8 border border-blue-500/20 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === step
                    ? 'w-8 bg-blue-400'
                    : index < step
                    ? 'w-2 bg-blue-400/50'
                    : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => {
              updateStatus('tour_completed', true);
            }}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">{currentStep.title}</h2>
          <p className="text-slate-400">{currentStep.description}</p>
        </div>

        <div className="mb-8">
          {currentStep.content}
        </div>

        {step < steps.length - 1 && (
          <div className="flex gap-4">
            <button
              onClick={() => {
                if (currentStep.onNext) {
                  currentStep.onNext();
                }
                setStep(step + 1);
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-black font-bold py-4 rounded-lg hover:shadow-lg hover:shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              {step === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="w-5 h-5" />
            </button>
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-8 py-4 glass-card text-slate-400 hover:text-white font-semibold rounded-lg transition"
              >
                Back
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

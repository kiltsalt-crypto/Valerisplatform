import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Bot, Send, TrendingUp, Shield, BarChart3, BookOpen, Lightbulb, Loader2, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  created_at: string;
}

interface ProgressArea {
  skill_area: string;
  progress_score: number;
  strengths: string[];
  areas_to_improve: string[];
}

export default function AICoach() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressArea[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversationHistory();
    loadProgress();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversationHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('ai_coach_conversations')
      .select('*')
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (!error && data) {
      setMessages(data);
    }
  };

  const loadProgress = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('ai_coach_progress')
      .select('*')
      .eq('user_id', profile?.id);

    if (!error && data) {
      setProgress(data);
    }
  };

  const sendMessage = async (quickAction?: string) => {
    const messageToSend = quickAction || inputMessage.trim();
    if (!messageToSend || loading) return;

    setInputMessage('');
    setLoading(true);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      message: messageToSend,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach`;
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          context: {
            currentGoals: ['Improve win rate', 'Better risk management']
          }
        })
      });

      const result = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        message: result.message,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (result.progressUpdate) {
        loadProgress();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        message: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Analyze My Patterns', icon: TrendingUp, message: 'Analyze my trading patterns' },
    { label: 'Review Risk', icon: Shield, message: 'Review my risk management' },
    { label: 'Check Performance', icon: BarChart3, message: 'Analyze my performance' },
    { label: 'Teach Me', icon: BookOpen, message: 'Teach me about trading strategy' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Bot className="w-7 h-7 text-purple-400" />
            AI Trading Coach
          </h1>
          <p className="text-slate-400 text-sm">Your personalized trading mentor powered by AI</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400 text-sm font-semibold">AI-Powered</span>
        </div>
      </div>

      {progress.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {progress.map((prog) => (
            <div key={prog.skill_area} className="glass-card p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold text-sm capitalize">
                  {prog.skill_area.replace(/_/g, ' ')}
                </h3>
                <span className="text-purple-400 font-bold text-sm">{prog.progress_score}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${prog.progress_score}%` }}
                ></div>
              </div>
              {prog.strengths.length > 0 && (
                <p className="text-green-400 text-xs">✓ {prog.strengths[0]}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => sendMessage(action.message)}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 glass-card hover:bg-slate-800/50 text-purple-400 hover:text-purple-300 transition rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-semibold">{action.label}</span>
            </button>
          );
        })}
      </div>

      <div className="glass-card p-4">
        <div className="h-96 overflow-y-auto mb-4 space-y-3 pr-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="w-16 h-16 text-purple-400 mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Welcome to Your AI Coach!</h3>
              <p className="text-slate-400 text-sm max-w-md">
                I'm here to help you improve your trading skills. Ask me anything about patterns, risk management,
                strategy, or use the quick actions above to get started.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-xl px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-black'
                        : 'bg-slate-800/50 text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-slate-800/50 px-4 py-2 rounded-lg">
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask your AI coach anything..."
            disabled={loading}
            className="flex-1 bg-slate-800/50 border border-slate-700 focus:border-purple-500 rounded-lg px-4 py-2 text-white placeholder-slate-500 text-sm focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !inputMessage.trim()}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h3 className="text-white font-semibold">Pro Tips</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="bg-slate-800/30 rounded-lg p-3">
            <p className="text-slate-300 text-sm">💬 Ask specific questions for better insights</p>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-3">
            <p className="text-slate-300 text-sm">📊 Request analysis after multiple trades</p>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-3">
            <p className="text-slate-300 text-sm">🎯 Set goals and track progress regularly</p>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-3">
            <p className="text-slate-300 text-sm">📚 Use it as a learning companion</p>
          </div>
        </div>
      </div>
    </div>
  );
}

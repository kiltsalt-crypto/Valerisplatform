import { useState, useEffect } from 'react';
import { supabase, LearningModule, UserProgress } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, CheckCircle2, Clock, ChevronRight } from 'lucide-react';

export default function LearningModules() {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchModules();
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchModules = async () => {
    const { data, error } = await supabase
      .from('learning_modules')
      .select('*')
      .order('order_index');

    if (error) {
      console.error('Error fetching modules:', error);
      return;
    }

    setModules(data || []);
    setLoading(false);
  };

  const fetchProgress = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching progress:', error);
      return;
    }

    setProgress(data || []);
  };

  const markAsComplete = async (moduleId: string) => {
    if (!user) return;

    const existingProgress = progress.find((p) => p.module_id === moduleId);

    if (existingProgress) {
      const { error } = await supabase
        .from('user_progress')
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq('id', existingProgress.id);

      if (error) {
        console.error('Error updating progress:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          module_id: moduleId,
          completed: true,
          completed_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error creating progress:', error);
        return;
      }
    }

    fetchProgress();
  };

  const isModuleCompleted = (moduleId: string) => {
    return progress.some((p) => p.module_id === moduleId && p.completed);
  };

  const getCompletionRate = () => {
    if (modules.length === 0) return 0;
    const completed = modules.filter((m) => isModuleCompleted(m.id)).length;
    return Math.round((completed / modules.length) * 100);
  };

  const getCategoryIcon = (category: string) => {
    return '📚';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      basics: 'bg-blue-500',
      technical: 'bg-emerald-500',
      fundamental: 'bg-orange-500',
      risk: 'bg-red-500',
      psychology: 'bg-purple-500',
      strategies: 'bg-yellow-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading modules...</div>
      </div>
    );
  }

  if (selectedModule) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedModule(null)}
          className="mb-6 text-slate-400 hover:text-white transition flex items-center gap-2"
        >
          ← Back to modules
        </button>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className={`${getCategoryColor(selectedModule.category)} p-6`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{getCategoryIcon(selectedModule.category)}</span>
              <h1 className="text-3xl font-bold text-white">{selectedModule.title}</h1>
            </div>
            <p className="text-white/90">{selectedModule.description}</p>
            <div className="flex items-center gap-4 mt-4 text-white/80 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {selectedModule.duration_minutes} minutes
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="prose prose-invert prose-slate max-w-none">
              <div dangerouslySetInnerHTML={{ __html: selectedModule.content.replace(/\n/g, '<br/>').replace(/##/g, '<h2>').replace(/#/g, '<h1>') }} />
            </div>

            <div className="mt-8 pt-8 border-t border-slate-700">
              <button
                onClick={() => {
                  markAsComplete(selectedModule.id);
                  setSelectedModule(null);
                }}
                className={`w-full py-4 px-6 rounded-lg font-semibold transition ${
                  isModuleCompleted(selectedModule.id)
                    ? 'bg-slate-700 text-slate-400 cursor-default'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
                disabled={isModuleCompleted(selectedModule.id)}
              >
                {isModuleCompleted(selectedModule.id) ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Completed
                  </span>
                ) : (
                  'Mark as Complete'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Trading Education</h1>
        <p className="text-slate-400">Master the skills needed to pass your funded account evaluation</p>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-white">Your Progress</h2>
          <span className="text-2xl font-bold text-emerald-400">{getCompletionRate()}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${getCompletionRate()}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {modules.map((module) => {
          const completed = isModuleCompleted(module.id);
          return (
            <button
              key={module.id}
              onClick={() => setSelectedModule(module)}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition text-left group"
            >
              <div className="flex items-start gap-4">
                <div className={`${getCategoryColor(module.category)} p-3 rounded-lg text-2xl`}>
                  {getCategoryIcon(module.category)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition">
                      {module.title}
                    </h3>
                    {completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 ml-2" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 transition flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <p className="text-slate-400 mb-3">{module.description}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {module.duration_minutes} min
                    </div>
                    <div className="px-2 py-1 bg-slate-700 rounded text-slate-300 capitalize">
                      {module.category}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

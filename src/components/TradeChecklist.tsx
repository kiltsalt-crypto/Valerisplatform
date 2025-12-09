import { useState, useEffect } from 'react';
import { CheckSquare, Square, Save, Play, TrendingUp, AlertTriangle, Brain, Target } from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: 'pre-trade' | 'execution' | 'psychology' | 'risk';
  text: string;
  checked: boolean;
  required: boolean;
}

interface ChecklistTemplate {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export default function TradeChecklist() {
  const [currentChecklist, setCurrentChecklist] = useState<ChecklistItem[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [canTrade, setCanTrade] = useState(false);

  useEffect(() => {
    loadDefaultTemplates();
  }, []);

  useEffect(() => {
    const requiredItems = currentChecklist.filter(item => item.required);
    const allRequiredChecked = requiredItems.every(item => item.checked);
    setCanTrade(allRequiredChecked && currentChecklist.length > 0);
  }, [currentChecklist]);

  const loadDefaultTemplates = () => {
    const defaultTemplates: ChecklistTemplate[] = [
      {
        id: 'day-trading',
        name: 'Day Trading Setup',
        items: [
          { id: '1', category: 'pre-trade', text: 'Market direction identified (trend/range)', checked: false, required: true },
          { id: '2', category: 'pre-trade', text: 'Key support/resistance levels marked', checked: false, required: true },
          { id: '3', category: 'pre-trade', text: 'Economic calendar checked for news', checked: false, required: true },
          { id: '4', category: 'pre-trade', text: 'Daily risk limit defined', checked: false, required: true },
          { id: '5', category: 'execution', text: 'Entry price determined', checked: false, required: true },
          { id: '6', category: 'execution', text: 'Stop loss level set', checked: false, required: true },
          { id: '7', category: 'execution', text: 'Take profit target defined', checked: false, required: true },
          { id: '8', category: 'execution', text: 'Position size calculated', checked: false, required: true },
          { id: '9', category: 'risk', text: 'Risk:Reward ratio is at least 1:2', checked: false, required: true },
          { id: '10', category: 'risk', text: 'Risk is within 1-2% of account', checked: false, required: true },
          { id: '11', category: 'psychology', text: 'Feeling calm and focused', checked: false, required: false },
          { id: '12', category: 'psychology', text: 'No revenge trading mindset', checked: false, required: true },
          { id: '13', category: 'psychology', text: 'Following my trading plan', checked: false, required: true },
        ]
      },
      {
        id: 'swing-trading',
        name: 'Swing Trading Setup',
        items: [
          { id: '1', category: 'pre-trade', text: 'Higher timeframe trend confirmed', checked: false, required: true },
          { id: '2', category: 'pre-trade', text: 'Pattern/setup identified', checked: false, required: true },
          { id: '3', category: 'execution', text: 'Entry strategy defined', checked: false, required: true },
          { id: '4', category: 'execution', text: 'Stop loss placed', checked: false, required: true },
          { id: '5', category: 'execution', text: 'Multiple targets set', checked: false, required: false },
          { id: '6', category: 'risk', text: 'Position sized appropriately', checked: false, required: true },
          { id: '7', category: 'psychology', text: 'Prepared to hold overnight', checked: false, required: true },
        ]
      },
      {
        id: 'scalping',
        name: 'Scalping Setup',
        items: [
          { id: '1', category: 'pre-trade', text: 'High volume period confirmed', checked: false, required: true },
          { id: '2', category: 'pre-trade', text: 'Tight spreads verified', checked: false, required: true },
          { id: '3', category: 'execution', text: 'Quick entry/exit plan ready', checked: false, required: true },
          { id: '4', category: 'execution', text: 'Stop loss very tight', checked: false, required: true },
          { id: '5', category: 'risk', text: 'Max 3-5 ticks risk', checked: false, required: true },
          { id: '6', category: 'psychology', text: 'Ready for rapid decisions', checked: false, required: true },
        ]
      }
    ];

    setTemplates(defaultTemplates);
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCurrentChecklist(template.items.map(item => ({ ...item, checked: false })));
      setSelectedTemplate(templateId);
    }
  };

  const toggleItem = (itemId: string) => {
    setCurrentChecklist(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const resetChecklist = () => {
    setCurrentChecklist(prev =>
      prev.map(item => ({ ...item, checked: false }))
    );
  };

  const groupedItems = currentChecklist.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const categoryConfig = {
    'pre-trade': { label: 'Pre-Trade Analysis', icon: Target, color: 'blue' },
    'execution': { label: 'Trade Execution', icon: Play, color: 'purple' },
    'risk': { label: 'Risk Management', icon: AlertTriangle, color: 'red' },
    'psychology': { label: 'Mental State', icon: Brain, color: 'green' },
  };

  const completionPercentage = currentChecklist.length > 0
    ? Math.round((currentChecklist.filter(i => i.checked).length / currentChecklist.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CheckSquare className="w-7 h-7 text-purple-400" />
          Trade Checklist
        </h1>
      </div>

      <div className="glass-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-slate-400 text-sm mb-1 block">Select Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => loadTemplate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">Choose a template...</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-lg">
            <p className="text-slate-400 text-xs mb-1">Completion</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-white font-bold">{completionPercentage}%</span>
            </div>
          </div>

          <div className={`p-3 rounded-lg border-2 ${
            canTrade
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <p className="text-slate-400 text-xs mb-1">Trade Status</p>
            <p className={`font-bold ${canTrade ? 'text-green-400' : 'text-red-400'}`}>
              {canTrade ? 'Ready to Trade' : 'Checklist Incomplete'}
            </p>
          </div>
        </div>

        {currentChecklist.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">Select a checklist template to get started</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {Object.entries(groupedItems).map(([category, items]) => {
                const config = categoryConfig[category as keyof typeof categoryConfig];
                const Icon = config.icon;
                const checked = items.filter(i => i.checked).length;
                const total = items.length;

                return (
                  <div key={category} className="bg-slate-800/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 text-${config.color}-400`} />
                        <h3 className="text-white font-semibold">{config.label}</h3>
                      </div>
                      <span className="text-slate-400 text-sm">{checked}/{total}</span>
                    </div>

                    <div className="space-y-2">
                      {items.map(item => (
                        <div
                          key={item.id}
                          onClick={() => toggleItem(item.id)}
                          className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition ${
                            item.checked
                              ? 'bg-slate-700/50'
                              : 'bg-slate-800/50 hover:bg-slate-700/30'
                          }`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {item.checked ? (
                              <CheckSquare className="w-5 h-5 text-purple-400" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm ${
                              item.checked ? 'text-slate-400 line-through' : 'text-white'
                            }`}>
                              {item.text}
                            </p>
                            {item.required && !item.checked && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                                Required
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={resetChecklist}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                Reset Checklist
              </button>
              {canTrade && (
                <button
                  className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-semibold"
                >
                  <TrendingUp className="w-5 h-5" />
                  Proceed to Trade
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="glass-card p-4">
        <h3 className="text-white font-semibold mb-3">Why Use a Checklist?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Reduce Emotions</h4>
            <p className="text-slate-400 text-sm">Follow a systematic process instead of impulsive decisions</p>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Ensure Consistency</h4>
            <p className="text-slate-400 text-sm">Execute every trade with the same rigorous standards</p>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5 text-green-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Manage Risk</h4>
            <p className="text-slate-400 text-sm">Never forget critical risk management steps</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckSquare, Square, Plus, Trash2, Save } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category: 'premarket' | 'trading' | 'postmarket';
}

const defaultItems: Omit<ChecklistItem, 'id' | 'completed'>[] = [
  { text: 'Review economic calendar for today', category: 'premarket' },
  { text: 'Check overnight market movements', category: 'premarket' },
  { text: 'Review my trading plan and strategy', category: 'premarket' },
  { text: 'Set daily profit target and max loss', category: 'premarket' },
  { text: 'Ensure mental and physical readiness', category: 'premarket' },
  { text: 'Follow my trading plan strictly', category: 'trading' },
  { text: 'Take screenshots of all trades', category: 'trading' },
  { text: 'Manage risk properly on every trade', category: 'trading' },
  { text: 'Avoid revenge trading', category: 'trading' },
  { text: 'Journal all trades with details', category: 'postmarket' },
  { text: 'Review trade execution and mistakes', category: 'postmarket' },
  { text: 'Update performance metrics', category: 'postmarket' },
  { text: 'Plan for tomorrow\'s session', category: 'postmarket' },
];

export default function DailyChecklistEnhanced() {
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'premarket' | 'trading' | 'postmarket'>('premarket');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = () => {
    const savedItems = localStorage.getItem(`checklist_${user?.id || 'guest'}`);
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
      const initialItems = defaultItems.map((item, index) => ({
        ...item,
        id: `item-${index}`,
        completed: false
      }));
      setItems(initialItems);
    }
  };

  const saveChecklist = (updatedItems: ChecklistItem[]) => {
    localStorage.setItem(`checklist_${user?.id || 'guest'}`, JSON.stringify(updatedItems));
    setItems(updatedItems);
  };

  const toggleItem = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveChecklist(updated);
  };

  const addItem = () => {
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: newItemText,
      completed: false,
      category: newItemCategory
    };

    saveChecklist([...items, newItem]);
    setNewItemText('');
    setShowAddForm(false);
  };

  const deleteItem = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    saveChecklist(updated);
  };

  const resetChecklist = () => {
    const reset = items.map(item => ({ ...item, completed: false }));
    saveChecklist(reset);
  };

  const getProgress = (category: string) => {
    const categoryItems = items.filter(item => item.category === category);
    if (categoryItems.length === 0) return 0;
    const completed = categoryItems.filter(item => item.completed).length;
    return Math.round((completed / categoryItems.length) * 100);
  };

  const totalProgress = items.length > 0
    ? Math.round((items.filter(item => item.completed).length / items.length) * 100)
    : 0;

  const categories = [
    { id: 'premarket', name: 'Pre-Market', color: 'blue' },
    { id: 'trading', name: 'During Trading', color: 'purple' },
    { id: 'postmarket', name: 'Post-Market', color: 'green' }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-blue-400" />
            Daily Trading Checklist
          </h2>
          <p className="text-slate-400 mt-1">Stay disciplined with your trading routine</p>
        </div>
        <button
          onClick={resetChecklist}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition"
        >
          Reset All
        </button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white">Overall Progress</h3>
          <span className="text-2xl font-bold text-blue-400">{totalProgress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {categories.map((category) => {
        const categoryItems = items.filter(item => item.category === category.id);
        const progress = getProgress(category.id);

        return (
          <div key={category.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{category.name}</h3>
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold text-${category.color}-400`}>{progress}%</span>
                <div className="w-24 bg-slate-700 rounded-full h-2">
                  <div
                    className={`bg-${category.color}-500 h-2 rounded-full transition-all`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl hover:bg-slate-800 transition group"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="flex-shrink-0"
                  >
                    {item.completed ? (
                      <CheckSquare className="w-6 h-6 text-green-400" />
                    ) : (
                      <Square className="w-6 h-6 text-slate-500" />
                    )}
                  </button>
                  <span className={`flex-1 ${item.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-500/20 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {showAddForm ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Add Custom Item</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Category</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as any)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              >
                <option value="premarket">Pre-Market</option>
                <option value="trading">During Trading</option>
                <option value="postmarket">Post-Market</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Task Description</label>
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Enter task description..."
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                onKeyPress={(e) => e.key === 'Enter' && addItem()}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={addItem}
                className="flex-1 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Add Item
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewItemText('');
                }}
                className="flex-1 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-4 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-2xl text-slate-400 hover:text-blue-400 transition flex items-center justify-center gap-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add Custom Item
        </button>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FileText, Plus, Edit, Trash2, Copy } from 'lucide-react';

interface TradeTemplate {
  id: string;
  name: string;
  instrument: string;
  direction: string;
  entry_rules: string;
  exit_rules: string;
  risk_amount: number;
  position_size: number;
  stop_loss_points: number;
  take_profit_points: number;
  notes: string;
}

export default function TradeTemplates() {
  const { profile } = useAuth();
  const [templates, setTemplates] = useState<TradeTemplate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TradeTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    instrument: 'ES',
    direction: 'Long',
    entry_rules: '',
    exit_rules: '',
    risk_amount: 100,
    position_size: 1,
    stop_loss_points: 10,
    take_profit_points: 20,
    notes: ''
  });

  useEffect(() => {
    loadTemplates();
  }, [profile]);

  const loadTemplates = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('trade_templates')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (data) setTemplates(data);
  };

  const saveTemplate = async () => {
    if (!profile) return;

    if (editingTemplate) {
      await supabase
        .from('trade_templates')
        .update(formData)
        .eq('id', editingTemplate.id);
    } else {
      await supabase
        .from('trade_templates')
        .insert({ ...formData, user_id: profile.id });
    }

    loadTemplates();
    resetForm();
  };

  const deleteTemplate = async (id: string) => {
    await supabase
      .from('trade_templates')
      .delete()
      .eq('id', id);

    loadTemplates();
  };

  const duplicateTemplate = async (template: TradeTemplate) => {
    if (!profile) return;

    await supabase
      .from('trade_templates')
      .insert({
        ...template,
        id: undefined,
        user_id: profile.id,
        name: `${template.name} (Copy)`
      });

    loadTemplates();
  };

  const editTemplate = (template: TradeTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      instrument: template.instrument,
      direction: template.direction,
      entry_rules: template.entry_rules || '',
      exit_rules: template.exit_rules || '',
      risk_amount: template.risk_amount || 100,
      position_size: template.position_size || 1,
      stop_loss_points: template.stop_loss_points || 10,
      take_profit_points: template.take_profit_points || 20,
      notes: template.notes || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setFormData({
      name: '',
      instrument: 'ES',
      direction: 'Long',
      entry_rules: '',
      exit_rules: '',
      risk_amount: 100,
      position_size: 1,
      stop_loss_points: 10,
      take_profit_points: 20,
      notes: ''
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <FileText className="w-7 h-7 text-purple-400" />
            Trade Templates
          </h1>
          <p className="text-slate-400 text-sm">Save and reuse your favorite trade setups</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition font-semibold"
        >
          <Plus className="w-5 h-5" />
          New Template
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6">
          <h3 className="text-white font-semibold mb-4">
            {editingTemplate ? 'Edit Template' : 'Create Template'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Template Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Breakout Strategy"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-2 block">Instrument</label>
              <select
                value={formData.instrument}
                onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              >
                {['ES', 'NQ', 'YM', 'RTY', 'CL', 'GC', 'SI', 'NG'].map(inst => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-2 block">Direction</label>
              <select
                value={formData.direction}
                onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="Long">Long</option>
                <option value="Short">Short</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-2 block">Position Size</label>
              <input
                type="number"
                value={formData.position_size}
                onChange={(e) => setFormData({ ...formData, position_size: parseInt(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-2 block">Stop Loss (Points)</label>
              <input
                type="number"
                value={formData.stop_loss_points}
                onChange={(e) => setFormData({ ...formData, stop_loss_points: parseFloat(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-2 block">Take Profit (Points)</label>
              <input
                type="number"
                value={formData.take_profit_points}
                onChange={(e) => setFormData({ ...formData, take_profit_points: parseFloat(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-slate-400 text-sm mb-2 block">Entry Rules</label>
              <textarea
                value={formData.entry_rules}
                onChange={(e) => setFormData({ ...formData, entry_rules: e.target.value })}
                placeholder="Price breaks above previous day high with volume..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-slate-400 text-sm mb-2 block">Exit Rules</label>
              <textarea
                value={formData.exit_rules}
                onChange={(e) => setFormData({ ...formData, exit_rules: e.target.value })}
                placeholder="Exit at target or stop loss..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={saveTemplate}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition font-semibold"
            >
              {editingTemplate ? 'Update' : 'Save'} Template
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => (
          <div key={template.id} className="glass-card p-4 hover:bg-slate-800/50 transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-bold text-lg">{template.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                    {template.instrument}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    template.direction === 'Long'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {template.direction}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => duplicateTemplate(template)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => editTemplate(template)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-purple-400" />
                </button>
                <button
                  onClick={() => deleteTemplate(template.id)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-slate-500 text-xs">Position Size</p>
                <p className="text-white font-semibold">{template.position_size} contracts</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Risk/Reward</p>
                <p className="text-white font-semibold">
                  {template.stop_loss_points}pts / {template.take_profit_points}pts
                </p>
              </div>
            </div>

            {template.entry_rules && (
              <div className="mb-2">
                <p className="text-slate-400 text-xs mb-1">Entry Rules:</p>
                <p className="text-slate-300 text-sm">{template.entry_rules}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {templates.length === 0 && !showForm && (
        <div className="glass-card p-12 text-center">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">No trade templates yet</p>
          <p className="text-slate-500 text-sm">Create templates to save time on repetitive setups</p>
        </div>
      )}
    </div>
  );
}

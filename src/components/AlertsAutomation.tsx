import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Bell, Zap, Plus, Trash2, Play, Pause } from 'lucide-react';

interface Alert {
  id: string;
  instrument: string;
  alert_type: string;
  target_price: number;
  is_active: boolean;
}

interface AutoRule {
  id: string;
  rule_name: string;
  trigger_type: string;
  is_active: boolean;
  trigger_count: number;
}

export default function AlertsAutomation() {
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<AutoRule[]>([]);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    instrument: 'ES',
    alert_type: 'above',
    target_price: 0
  });

  useEffect(() => {
    loadAlerts();
    loadRules();
  }, []);

  const loadAlerts = async () => {
    const { data } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: false });

    if (data) setAlerts(data);
  };

  const loadRules = async () => {
    const { data } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: false});

    if (data) setRules(data);
  };

  const createAlert = async () => {
    await supabase.from('price_alerts').insert({
      user_id: profile?.id,
      ...newAlert
    });

    setShowAlertForm(false);
    setNewAlert({ instrument: 'ES', alert_type: 'above', target_price: 0 });
    loadAlerts();
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    await supabase
      .from('price_alerts')
      .update({ is_active: !isActive })
      .eq('id', alertId);
    loadAlerts();
  };

  const deleteAlert = async (alertId: string) => {
    await supabase.from('price_alerts').delete().eq('id', alertId);
    loadAlerts();
  };

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    await supabase
      .from('automation_rules')
      .update({ is_active: !isActive })
      .eq('id', ruleId);
    loadRules();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Bell className="w-7 h-7 text-purple-400" />
          Alerts & Automation
        </h1>
        <p className="text-slate-400 text-sm">Stay informed and automate your trading workflow</p>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-400" />
            Price Alerts
          </h2>
          <button
            onClick={() => setShowAlertForm(!showAlertForm)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm hover:from-purple-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4" />
            Add Alert
          </button>
        </div>

        {showAlertForm && (
          <div className="bg-slate-800/50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Instrument</label>
                <select
                  value={newAlert.instrument}
                  onChange={(e) => setNewAlert({ ...newAlert, instrument: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                >
                  <option value="ES">ES (S&P 500)</option>
                  <option value="NQ">NQ (Nasdaq)</option>
                  <option value="CL">CL (Crude Oil)</option>
                  <option value="GC">GC (Gold)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Alert Type</label>
                <select
                  value={newAlert.alert_type}
                  onChange={(e) => setNewAlert({ ...newAlert, alert_type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                  <option value="crosses">Crosses</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Target Price</label>
                <input
                  type="number"
                  value={newAlert.target_price}
                  onChange={(e) => setNewAlert({ ...newAlert, target_price: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
            <button
              onClick={createAlert}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-semibold"
            >
              Create Alert
            </button>
          </div>
        )}

        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between bg-slate-800/30 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleAlert(alert.id, alert.is_active)}
                  className={`p-2 rounded-lg ${
                    alert.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {alert.is_active ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {alert.instrument} {alert.alert_type} ${alert.target_price}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {alert.is_active ? 'Active' : 'Paused'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteAlert(alert.id)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Automation Rules
        </h2>
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between bg-slate-800/30 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleRule(rule.id, rule.is_active)}
                  className={`p-2 rounded-lg ${
                    rule.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                </button>
                <div>
                  <p className="text-white font-semibold text-sm">{rule.rule_name}</p>
                  <p className="text-slate-400 text-xs">
                    {rule.trigger_type} • Triggered {rule.trigger_count} times
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                rule.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
              }`}>
                {rule.is_active ? 'Active' : 'Paused'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

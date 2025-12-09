import { useState } from 'react';
import { Bell, Smartphone, Mail, MessageSquare, TrendingUp, TrendingDown, Settings, Plus, Trash2 } from 'lucide-react';

interface SignalAlert {
  id: string;
  type: 'breakout' | 'reversal' | 'support' | 'resistance' | 'pattern';
  instrument: string;
  condition: string;
  triggerPrice: number;
  enabled: boolean;
  channels: ('push' | 'sms' | 'email')[];
}

interface SignalHistory {
  id: string;
  timestamp: Date;
  type: string;
  instrument: string;
  message: string;
  price: number;
  result?: 'hit' | 'missed';
}

export default function TradingSignals() {
  const [signals, setSignals] = useState<SignalAlert[]>([
    {
      id: '1',
      type: 'breakout',
      instrument: 'ES',
      condition: 'Price breaks above 4860',
      triggerPrice: 4860,
      enabled: true,
      channels: ['push', 'sms']
    },
    {
      id: '2',
      type: 'support',
      instrument: 'NQ',
      condition: 'Price touches 17200 support',
      triggerPrice: 17200,
      enabled: true,
      channels: ['push']
    },
  ]);

  const [history, setHistory] = useState<SignalHistory[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 3600000),
      type: 'Breakout Alert',
      instrument: 'ES',
      message: 'ES broke above 4860 resistance',
      price: 4861.5,
      result: 'hit'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 7200000),
      type: 'Support Alert',
      instrument: 'CL',
      message: 'CL approaching $82 support level',
      price: 82.15,
      result: 'missed'
    },
  ]);

  const [showAddSignal, setShowAddSignal] = useState(false);
  const [newSignal, setNewSignal] = useState({
    type: 'breakout' as SignalAlert['type'],
    instrument: 'ES',
    condition: '',
    triggerPrice: 0,
    channels: ['push'] as ('push' | 'sms' | 'email')[]
  });

  const toggleSignal = (id: string) => {
    setSignals(signals.map(signal =>
      signal.id === id ? { ...signal, enabled: !signal.enabled } : signal
    ));
  };

  const deleteSignal = (id: string) => {
    setSignals(signals.filter(signal => signal.id !== id));
  };

  const addSignal = () => {
    const signal: SignalAlert = {
      id: Date.now().toString(),
      ...newSignal,
      enabled: true
    };
    setSignals([...signals, signal]);
    setShowAddSignal(false);
    setNewSignal({
      type: 'breakout',
      instrument: 'ES',
      condition: '',
      triggerPrice: 0,
      channels: ['push']
    });
  };

  const toggleChannel = (channel: 'push' | 'sms' | 'email') => {
    if (newSignal.channels.includes(channel)) {
      setNewSignal({
        ...newSignal,
        channels: newSignal.channels.filter(c => c !== channel)
      });
    } else {
      setNewSignal({
        ...newSignal,
        channels: [...newSignal.channels, channel]
      });
    }
  };

  const activeSignals = signals.filter(s => s.enabled).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="w-7 h-7 text-purple-400" />
          Trading Signals
        </h1>
        <button
          onClick={() => setShowAddSignal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          New Signal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Active Signals</p>
            <Bell className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">{activeSignals}</p>
          <p className="text-slate-500 text-xs">Out of {signals.length} total</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Signals Today</p>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">8</p>
          <p className="text-slate-500 text-xs">5 successful hits</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Success Rate</p>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-green-400 mb-1">62.5%</p>
          <p className="text-slate-500 text-xs">Last 30 days</p>
        </div>
      </div>

      {showAddSignal && (
        <div className="glass-card p-4 border-2 border-purple-500/30">
          <h3 className="text-white font-semibold mb-4">Create New Signal</h3>

          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Signal Type</label>
                <select
                  value={newSignal.type}
                  onChange={(e) => setNewSignal({ ...newSignal, type: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="breakout">Breakout</option>
                  <option value="reversal">Reversal</option>
                  <option value="support">Support</option>
                  <option value="resistance">Resistance</option>
                  <option value="pattern">Pattern</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Instrument</label>
                <select
                  value={newSignal.instrument}
                  onChange={(e) => setNewSignal({ ...newSignal, instrument: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="ES">ES</option>
                  <option value="NQ">NQ</option>
                  <option value="YM">YM</option>
                  <option value="RTY">RTY</option>
                  <option value="CL">CL</option>
                  <option value="GC">GC</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-1 block">Trigger Price</label>
              <input
                type="number"
                value={newSignal.triggerPrice}
                onChange={(e) => setNewSignal({ ...newSignal, triggerPrice: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                step="0.25"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-1 block">Condition Description</label>
              <input
                type="text"
                value={newSignal.condition}
                onChange={(e) => setNewSignal({ ...newSignal, condition: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                placeholder="e.g., Price breaks above resistance"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-2 block">Notification Channels</label>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleChannel('push')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                    newSignal.channels.includes('push')
                      ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  Push
                </button>
                <button
                  onClick={() => toggleChannel('sms')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                    newSignal.channels.includes('sms')
                      ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  SMS
                </button>
                <button
                  onClick={() => toggleChannel('email')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                    newSignal.channels.includes('email')
                      ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAddSignal(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={addSignal}
              disabled={!newSignal.condition || !newSignal.triggerPrice}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition"
            >
              Create Signal
            </button>
          </div>
        </div>
      )}

      <div className="glass-card p-4">
        <h3 className="text-white font-semibold mb-4">Active Signals</h3>
        {signals.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No signals configured. Create your first signal!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {signals.map(signal => (
              <div key={signal.id} className={`bg-slate-800/50 p-4 rounded-lg border ${
                signal.enabled ? 'border-purple-500/20' : 'border-slate-700'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        signal.type === 'breakout' ? 'bg-green-500/20 text-green-400' :
                        signal.type === 'reversal' ? 'bg-blue-500/20 text-blue-400' :
                        signal.type === 'support' ? 'bg-purple-500/20 text-purple-400' :
                        signal.type === 'resistance' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {signal.type.toUpperCase()}
                      </span>
                      <span className="text-white font-bold">{signal.instrument}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        signal.enabled
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {signal.enabled ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <p className="text-white text-sm mb-2">{signal.condition}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-400">Trigger: ${signal.triggerPrice}</span>
                      <div className="flex items-center gap-2">
                        {signal.channels.map(channel => (
                          <span key={channel} className="flex items-center gap-1 text-purple-400">
                            {channel === 'push' && <Smartphone className="w-3 h-3" />}
                            {channel === 'sms' && <MessageSquare className="w-3 h-3" />}
                            {channel === 'email' && <Mail className="w-3 h-3" />}
                            {channel}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleSignal(signal.id)}
                      className={`p-2 rounded transition ${
                        signal.enabled
                          ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-400'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSignal(signal.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-4">
        <h3 className="text-white font-semibold mb-4">Signal History</h3>
        <div className="space-y-2">
          {history.map(item => (
            <div key={item.id} className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white font-bold">{item.instrument}</span>
                    <span className="text-slate-400 text-sm">
                      {item.timestamp.toLocaleString()}
                    </span>
                    {item.result && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.result === 'hit'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {item.result === 'hit' ? 'Hit Target' : 'Missed'}
                      </span>
                    )}
                  </div>
                  <p className="text-white text-sm mb-1">{item.message}</p>
                  <p className="text-slate-400 text-sm">Price: ${item.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">Notification Settings</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
            <div>
              <p className="text-white font-semibold text-sm">Push Notifications</p>
              <p className="text-slate-400 text-xs">Receive alerts on your device</p>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input type="checkbox" className="opacity-0 w-0 h-0 peer" defaultChecked />
              <span className="absolute inset-0 bg-slate-700 rounded-full transition peer-checked:bg-purple-500 cursor-pointer"></span>
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6"></span>
            </label>
          </div>

          <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
            <div>
              <p className="text-white font-semibold text-sm">SMS Alerts</p>
              <p className="text-slate-400 text-xs">Get text messages for signals</p>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input type="checkbox" className="opacity-0 w-0 h-0 peer" defaultChecked />
              <span className="absolute inset-0 bg-slate-700 rounded-full transition peer-checked:bg-purple-500 cursor-pointer"></span>
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6"></span>
            </label>
          </div>

          <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
            <div>
              <p className="text-white font-semibold text-sm">Email Notifications</p>
              <p className="text-slate-400 text-xs">Receive signals via email</p>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input type="checkbox" className="opacity-0 w-0 h-0 peer" />
              <span className="absolute inset-0 bg-slate-700 rounded-full transition peer-checked:bg-purple-500 cursor-pointer"></span>
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

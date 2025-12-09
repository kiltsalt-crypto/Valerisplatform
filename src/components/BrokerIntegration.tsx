import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Link2, CheckCircle, XCircle, RefreshCw, Settings, ExternalLink, Loader2 } from 'lucide-react';

interface BrokerConnection {
  id: string;
  broker_name: string;
  account_id: string;
  account_type?: string;
  status: string;
  last_synced_at?: string;
  expires_at?: string;
  metadata?: any;
}

const availableBrokers = [
  {
    name: 'E*TRADE',
    logo: '💼',
    supported: true,
    oauth: true,
    description: 'Connect via OAuth - Supports live trading'
  },
  {
    name: 'Schwab',
    logo: '📊',
    supported: true,
    oauth: true,
    description: 'TD Ameritrade (now Schwab) - OAuth 2.0'
  },
  {
    name: 'TradeStation',
    logo: '🏦',
    supported: false,
    oauth: false,
    description: 'Coming soon'
  },
  {
    name: 'NinjaTrader',
    logo: '🥷',
    supported: false,
    oauth: false,
    description: 'Coming soon'
  },
  {
    name: 'ThinkorSwim',
    logo: '💭',
    supported: false,
    oauth: false,
    description: 'Coming soon'
  },
  {
    name: 'Interactive Brokers',
    logo: '🔗',
    supported: false,
    oauth: false,
    description: 'Coming soon'
  },
];

export default function BrokerIntegration() {
  const { profile } = useAuth();
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    loadConnections();
  }, [profile]);

  const loadConnections = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('broker_connections')
      .select('*')
      .eq('user_id', profile.id);

    if (data) setConnections(data);
  };

  const connectEtrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/etrade-oauth`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request_token'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setError('E*TRADE OAuth requires OAuth 1.0a implementation. Please check the Edge Function for implementation details.');
      } else {
        setError(result.message || 'Failed to connect E*TRADE');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const connectSchwab = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/schwab-oauth`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'authorize'
        }),
      });

      const result = await response.json();

      if (result.success && result.authorizationUrl) {
        window.open(result.authorizationUrl, '_blank');
        setError('Please complete authorization in the new window, then return here.');
      } else {
        setError(result.message || 'Failed to initiate Schwab connection');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const disconnectBroker = async (id: string, brokerName: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const functionName = brokerName.toLowerCase() === 'etrade' ? 'etrade-oauth' : 'schwab-oauth';

      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'disconnect',
          connection_id: id
        }),
      });

      loadConnections();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const syncBroker = async (connectionId: string) => {
    setSyncing(connectionId);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/broker-api-proxy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connection_id: connectionId,
          action: 'sync_positions'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPositions(result.positions || []);
        await loadConnections();
      } else {
        setError(result.error || 'Sync failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSyncing(null);
    }
  };

  const handleBrokerClick = (brokerName: string) => {
    if (brokerName === 'E*TRADE') {
      connectEtrade();
    } else if (brokerName === 'Schwab') {
      connectSchwab();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Link2 className="w-7 h-7 text-green-400" />
          Broker Integrations
        </h1>
        <p className="text-slate-400 text-sm">Connect E*TRADE or Schwab to sync positions and orders</p>
      </div>

      {error && (
        <div className="glass-card p-4 bg-orange-500/10 border border-orange-500/20">
          <p className="text-orange-300 text-sm">{error}</p>
        </div>
      )}

      {connections.length > 0 && (
        <div className="glass-card">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-white font-semibold">Connected Accounts</h3>
          </div>
          <div className="divide-y divide-slate-700">
            {connections.map(connection => (
              <div key={connection.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {availableBrokers.find(b => b.name.toLowerCase() === connection.broker_name.toLowerCase())?.logo}
                    </div>
                    <div>
                      <p className="text-white font-semibold capitalize">{connection.broker_name}</p>
                      <p className="text-slate-400 text-sm">Account: {connection.account_id}</p>
                      {connection.account_type && (
                        <p className="text-slate-500 text-xs capitalize">{connection.account_type}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {connection.status === 'connected' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-xs ${
                          connection.status === 'connected' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {connection.status}
                        </span>
                        {connection.last_synced_at && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-500 text-xs">
                              Synced {new Date(connection.last_synced_at).toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => syncBroker(connection.id)}
                      disabled={syncing === connection.id}
                      className="p-2 hover:bg-slate-700 rounded-lg transition disabled:opacity-50"
                      title="Sync Now"
                    >
                      {syncing === connection.id ? (
                        <Loader2 className="w-4 h-4 text-green-400 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 text-green-400" />
                      )}
                    </button>
                    <button
                      onClick={() => disconnectBroker(connection.id, connection.broker_name)}
                      disabled={loading}
                      className="p-2 hover:bg-slate-700 rounded-lg transition disabled:opacity-50"
                      title="Disconnect"
                    >
                      <XCircle className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {positions.length > 0 && (
                  <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-sm text-slate-400 mb-2">Recent Positions:</p>
                    <div className="space-y-1">
                      {positions.slice(0, 3).map((pos, i) => (
                        <div key={i} className="text-xs text-slate-300 flex justify-between">
                          <span>{pos.symbol}</span>
                          <span className={pos.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {pos.unrealized_pnl >= 0 ? '+' : ''}{pos.unrealized_pnl?.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-2">Available Brokers</h3>
        <p className="text-slate-400 text-sm mb-4">Click to connect via secure OAuth</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableBrokers.map(broker => (
            <button
              key={broker.name}
              onClick={() => {
                if (broker.supported && broker.oauth) {
                  handleBrokerClick(broker.name);
                }
              }}
              disabled={!broker.supported || loading}
              className={`p-5 rounded-lg border-2 transition text-left ${
                broker.supported
                  ? 'border-slate-700 hover:border-green-500 cursor-pointer hover:bg-slate-800/50'
                  : 'border-slate-800 opacity-50 cursor-not-allowed'
              } ${loading ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-4xl">{broker.logo}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{broker.name}</p>
                    {broker.oauth && broker.supported && (
                      <ExternalLink className="w-3 h-3 text-green-400" />
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{broker.description}</p>
                  {!broker.supported && (
                    <span className="inline-block mt-2 px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded">
                      Coming Soon
                    </span>
                  )}
                  {broker.supported && broker.oauth && (
                    <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                      OAuth Ready
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
            <Settings className="w-4 h-4 text-green-400" />
            How it works
          </h4>
          <ul className="text-slate-400 text-sm space-y-1.5">
            <li>• Click a broker to start OAuth connection</li>
            <li>• Authorize access in a secure popup window</li>
            <li>• Your credentials are encrypted and never exposed</li>
            <li>• Sync positions and orders automatically</li>
            <li>• Disconnect anytime from your connected accounts</li>
          </ul>
        </div>
      </div>

      <div className="glass-card p-4 bg-slate-800/50 border border-slate-700">
        <h4 className="text-white font-semibold text-sm mb-2">Setup Required</h4>
        <p className="text-slate-400 text-sm mb-3">
          To connect brokers, you need to configure API credentials in your environment:
        </p>
        <div className="space-y-2 text-xs font-mono">
          <div className="p-2 bg-slate-900 rounded border border-slate-700">
            <p className="text-orange-400">E*TRADE:</p>
            <p className="text-slate-400">ETRADE_CONSUMER_KEY, ETRADE_CONSUMER_SECRET</p>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-700">
            <p className="text-green-400">Schwab/TD Ameritrade:</p>
            <p className="text-slate-400">SCHWAB_APP_KEY, SCHWAB_APP_SECRET</p>
          </div>
        </div>
        <p className="text-slate-500 text-xs mt-3">
          Get API credentials from broker developer portals
        </p>
      </div>
    </div>
  );
}

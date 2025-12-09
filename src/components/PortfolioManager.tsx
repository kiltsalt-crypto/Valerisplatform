import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Briefcase, PieChart, TrendingUp, Plus } from 'lucide-react';

export default function PortfolioManager() {
  const { profile } = useAuth();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);

  useEffect(() => {
    loadPortfolios();
  }, []);

  useEffect(() => {
    if (selectedPortfolio) {
      loadPositions();
    }
  }, [selectedPortfolio]);

  const loadPortfolios = async () => {
    const { data } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setPortfolios(data);
      setSelectedPortfolio(data[0]);
    }
  };

  const loadPositions = async () => {
    const { data } = await supabase
      .from('portfolio_positions')
      .select('*')
      .eq('portfolio_id', selectedPortfolio?.id);

    if (data) setPositions(data);
  };

  const createPortfolio = async () => {
    await supabase.from('portfolios').insert({
      user_id: profile?.id,
      portfolio_name: `Portfolio ${portfolios.length + 1}`,
      portfolio_type: 'paper'
    });
    loadPortfolios();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-purple-400" />
            Portfolio Manager
          </h1>
          <p className="text-slate-400 text-sm">Manage multiple trading accounts</p>
        </div>
        <button
          onClick={createPortfolio}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700"
        >
          <Plus className="w-4 h-4" />
          New Portfolio
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {portfolios.map((portfolio) => (
          <button
            key={portfolio.id}
            onClick={() => setSelectedPortfolio(portfolio)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
              selectedPortfolio?.id === portfolio.id
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {portfolio.portfolio_name}
          </button>
        ))}
      </div>

      {selectedPortfolio && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4">
              <p className="text-slate-400 text-sm mb-1">Current Balance</p>
              <p className="text-2xl font-bold text-white">${selectedPortfolio.current_balance.toFixed(2)}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-slate-400 text-sm mb-1">Total P&L</p>
              <p className={`text-2xl font-bold ${selectedPortfolio.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${selectedPortfolio.total_pnl.toFixed(2)}
              </p>
            </div>
            <div className="glass-card p-4">
              <p className="text-slate-400 text-sm mb-1">Open Positions</p>
              <p className="text-2xl font-bold text-white">{positions.length}</p>
            </div>
          </div>

          <div className="glass-card p-4">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              Open Positions
            </h2>
            <div className="space-y-2">
              {positions.map((position) => (
                <div key={position.id} className="bg-slate-800/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-semibold">{position.instrument}</p>
                      <p className="text-slate-400 text-xs">
                        {position.position_type} • {position.quantity} contracts @ ${position.entry_price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${position.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${position.unrealized_pnl?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-slate-400 text-xs">Unrealized</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Upload, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function ImportExport() {
  const { profile } = useAuth();
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n').map(row => row.split(','));
        const headers = rows[0];
        const trades = rows.slice(1).filter(row => row.length > 1);

        let successful = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const row of trades) {
          try {
            const trade: any = {
              user_id: profile?.id,
              instrument: row[0],
              direction: row[1],
              entry_price: parseFloat(row[2]),
              exit_price: parseFloat(row[3]),
              quantity: parseInt(row[4]),
              pnl: parseFloat(row[5])
            };

            await supabase.from('trades').insert(trade);
            successful++;
          } catch (error) {
            failed++;
            errors.push(`Row ${successful + failed}: ${error}`);
          }
        }

        await supabase.from('trade_imports').insert({
          user_id: profile?.id,
          import_source: 'csv',
          file_name: file.name,
          total_records: trades.length,
          successful_imports: successful,
          failed_imports: failed,
          error_log: errors,
          import_status: failed === 0 ? 'completed' : 'completed'
        });

        setImportResult({ successful, failed, total: trades.length });
      } catch (error) {
        console.error('Import error:', error);
        setImportResult({ error: 'Failed to parse CSV file' });
      } finally {
        setImporting(false);
      }
    };

    reader.readAsText(file);
  };

  const exportTrades = async () => {
    const { data: trades } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: false });

    if (!trades || trades.length === 0) return;

    const csv = [
      ['Instrument', 'Direction', 'Entry Price', 'Exit Price', 'Quantity', 'P&L', 'Date'],
      ...trades.map(t => [
        t.instrument,
        t.direction,
        t.entry_price,
        t.exit_price,
        t.quantity,
        t.pnl,
        new Date(t.created_at).toISOString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <FileText className="w-7 h-7 text-purple-400" />
          Import & Export
        </h1>
        <p className="text-slate-400 text-sm">Manage your trading data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Upload className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Import Trades</h2>
              <p className="text-slate-400 text-xs">Upload CSV file</p>
            </div>
          </div>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={importing}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="block w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition cursor-pointer text-center font-semibold"
          >
            {importing ? 'Importing...' : 'Choose CSV File'}
          </label>

          {importResult && (
            <div className={`mt-4 p-3 rounded-lg ${
              importResult.error ? 'bg-red-500/20 border border-red-500/50' : 'bg-green-500/20 border border-green-500/50'
            }`}>
              {importResult.error ? (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{importResult.error}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <div className="text-sm">
                    <p className="font-semibold">Import Complete</p>
                    <p>{importResult.successful} of {importResult.total} trades imported successfully</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
            <p className="text-slate-400 text-xs mb-2">CSV Format:</p>
            <code className="text-xs text-slate-300">
              Instrument,Direction,Entry,Exit,Quantity,P&L
            </code>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Download className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Export Trades</h2>
              <p className="text-slate-400 text-xs">Download as CSV</p>
            </div>
          </div>

          <button
            onClick={exportTrades}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition font-semibold"
          >
            Export All Trades
          </button>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Compatible with Excel & Google Sheets</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Includes all trade data and timestamps</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Perfect for tax preparation</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-white font-semibold mb-3">Broker Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['TradingView', 'Interactive Brokers', 'ThinkorSwim'].map((broker) => (
            <div key={broker} className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-white font-semibold text-sm mb-1">{broker}</p>
              <button className="w-full mt-2 px-3 py-1.5 bg-slate-700 text-slate-300 rounded text-xs hover:bg-slate-600 transition">
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { X, Shield, Download, Trash2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface GDPRComplianceProps {
  onClose: () => void;
}

export default function GDPRCompliance({ onClose }: GDPRComplianceProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleExportData = async () => {
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      const tables = [
        'profiles',
        'trades',
        'user_subscriptions',
        'support_tickets',
        'user_activity_logs',
        'user_achievements',
        'user_experience'
      ];

      const exportData: any = {
        exportDate: new Date().toISOString(),
        userId: user.id,
        data: {}
      };

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', user.id);

        if (!error && data) {
          exportData.data[table] = data;
        }
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Your data has been exported successfully!' });
    } catch (error) {
      console.error('Error exporting data:', error);
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirm !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm account deletion.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.rpc('delete_user_account', {
        user_id_to_delete: user.id
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Your account has been scheduled for deletion. You will be logged out shortly.' });

      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
      }, 3000);
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({ type: 'error', text: 'Failed to delete account. Please contact support.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Privacy & Data Control</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {message && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p>{message.text}</p>
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">Your Privacy Rights</h3>
            <p className="text-slate-300 mb-4">
              Under GDPR and other privacy laws, you have the right to access, correct, export, and delete your personal data.
              Use the tools below to exercise your rights.
            </p>
            <ul className="space-y-2 text-slate-300 text-sm list-disc list-inside">
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to data portability</li>
              <li>Right to erasure (right to be forgotten)</li>
              <li>Right to restrict processing</li>
              <li>Right to object to processing</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Download className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Export Your Data</h3>
                <p className="text-slate-300 mb-4">
                  Download a complete copy of all your personal data stored in our system, including your profile,
                  trades, journal entries, and activity history. The data will be provided in JSON format.
                </p>
                <button
                  onClick={handleExportData}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Export My Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Request Data Correction</h3>
                <p className="text-slate-300 mb-4">
                  If you believe any of your personal data is inaccurate or incomplete, you can update most information
                  through your profile settings. For other corrections, please contact our support team.
                </p>
                <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                  Go to Profile Settings
                </button>
              </div>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Trash2 className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Delete Your Account</h3>
                <p className="text-slate-300 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone. All your trades,
                  journal entries, and personal information will be permanently removed from our servers within 30 days.
                </p>

                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-4">
                  <h4 className="text-white font-semibold mb-2">Before you delete:</h4>
                  <ul className="space-y-1 text-slate-300 text-sm list-disc list-inside">
                    <li>Export your data if you want to keep a copy</li>
                    <li>Cancel any active subscriptions</li>
                    <li>Your username and email will become available for reuse</li>
                    <li>This action is irreversible</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Type DELETE to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="DELETE"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading || deleteConfirm !== 'DELETE'}
                    className="w-full bg-red-500 hover:bg-red-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        Permanently Delete My Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">Questions?</h3>
            <p className="text-slate-300 mb-4">
              If you have questions about your privacy rights or need assistance with any of these options,
              please contact our Data Protection Officer.
            </p>
            <div className="text-slate-400 text-sm">
              <p>Email: privacy@blackcatsbook.com</p>
              <p>Response time: Within 30 days as required by GDPR</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

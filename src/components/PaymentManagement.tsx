import { useState, useEffect } from 'react';
import { X, DollarSign, FileText, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PaymentManagementProps {
  onClose: () => void;
}

export default function PaymentManagement({ onClose }: PaymentManagementProps) {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'payments' | 'invoices'>('payments');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [{ data: paymentsData }, { data: invoicesData }] = await Promise.all([
        supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      setPayments(paymentsData || []);
      setInvoices(invoicesData || []);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'failed':
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'failed':
      case 'cancelled':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Payment Management</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="border-b border-slate-700 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'payments'
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'invoices'
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              Invoices
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : activeTab === 'payments' ? (
            <div className="space-y-4">
              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No payment history yet</p>
                </div>
              ) : (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(payment.status)}
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            ${payment.amount.toFixed(2)} {payment.currency}
                          </h3>
                          <p className="text-slate-400 text-sm">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </div>
                    {payment.notes && (
                      <p className="text-slate-300 text-sm">{payment.notes}</p>
                    )}
                    {payment.transaction_id && (
                      <p className="text-slate-500 text-xs mt-2">
                        Transaction ID: {payment.transaction_id}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No invoices generated yet</p>
                </div>
              ) : (
                invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-blue-400" />
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            Invoice #{invoice.invoice_number}
                          </h3>
                          <p className="text-slate-400 text-sm">
                            ${invoice.amount.toFixed(2)} {invoice.currency}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                        <button className="text-blue-400 hover:text-blue-300 transition-colors">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    {invoice.due_date && (
                      <p className="text-slate-400 text-sm">
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </p>
                    )}
                    {invoice.paid_at && (
                      <p className="text-green-400 text-sm">
                        Paid: {new Date(invoice.paid_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

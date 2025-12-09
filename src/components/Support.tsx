import { useState } from 'react';
import { X, Mail, MessageSquare, BookOpen, HelpCircle, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SupportProps {
  onClose: () => void;
}

export default function Support({ onClose }: SupportProps) {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject,
          message,
          category,
          status: 'open'
        });

      if (error) throw error;

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Error submitting support ticket:', err);
      alert('Failed to submit support request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Support & Help</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Support Request Submitted!</h3>
              <p className="text-slate-300">
                We've received your message and will respond within 24-48 hours.
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-colors cursor-pointer">
                  <BookOpen className="w-8 h-8 text-blue-400 mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">Documentation</h3>
                  <p className="text-slate-400 text-sm">
                    Browse guides and tutorials to get started
                  </p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition-colors cursor-pointer">
                  <MessageSquare className="w-8 h-8 text-purple-400 mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">Community</h3>
                  <p className="text-slate-400 text-sm">
                    Ask questions in our active community forum
                  </p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-green-500 transition-colors cursor-pointer">
                  <HelpCircle className="w-8 h-8 text-green-400 mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">FAQ</h3>
                  <p className="text-slate-400 text-sm">
                    Find answers to commonly asked questions
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Mail className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Contact Support</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                      required
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing & Subscription</option>
                      <option value="feature">Feature Request</option>
                      <option value="bug">Bug Report</option>
                      <option value="account">Account Issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief description of your issue"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Provide as much detail as possible..."
                      rows={6}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Support Request
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Response Times</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Pro Tier:</span>
                      <span className="text-white ml-2">48 hours</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Elite Tier:</span>
                      <span className="text-white ml-2">24 hours</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Mentorship:</span>
                      <span className="text-white ml-2">Priority (6-12 hours)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h4 className="text-blue-400 font-semibold mb-2">Before contacting support:</h4>
                <ul className="text-slate-300 text-sm space-y-1 list-disc list-inside">
                  <li>Check if your issue is covered in our documentation</li>
                  <li>Search the community forum for similar questions</li>
                  <li>Try clearing your browser cache and refreshing</li>
                  <li>Ensure you're using a supported browser (Chrome, Firefox, Safari, Edge)</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

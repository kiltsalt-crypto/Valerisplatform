import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Clock, CheckCircle, XCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Reply {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  admin_name?: string;
}

export default function MyTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTicket) {
      fetchReplies(selectedTicket.id);
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_responses')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newReply.trim()) return;

    setSubmittingReply(true);

    try {
      const { error } = await supabase
        .from('support_responses')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user!.id,
          message: newReply.trim(),
          is_admin: false
        });

      if (error) throw error;

      await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedTicket.id);

      setNewReply('');
      fetchReplies(selectedTicket.id);
      fetchTickets();
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setSubmittingReply(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'in_progress':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'resolved':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'closed':
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-blue-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <MessageSquare className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Support Tickets</h1>
        <p className="text-slate-400">View and manage your support requests</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Your Tickets</h2>

            {tickets.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No tickets yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedTicket?.id === ticket.id
                        ? 'bg-blue-500/20 border-blue-500'
                        : 'bg-slate-700/50 border-slate-600 hover:border-blue-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold text-sm line-clamp-1">
                        {ticket.subject}
                      </h3>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs mb-2 line-clamp-2">
                      {ticket.message}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                      <span className={`capitalize font-semibold ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="border-b border-slate-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-400">
                        Created {new Date(selectedTicket.created_at).toLocaleDateString()}
                      </span>
                      <span className={`capitalize font-semibold ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority} priority
                      </span>
                      <span className="text-slate-400 capitalize">
                        {selectedTicket.category}
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusIcon(selectedTicket.status)}
                    <span className="font-semibold capitalize">{selectedTicket.status.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.message}
                  </p>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Conversation</h3>

                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {replies.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm">No replies yet. Our team will respond soon!</p>
                    </div>
                  ) : (
                    replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`p-4 rounded-lg ${
                          reply.is_admin
                            ? 'bg-blue-500/10 border border-blue-500/30 ml-0 mr-8'
                            : 'bg-slate-700/50 border border-slate-600 ml-8 mr-0'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-semibold ${reply.is_admin ? 'text-blue-400' : 'text-white'}`}>
                            {reply.is_admin ? 'Support Team' : 'You'}
                          </span>
                          <span className="text-slate-500 text-xs">
                            {new Date(reply.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap">
                          {reply.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                  <form onSubmit={handleSubmitReply} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Add Reply
                      </label>
                      <textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Type your message..."
                        rows={4}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReply || !newReply.trim()}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submittingReply ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Reply
                        </>
                      )}
                    </button>
                  </form>
                )}

                {(selectedTicket.status === 'closed' || selectedTicket.status === 'resolved') && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-semibold">This ticket has been {selectedTicket.status}</p>
                    <p className="text-slate-400 text-sm mt-1">
                      If you need further assistance, please submit a new ticket.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
              <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Select a Ticket</h3>
              <p className="text-slate-400">
                Choose a ticket from the list to view details and replies
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

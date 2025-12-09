import { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, AlertCircle, Send, User, Calendar, Tag, Filter, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  user?: {
    full_name: string | null;
    email: string;
  };
}

interface TicketResponse {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  created_at: string;
  is_admin_response: boolean;
}

export default function SupportManagement() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [responses, setResponses] = useState<Record<string, TicketResponse[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchTicketResponses(selectedTicket.id);
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketResponses = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_responses')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setResponses(prev => ({ ...prev, [ticketId]: data || [] }));
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', ticketId);

      if (error) throw error;
      await fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status, ...updates });
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const updateTicketPriority = async (ticketId: string, priority: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ priority, updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (error) throw error;
      await fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, priority });
      }
    } catch (error) {
      console.error('Error updating ticket priority:', error);
    }
  };

  const sendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('support_responses').insert({
        ticket_id: selectedTicket.id,
        user_id: user.id,
        message: replyMessage.trim(),
        is_admin_response: true
      });

      if (error) throw error;

      await updateTicketStatus(selectedTicket.id, 'in_progress');
      await fetchTicketResponses(selectedTicket.id);
      setReplyMessage('');
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'in_progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'resolved': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'closed': return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-5 h-5" />;
      case 'in_progress': return <Clock className="w-5 h-5" />;
      case 'resolved': return <CheckCircle className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    urgent: tickets.filter(t => t.priority === 'urgent' && t.status !== 'resolved').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-orange-400" />
            <span className="text-3xl font-black text-white">{stats.open}</span>
          </div>
          <p className="text-slate-300 font-medium">Open Tickets</p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-blue-400" />
            <span className="text-3xl font-black text-white">{stats.inProgress}</span>
          </div>
          <p className="text-slate-300 font-medium">In Progress</p>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <span className="text-3xl font-black text-white">{stats.resolved}</span>
          </div>
          <p className="text-slate-300 font-medium">Resolved</p>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <span className="text-3xl font-black text-white">{stats.urgent}</span>
          </div>
          <p className="text-slate-300 font-medium">Urgent</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`bg-slate-800/50 border rounded-xl p-4 cursor-pointer transition-all hover:border-blue-500/50 ${
                selectedTicket?.id === ticket.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{ticket.subject}</h4>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <User className="w-4 h-4" />
                    <span>{ticket.user?.full_name || ticket.user?.email || 'Unknown'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-3 line-clamp-2">{ticket.message}</p>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(ticket.created_at).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>{ticket.category}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredTickets.length === 0 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No tickets found</p>
            </div>
          )}
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          {selectedTicket ? (
            <div className="flex flex-col h-[600px]">
              <div className="border-b border-slate-700 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{selectedTicket.subject}</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1 text-slate-400">
                        <User className="w-4 h-4" />
                        <span>{selectedTicket.user?.full_name || selectedTicket.user?.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  {getStatusIcon(selectedTicket.status)}
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  <select
                    value={selectedTicket.priority}
                    onChange={(e) => updateTicketPriority(selectedTicket.id, e.target.value)}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                  <p className="text-white">{selectedTicket.message}</p>
                  <p className="text-slate-500 text-xs mt-2">
                    {new Date(selectedTicket.created_at).toLocaleString()}
                  </p>
                </div>

                {responses[selectedTicket.id]?.map((response) => (
                  <div
                    key={response.id}
                    className={`border rounded-lg p-4 ${
                      response.is_admin_response
                        ? 'bg-blue-500/10 border-blue-500/30 ml-8'
                        : 'bg-slate-900 border-slate-700 mr-8'
                    }`}
                  >
                    <p className="text-white">{response.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-slate-500 text-xs">
                        {new Date(response.created_at).toLocaleString()}
                      </p>
                      {response.is_admin_response && (
                        <span className="text-blue-400 text-xs font-semibold">Admin Response</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-700 p-4">
                <div className="flex gap-2">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your response..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                    rows={3}
                  />
                  <button
                    onClick={sendReply}
                    disabled={!replyMessage.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 rounded-lg transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[600px] text-center p-8">
              <MessageSquare className="w-16 h-16 text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Ticket Selected</h3>
              <p className="text-slate-400">Select a ticket from the list to view details and respond</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

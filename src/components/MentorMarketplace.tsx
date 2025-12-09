import { useState, useEffect } from 'react';
import { Users, Star, Calendar, DollarSign, Clock, Video, MessageSquare, Award, Search, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Mentor {
  id: string;
  full_name: string;
  email: string;
  mentor_profile: {
    title: string;
    bio: string;
    years_experience: number;
    specialties: string[];
    hourly_rate: number;
    available: boolean;
    total_sessions: number;
    rating: number;
    review_count: number;
  };
}

interface Session {
  id: string;
  mentor: {
    full_name: string;
  };
  session_date: string;
  duration_minutes: number;
  status: string;
  session_type: string | null;
  price: number;
}

interface BookingForm {
  sessionType: 'review' | 'coaching' | 'strategy';
  date: string;
  time: string;
  notes: string;
}

export default function MentorMarketplace() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [bookingStep, setBookingStep] = useState<'select' | 'schedule' | 'confirm'>('select');
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    sessionType: 'review',
    date: '',
    time: '09:00',
    notes: ''
  });

  const specialties = ['Day Trading', 'Swing Trading', 'Scalping', 'Options', 'Psychology', 'Technical Analysis', 'Risk Management'];

  const sessionTypeDetails = {
    review: { duration: 60, label: 'Trade Review (60 min)' },
    coaching: { duration: 90, label: '1-on-1 Coaching (90 min)' },
    strategy: { duration: 120, label: 'Strategy Development (120 min)' }
  };

  useEffect(() => {
    fetchMentors();
    if (user) {
      fetchUpcomingSessions();
    }
  }, [user]);

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          mentor_profile:mentor_profiles!inner(
            title,
            bio,
            years_experience,
            specialties,
            hourly_rate,
            available,
            total_sessions,
            rating,
            review_count
          )
        `)
        .eq('is_mentor', true);

      if (error) throw error;

      setMentors(data || []);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('mentor_sessions')
        .select(`
          id,
          session_date,
          duration_minutes,
          status,
          session_type,
          price,
          mentor:profiles!mentor_sessions_mentor_id_fkey(full_name)
        `)
        .eq('mentee_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .order('session_date', { ascending: true });

      if (error) throw error;

      setUpcomingSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.mentor_profile.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = filterSpecialty === 'all' ||
      mentor.mentor_profile.specialties.some(s => s === filterSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  const bookSession = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setBookingStep('schedule');
  };

  const handleBooking = async () => {
    if (!selectedMentor || !user) return;

    const sessionCost = selectedMentor.mentor_profile.hourly_rate;
    const serviceFee = Math.round(sessionCost * 0.15 * 100) / 100;
    const totalCost = sessionCost + serviceFee;

    const sessionDateTime = new Date(`${bookingForm.date}T${bookingForm.time}`);

    try {
      const { error } = await supabase
        .from('mentor_sessions')
        .insert({
          mentor_id: selectedMentor.id,
          mentee_id: user.id,
          session_date: sessionDateTime.toISOString(),
          duration_minutes: sessionTypeDetails[bookingForm.sessionType].duration,
          session_type: bookingForm.sessionType,
          status: 'pending',
          price: sessionCost,
          service_fee: serviceFee,
          total_cost: totalCost,
          session_notes: bookingForm.notes
        });

      if (error) throw error;

      alert('Session booked successfully! The mentor will confirm your booking soon.');
      setSelectedMentor(null);
      setBookingStep('select');
      setBookingForm({
        sessionType: 'review',
        date: '',
        time: '09:00',
        notes: ''
      });
      fetchUpcomingSessions();
    } catch (error) {
      console.error('Error booking session:', error);
      alert('Failed to book session. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-7 h-7 text-blue-400" />
          Mentor Marketplace
        </h1>
      </div>

      {upcomingSessions.length > 0 && (
        <div className="glass-card p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Upcoming Sessions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingSessions.map(session => {
              const sessionDate = new Date(session.session_date);
              return (
                <div key={session.id} className="bg-slate-800/50 p-4 rounded-lg border border-blue-500/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold">{session.mentor.full_name}</p>
                      <p className="text-slate-400 text-sm capitalize">{session.session_type || 'Session'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      session.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{sessionDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session.duration_minutes}min)</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    Cost: <span className="text-white font-semibold">${session.price}</span>
                  </div>
                  {session.status === 'confirmed' && (
                    <button className="w-full mt-3 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition text-sm flex items-center justify-center gap-2">
                      <Video className="w-4 h-4" />
                      Join Session
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search mentors..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm"
            />
          </div>
          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm"
          >
            <option value="all">All Specialties</option>
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
        </div>

        {mentors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No mentors available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMentors.map(mentor => {
              const initials = mentor.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
              return (
                <div key={mentor.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-blue-500/30 transition">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 font-bold text-xl">{initials}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h3 className="text-white font-bold">{mentor.full_name}</h3>
                          <p className="text-slate-400 text-sm">{mentor.mentor_profile.title}</p>
                        </div>
                        {mentor.mentor_profile.available && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                            Available
                          </span>
                        )}
                      </div>
                      {mentor.mentor_profile.rating > 0 && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-white font-semibold text-sm">{mentor.mentor_profile.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-slate-500 text-xs">({mentor.mentor_profile.review_count} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-900/50 p-2 rounded text-center">
                      <p className="text-slate-400 text-xs mb-1">Experience</p>
                      <p className="text-white font-bold">{mentor.mentor_profile.years_experience}y</p>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded text-center">
                      <p className="text-slate-400 text-xs mb-1">Sessions</p>
                      <p className="text-white font-bold">{mentor.mentor_profile.total_sessions}</p>
                    </div>
                  </div>

                  {mentor.mentor_profile.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {mentor.mentor_profile.specialties.map((specialty, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-bold text-lg">${mentor.mentor_profile.hourly_rate}</span>
                      <span className="text-slate-400 text-sm">/hour</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => bookSession(mentor)}
                        disabled={!mentor.mentor_profile.available}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition text-sm"
                      >
                        Book Session
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedMentor && bookingStep === 'schedule' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 max-w-lg w-full">
            <h3 className="text-white font-bold text-xl mb-4">Book Session with {selectedMentor.full_name}</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Session Type</label>
                <select
                  value={bookingForm.sessionType}
                  onChange={(e) => setBookingForm({ ...bookingForm, sessionType: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="review">{sessionTypeDetails.review.label}</option>
                  <option value="coaching">{sessionTypeDetails.coaching.label}</option>
                  <option value="strategy">{sessionTypeDetails.strategy.label}</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Preferred Date</label>
                <input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Preferred Time</label>
                <select
                  value={bookingForm.time}
                  onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Session Notes (Optional)</label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  rows={3}
                  placeholder="What would you like to focus on?"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400">Session Cost:</span>
                  <span className="text-white font-bold">${selectedMentor.mentor_profile.hourly_rate.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Service Fee (15%):</span>
                  <span className="text-white font-bold">${(selectedMentor.mentor_profile.hourly_rate * 0.15).toFixed(2)}</span>
                </div>
                <div className="border-t border-blue-500/20 mt-2 pt-2 flex items-center justify-between">
                  <span className="text-white font-semibold">Total:</span>
                  <span className="text-blue-400 font-bold text-xl">${(selectedMentor.mentor_profile.hourly_rate * 1.15).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedMentor(null);
                  setBookingStep('select');
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                disabled={!bookingForm.date}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-4">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-400" />
          Why Work with a Mentor?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
              <Video className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Personalized Guidance</h4>
            <p className="text-slate-400 text-sm">Get 1-on-1 feedback on your trades and strategy</p>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Learn from the Best</h4>
            <p className="text-slate-400 text-sm">Work with proven, experienced professional traders</p>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Accelerate Growth</h4>
            <p className="text-slate-400 text-sm">Avoid common mistakes and fast-track your progress</p>
          </div>
        </div>
      </div>
    </div>
  );
}

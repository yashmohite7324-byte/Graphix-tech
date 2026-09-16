import { useState } from 'react';
import { Calendar, Clock, MapPin, Video, Users, Plus, X } from 'lucide-react';

interface Interview {
  id: number;
  candidateName: string;
  jobTitle: string;
  round: string;
  dateTime: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  meetingLink?: string;
  venue?: string;
  panel: string;
  status: 'upcoming' | 'past';
  result?: string;
}

export default function RecruiterInterviewsPage() {
  const [showModal, setShowModal] = useState(false);
  const [interviews, setInterviews] = useState<Interview[]>([]); // Removed mock data

  const [form, setForm] = useState({ candidateName: '', jobTitle: '', round: 'Technical Round 1', dateTime: '', mode: 'Online' as 'Online' | 'Offline' | 'Hybrid', meetingLink: '', venue: '', panel: '' });

  const upcoming = interviews.filter(i => i.status === 'upcoming');
  const past = interviews.filter(i => i.status === 'past');

  const handleSchedule = () => {
    const newInterview: Interview = { ...form, id: Date.now(), status: 'upcoming' };
    setInterviews([...interviews, newInterview]);
    setShowModal(false);
    setForm({ candidateName: '', jobTitle: '', round: 'Technical Round 1', dateTime: '', mode: 'Online', meetingLink: '', venue: '', panel: '' });
  };

  const roundColors: Record<string, string> = {
    'Technical Round 1': 'bg-blue-100 text-blue-700 border-blue-200',
    'Technical Round 2': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'HR Round': 'bg-green-100 text-green-700 border-green-200',
    'Group Discussion': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  const InterviewCard = ({ interview }: { interview: Interview }) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">{interview.candidateName}</h3>
          <p className="font-medium text-slate-500 mt-0.5">{interview.jobTitle}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${roundColors[interview.round] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
          {interview.round}
        </span>
      </div>
      <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600">
        <div className="flex items-center gap-3"><Calendar size={16} className="text-slate-400" /> <span className="font-medium">{new Date(interview.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
        <div className="flex items-center gap-3"><Clock size={16} className="text-slate-400" /> <span className="font-medium">{new Date(interview.dateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>
        <div className="flex items-center gap-3">
          {interview.mode === 'Online' ? <Video size={16} className="text-slate-400" /> : <MapPin size={16} className="text-slate-400" />}
          <span className="font-medium">{interview.mode} {interview.venue && `— ${interview.venue}`}</span>
        </div>
        <div className="flex items-center gap-3"><Users size={16} className="text-slate-400" /> <span className="font-medium line-clamp-1">{interview.panel}</span></div>
      </div>
      {interview.meetingLink && interview.status === 'upcoming' && (
        <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="mt-4 block text-center w-full bg-brand-50 text-brand-700 font-bold py-2.5 rounded-lg hover:bg-brand-100 transition-colors">Join Meeting</a>
      )}
      {interview.result && (
        <div className={`mt-4 py-2 text-center text-sm font-bold rounded-lg ${interview.result === 'Selected' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          Result: {interview.result}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-brand-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <div>
              <h1 className="text-3xl font-bold">Interviews</h1>
              <p className="text-brand-100 text-sm md:text-base mt-2 opacity-90 max-w-xl">
                  Manage your upcoming and past candidate interviews.
              </p>
          </div>
          <button onClick={() => setShowModal(true)} className="mt-4 md:mt-0 bg-white text-brand-600 px-5 py-2.5 rounded-xl font-bold hover:bg-brand-50 transition-colors flex items-center gap-2 shadow-sm">
              <Plus size={18} /> Schedule Interview
          </button>
      </div>

      {/* Upcoming */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            Upcoming <span className="bg-brand-100 text-brand-700 text-xs px-2.5 py-1 rounded-full">{upcoming.length}</span>
        </h2>
        {upcoming.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No upcoming interviews scheduled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map(i => <InterviewCard key={i.id} interview={i} />)}
          </div>
        )}
      </div>

      {/* Past */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            Past <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full">{past.length}</span>
        </h2>
        {past.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No past interviews.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {past.map(i => <InterviewCard key={i.id} interview={i} />)}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-fadeIn">
            <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Schedule Interview</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Candidate Name</label>
                <input type="text" value={form.candidateName} onChange={e => setForm({...form, candidateName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" placeholder="e.g. Alice Smith" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Title</label>
                <input type="text" value={form.jobTitle} onChange={e => setForm({...form, jobTitle: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" placeholder="e.g. Software Engineer" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Round</label>
                  <select value={form.round} onChange={e => setForm({...form, round: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all">
                    <option>Technical Round 1</option>
                    <option>Technical Round 2</option>
                    <option>HR Round</option>
                    <option>Group Discussion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mode</label>
                  <select value={form.mode} onChange={e => setForm({...form, mode: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all">
                    <option>Online</option>
                    <option>Offline</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date & Time</label>
                <input type="datetime-local" value={form.dateTime} onChange={e => setForm({...form, dateTime: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
              </div>
              
              {form.mode !== 'Offline' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Meeting Link</label>
                  <input type="text" value={form.meetingLink} onChange={e => setForm({...form, meetingLink: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" placeholder="e.g. https://zoom.us/..." />
                </div>
              )}
              {form.mode !== 'Online' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Venue</label>
                  <input type="text" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" placeholder="e.g. Room 404, Building C" />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Panel Members</label>
                <input type="text" value={form.panel} onChange={e => setForm({...form, panel: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" placeholder="e.g. John Doe, Sarah Smith" />
              </div>

              <button 
                onClick={handleSchedule}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-brand-500/30 mt-4"
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

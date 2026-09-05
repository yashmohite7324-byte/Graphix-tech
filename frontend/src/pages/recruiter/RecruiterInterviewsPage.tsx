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
  const [interviews, setInterviews] = useState<Interview[]>([
    { id: 1, candidateName: 'Alice Smith', jobTitle: 'SDE Intern', round: 'Technical Round 1', dateTime: '2026-09-10T10:00', mode: 'Online', meetingLink: 'https://meet.google.com/abc', panel: 'Dr. Kumar, Prof. Shah', status: 'upcoming' },
    { id: 2, candidateName: 'Bob Jones', jobTitle: 'Data Analyst', round: 'HR Round', dateTime: '2026-09-12T14:00', mode: 'Offline', venue: 'Room 204, Block A', panel: 'Ms. Patel', status: 'upcoming' },
    { id: 3, candidateName: 'Charlie Brown', jobTitle: 'SDE Intern', round: 'Technical Round 1', dateTime: '2026-08-20T11:00', mode: 'Online', meetingLink: 'https://meet.google.com/xyz', panel: 'Dr. Kumar', status: 'past', result: 'Selected' },
    { id: 4, candidateName: 'Diana Prince', jobTitle: 'Frontend Dev', round: 'Technical Round 2', dateTime: '2026-08-18T15:00', mode: 'Hybrid', venue: 'Room 101', meetingLink: 'https://zoom.us/j/123', panel: 'Mr. Rao, Prof. Shah', status: 'past', result: 'Rejected' },
  ]);

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
    'Technical Round 1': 'bg-blue-100 text-blue-700',
    'Technical Round 2': 'bg-indigo-100 text-indigo-700',
    'HR Round': 'bg-green-100 text-green-700',
    'Group Discussion': 'bg-yellow-100 text-yellow-700',
  };

  const InterviewCard = ({ interview }: { interview: Interview }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-100">{interview.candidateName}</h3>
          <p className="text-sm text-slate-400">{interview.jobTitle}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roundColors[interview.round] || 'bg-slate-600 text-slate-200'}`}>
          {interview.round}
        </span>
      </div>
      <div className="space-y-2 text-sm text-slate-400">
        <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(interview.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        <div className="flex items-center gap-2"><Clock size={14} /> {new Date(interview.dateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
        <div className="flex items-center gap-2">
          {interview.mode === 'Online' ? <Video size={14} /> : <MapPin size={14} />}
          {interview.mode} {interview.venue && `— ${interview.venue}`}
        </div>
        <div className="flex items-center gap-2"><Users size={14} /> {interview.panel}</div>
      </div>
      {interview.meetingLink && interview.status === 'upcoming' && (
        <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-brand-400 hover:text-brand-300">Join Meeting →</a>
      )}
      {interview.result && (
        <div className={`mt-3 text-sm font-medium ${interview.result === 'Selected' ? 'text-green-400' : 'text-red-400'}`}>
          Result: {interview.result}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-200">Interviews</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Schedule Interview</button>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-lg font-semibold text-slate-300 mb-4">Upcoming ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <p className="text-slate-500 text-sm">No upcoming interviews scheduled.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map(i => <InterviewCard key={i.id} interview={i} />)}
          </div>
        )}
      </div>

      {/* Past */}
      <div>
        <h2 className="text-lg font-semibold text-slate-300 mb-4">Past ({past.length})</h2>
        {past.length === 0 ? (
          <p className="text-slate-500 text-sm">No past interviews.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {past.map(i => <InterviewCard key={i.id} interview={i} />)}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-200">Schedule Interview</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200"><X size={20} /></button>
            </div>
            <input className="input w-full" placeholder="Candidate Name" value={form.candidateName} onChange={e => setForm({...form, candidateName: e.target.value})} />
            <input className="input w-full" placeholder="Job Title" value={form.jobTitle} onChange={e => setForm({...form, jobTitle: e.target.value})} />
            <select className="input w-full" value={form.round} onChange={e => setForm({...form, round: e.target.value})}>
              <option>Technical Round 1</option>
              <option>Technical Round 2</option>
              <option>HR Round</option>
              <option>Group Discussion</option>
            </select>
            <input className="input w-full" type="datetime-local" value={form.dateTime} onChange={e => setForm({...form, dateTime: e.target.value})} />
            <select className="input w-full" value={form.mode} onChange={e => setForm({...form, mode: e.target.value as any})}>
              <option>Online</option>
              <option>Offline</option>
              <option>Hybrid</option>
            </select>
            {(form.mode === 'Online' || form.mode === 'Hybrid') && (
              <input className="input w-full" placeholder="Meeting Link" value={form.meetingLink} onChange={e => setForm({...form, meetingLink: e.target.value})} />
            )}
            {(form.mode === 'Offline' || form.mode === 'Hybrid') && (
              <input className="input w-full" placeholder="Venue" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} />
            )}
            <input className="input w-full" placeholder="Panel Members (comma-separated)" value={form.panel} onChange={e => setForm({...form, panel: e.target.value})} />
            <button onClick={handleSchedule} className="btn-primary w-full">Schedule</button>
          </div>
        </div>
      )}
    </div>
  );
}

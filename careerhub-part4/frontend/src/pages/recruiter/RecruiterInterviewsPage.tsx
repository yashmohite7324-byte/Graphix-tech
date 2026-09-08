import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewApi, jobsApi, recruiterApi } from '../../api';
import { StatusBadge, PageLoader, EmptyState, SectionHeader } from '../../components/ui';
import { Calendar, Plus, X, Clock, Video, MapPin, Loader2, Users } from 'lucide-react';

function ScheduleInterviewModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    applicationId: '',
    round: '1',
    scheduledAt: '',
    mode: 'ONLINE',
    venue: '',
    meetingLink: '',
    panel: '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data: any) => interviewApi.schedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-interviews'] });
      onClose();
    },
    onError: (err: any) => setError(err.response?.data?.error || 'Failed to schedule interview'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold">Schedule Interview</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Application ID *</label>
              <input className="input" type="number" placeholder="e.g. 1"
                value={form.applicationId} onChange={e => setForm({ ...form, applicationId: e.target.value })} required />
              <p className="text-xs text-slate-400 mt-1">From the candidate pipeline</p>
            </div>
            <div>
              <label className="label">Round Number *</label>
              <select className="input" value={form.round}
                onChange={e => setForm({ ...form, round: e.target.value })}>
                {[1, 2, 3, 4, 5].map(r => (
                  <option key={r} value={r}>Round {r}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Date & Time *</label>
            <input className="input" type="datetime-local"
              value={form.scheduledAt}
              min={new Date().toISOString().slice(0, 16)}
              onChange={e => setForm({ ...form, scheduledAt: e.target.value })} required />
          </div>

          <div>
            <label className="label">Interview Mode *</label>
            <div className="flex gap-2">
              {['ONLINE', 'OFFLINE', 'HYBRID'].map(mode => (
                <button key={mode} type="button"
                  onClick={() => setForm({ ...form, mode })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.mode === mode
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                  }`}
                >
                  {mode === 'ONLINE' && '🎥 '}
                  {mode === 'OFFLINE' && '📍 '}
                  {mode === 'HYBRID' && '🔀 '}
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {(form.mode === 'ONLINE' || form.mode === 'HYBRID') && (
            <div>
              <label className="label">Meeting Link</label>
              <input className="input" placeholder="https://meet.google.com/..."
                value={form.meetingLink} onChange={e => setForm({ ...form, meetingLink: e.target.value })} />
            </div>
          )}

          {(form.mode === 'OFFLINE' || form.mode === 'HYBRID') && (
            <div>
              <label className="label">Venue</label>
              <input className="input" placeholder="e.g. Block A, Room 201, Graphix Campus"
                value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} />
            </div>
          )}

          <div>
            <label className="label">Interview Panel</label>
            <input className="input" placeholder="e.g. Mr. Sharma, Ms. Priya (comma separated)"
              value={form.panel} onChange={e => setForm({ ...form, panel: e.target.value })} />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button
              onClick={() => mutation.mutate({
                applicationId: parseInt(form.applicationId),
                round: parseInt(form.round),
                scheduledAt: form.scheduledAt,
                mode: form.mode,
                venue: form.venue || null,
                meetingLink: form.meetingLink || null,
                panel: form.panel || null,
              })}
              disabled={!form.applicationId || !form.scheduledAt || mutation.isPending}
              className="btn-primary flex-1 justify-center"
            >
              {mutation.isPending
                ? <><Loader2 size={15} className="animate-spin" /> Scheduling...</>
                : <><Calendar size={15} /> Schedule Interview</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecruiterInterviewsPage() {
  const [showModal, setShowModal] = useState(false);

  const { data: res, isLoading } = useQuery({
    queryKey: ['recruiter-interviews'],
    queryFn: () => interviewApi.getAll(),
  });

  if (isLoading) return <PageLoader />;
  const interviews = res?.data?.data || [];

  const upcoming = interviews.filter((i: any) =>
    i.result === 'PENDING' && new Date(i.scheduledAt) > new Date()
  );
  const past = interviews.filter((i: any) =>
    i.result !== 'PENDING' || new Date(i.scheduledAt) <= new Date()
  );

  return (
    <div className="space-y-6">
      {showModal && <ScheduleInterviewModal onClose={() => setShowModal(false)} />}

      <SectionHeader
        title="Interview Management"
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} /> Schedule Interview
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Interviews', value: interviews.length, color: 'bg-blue-50 text-blue-600' },
          { label: 'Upcoming', value: upcoming.length, color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Completed', value: past.length, color: 'bg-green-50 text-green-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${s.color}`}>
              {s.value}
            </div>
            <p className="text-sm font-medium text-slate-600">{s.label}</p>
          </div>
        ))}
      </div>

      {interviews.length === 0 ? (
        <EmptyState
          icon={<Calendar size={28} />}
          title="No interviews scheduled yet"
          description="Schedule your first interview by clicking the button above."
        />
      ) : (
        <div className="space-y-4">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-3">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map((iv: any) => <InterviewRow key={iv.id} interview={iv} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-3">
                Past ({past.length})
              </h2>
              <div className="space-y-3">
                {past.map((iv: any) => <InterviewRow key={iv.id} interview={iv} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InterviewRow({ interview }: { interview: any }) {
  const scheduled = interview.scheduledAt ? new Date(interview.scheduledAt) : null;

  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 font-bold flex-shrink-0">
        R{interview.round}
      </div>
      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <p className="text-xs text-slate-400">Candidate</p>
          <p className="text-sm font-semibold text-slate-900">
            {interview.application?.student?.fullName || `App #${interview.application?.id}`}
          </p>
        </div>
        {scheduled && (
          <div>
            <p className="text-xs text-slate-400">Scheduled</p>
            <p className="text-sm text-slate-700 flex items-center gap-1">
              <Clock size={13} className="text-slate-400" />
              {scheduled.toLocaleDateString()} {scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}
        <div>
          <p className="text-xs text-slate-400">Mode</p>
          <p className="text-sm text-slate-700 flex items-center gap-1">
            {interview.mode === 'ONLINE'
              ? <><Video size={13} className="text-slate-400" /> Online</>
              : <><MapPin size={13} className="text-slate-400" /> {interview.mode}</>
            }
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Result</p>
          <StatusBadge status={interview.result || 'PENDING'} />
        </div>
      </div>
    </div>
  );
}

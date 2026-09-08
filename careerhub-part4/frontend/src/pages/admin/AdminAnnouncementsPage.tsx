import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { EmptyState, PageLoader, SectionHeader } from '../../components/ui';
import { Megaphone, Plus, X, Trash2, Loader2 } from 'lucide-react';

function CreateAnnouncementModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: '', message: '', targetRole: 'ALL',
    targetBranch: '', targetBatchYear: '',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/announcements', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold">Create Announcement</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" placeholder="Announcement title"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Message *</label>
            <textarea className="input min-h-24 resize-none" placeholder="Write your announcement..."
              value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Target Role</label>
              <select className="input" value={form.targetRole}
                onChange={e => setForm({ ...form, targetRole: e.target.value })}>
                <option value="ALL">All Users</option>
                <option value="STUDENT">Students Only</option>
                <option value="RECRUITER">Recruiters Only</option>
                <option value="TRAINER">Trainers Only</option>
              </select>
            </div>
            <div>
              <label className="label">Target Branch</label>
              <input className="input" placeholder="e.g. CSE (optional)"
                value={form.targetBranch} onChange={e => setForm({ ...form, targetBranch: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Target Batch Year (optional)</label>
            <input className="input" type="number" placeholder="e.g. 2026"
              value={form.targetBatchYear} onChange={e => setForm({ ...form, targetBatchYear: e.target.value })} />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button
              onClick={() => mutation.mutate({
                ...form,
                targetBatchYear: form.targetBatchYear ? parseInt(form.targetBatchYear) : null,
              })}
              disabled={!form.title || !form.message || mutation.isPending}
              className="btn-primary flex-1 justify-center"
            >
              {mutation.isPending
                ? <><Loader2 size={15} className="animate-spin" /> Publishing...</>
                : <><Megaphone size={15} /> Publish</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminAnnouncementsPage() {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: res, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => api.get('/announcements'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/announcements/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });

  if (isLoading) return <PageLoader />;
  const announcements = res?.data?.data || [];

  return (
    <div className="space-y-6">
      {showModal && <CreateAnnouncementModal onClose={() => setShowModal(false)} />}

      <SectionHeader
        title="Announcements"
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} /> New Announcement
          </button>
        }
      />

      {announcements.length === 0 ? (
        <EmptyState
          icon={<Megaphone size={28} />}
          title="No announcements yet"
          description="Create an announcement to broadcast to students, recruiters, or trainers."
        />
      ) : (
        <div className="space-y-3">
          {announcements.map((a: any) => (
            <div key={a.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 flex-1">
                  <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 flex-shrink-0">
                    <Megaphone size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-slate-900">{a.title}</h3>
                      <span className="badge-yellow text-xs">
                        {a.targetRole || 'ALL'}
                      </span>
                      {a.targetBranch && (
                        <span className="badge-blue text-xs">{a.targetBranch}</span>
                      )}
                      {a.targetBatchYear && (
                        <span className="badge-slate text-xs">Batch {a.targetBatchYear}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{a.message}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                      <span>By {a.createdByEmail}</span>
                      <span>•</span>
                      <span>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(a.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Delete announcement"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

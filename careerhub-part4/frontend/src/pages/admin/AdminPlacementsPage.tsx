import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { placementApi } from '../../api';
import { StatusBadge, PageLoader, EmptyState, SectionHeader, StatCard } from '../../components/ui';
import {
  GraduationCap, Plus, X, DollarSign,
  TrendingUp, Building2, Loader2
} from 'lucide-react';

function RecordPlacementModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    studentId: '', companyId: '', ctcOffered: '',
    designation: '', location: '', joiningDate: '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data: any) => placementApi.record(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placements'] });
      queryClient.invalidateQueries({ queryKey: ['placement-stats'] });
      onClose();
    },
    onError: (err: any) => setError(err.response?.data?.error || 'Failed to record placement'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      studentId: parseInt(form.studentId),
      companyId: parseInt(form.companyId),
      ctcOffered: parseFloat(form.ctcOffered),
      designation: form.designation,
      location: form.location,
      joiningDate: form.joiningDate || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-slate-900">Record Placement</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Student ID *</label>
              <input className="input" type="number" placeholder="e.g. 1"
                value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} required />
            </div>
            <div>
              <label className="label">Company ID *</label>
              <input className="input" type="number" placeholder="e.g. 1"
                value={form.companyId} onChange={e => setForm({ ...form, companyId: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="label">CTC Offered (₹) *</label>
            <input className="input" type="number" placeholder="e.g. 600000"
              value={form.ctcOffered} onChange={e => setForm({ ...form, ctcOffered: e.target.value })} required />
            <p className="text-xs text-slate-400 mt-1">Enter in rupees (e.g. 600000 for ₹6L)</p>
          </div>
          <div>
            <label className="label">Designation</label>
            <input className="input" placeholder="e.g. Software Engineer"
              value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" placeholder="e.g. Bangalore"
              value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="label">Joining Date</label>
            <input className="input" type="date"
              value={form.joiningDate} onChange={e => setForm({ ...form, joiningDate: e.target.value })} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 justify-center">
              {mutation.isPending ? <><Loader2 size={15} className="animate-spin" /> Recording...</> : 'Record Placement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPlacementsPage() {
  const [showModal, setShowModal] = useState(false);

  const { data: placementsRes, isLoading } = useQuery({
    queryKey: ['placements'],
    queryFn: () => placementApi.getAll(),
  });

  const { data: statsRes } = useQuery({
    queryKey: ['placement-stats'],
    queryFn: () => placementApi.getStats(),
  });

  if (isLoading) return <PageLoader />;

  const placements = placementsRes?.data?.data || [];
  const stats = statsRes?.data?.data || {};

  return (
    <div className="space-y-6">
      {showModal && <RecordPlacementModal onClose={() => setShowModal(false)} />}

      <SectionHeader
        title="Placement Records"
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} /> Record Placement
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Placements"
          value={stats.totalPlacements || 0}
          icon={<GraduationCap size={22} />}
          color="green"
        />
        <StatCard
          label="Average CTC"
          value={stats.averageCtc ? `₹${(stats.averageCtc / 100000).toFixed(1)}L` : '—'}
          icon={<DollarSign size={22} />}
          color="blue"
        />
        <StatCard
          label="Highest CTC"
          value={stats.highestCtc ? `₹${(stats.highestCtc / 100000).toFixed(1)}L` : '—'}
          icon={<TrendingUp size={22} />}
          color="purple"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3>All Placement Records</h3>
        </div>
        {placements.length === 0 ? (
          <EmptyState
            icon={<GraduationCap size={28} />}
            title="No placements recorded yet"
            description="Use the Record Placement button to add placement offers."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="table-header">Student</th>
                  <th className="table-header">Company</th>
                  <th className="table-header">Designation</th>
                  <th className="table-header">CTC</th>
                  <th className="table-header">Location</th>
                  <th className="table-header">Joining Date</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {placements.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">
                          {p.student?.fullName?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{p.student?.fullName || `Student #${p.student?.id}`}</p>
                          <p className="text-xs text-slate-400">{p.student?.branch} • {p.student?.batchYear}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-slate-400" />
                        <span className="text-sm">{p.company?.name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-sm">{p.designation || '—'}</td>
                    <td className="table-cell">
                      <span className="text-sm font-bold text-green-600">
                        ₹{p.ctcOffered ? (p.ctcOffered / 100000).toFixed(1) + 'L' : '—'}
                      </span>
                    </td>
                    <td className="table-cell text-sm">{p.location || '—'}</td>
                    <td className="table-cell text-sm">
                      {p.joiningDate ? new Date(p.joiningDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

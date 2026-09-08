import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { recruiterApi } from '../../api';
import { CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA', 'MCA'];

export default function RecruiterPostJobPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    ctc: '',
    applicationDeadline: '',
    minCgpa: '',
    maxBacklogs: '',
    eligibleBranches: [] as string[],
    eligibleBatchYear: '',
    requiredSkills: '',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => recruiterApi.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      setSuccess(true);
      setTimeout(() => navigate('/recruiter/jobs'), 2000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to post job');
    },
  });

  const toggleBranch = (branch: string) => {
    setForm(prev => ({
      ...prev,
      eligibleBranches: prev.eligibleBranches.includes(branch)
        ? prev.eligibleBranches.filter(b => b !== branch)
        : [...prev.eligibleBranches, branch],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate({
      title: form.title,
      description: form.description,
      ctc: form.ctc ? parseFloat(form.ctc) : null,
      applicationDeadline: form.applicationDeadline || null,
      minCgpa: form.minCgpa ? parseFloat(form.minCgpa) : null,
      maxBacklogs: form.maxBacklogs !== '' ? parseInt(form.maxBacklogs) : null,
      eligibleBranches: form.eligibleBranches.join(',') || null,
      eligibleBatchYear: form.eligibleBatchYear ? parseInt(form.eligibleBatchYear) : null,
      requiredSkills: form.requiredSkills || null,
    });
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Job Posted Successfully!</h2>
        <p className="text-sm text-slate-500">Redirecting to your jobs list...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={18} className="text-slate-500" />
        </button>
        <div>
          <h1>Post a New Job</h1>
          <p className="text-slate-500 text-sm mt-0.5">Fill in the details to start receiving applications.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="card p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-900 pb-2 border-b border-slate-100">
            Job Details
          </h3>
          <div>
            <label className="label">Job Title *</label>
            <input className="input" placeholder="e.g. Software Engineer"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Job Description *</label>
            <textarea className="input min-h-32 resize-none" placeholder="Describe the role, responsibilities, and requirements..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">CTC / Salary (₹)</label>
              <input className="input" type="number" placeholder="e.g. 600000"
                value={form.ctc} onChange={e => setForm({ ...form, ctc: e.target.value })} />
              <p className="text-xs text-slate-400 mt-1">Enter full amount (600000 = ₹6L)</p>
            </div>
            <div>
              <label className="label">Application Deadline</label>
              <input className="input" type="date"
                value={form.applicationDeadline}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm({ ...form, applicationDeadline: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Eligibility criteria */}
        <div className="card p-6 space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">Eligibility Criteria</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Leave blank to allow all students. These are enforced server-side — students who don't qualify cannot apply.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Minimum CGPA</label>
              <input className="input" type="number" step="0.1" min="0" max="10"
                placeholder="e.g. 7.0"
                value={form.minCgpa} onChange={e => setForm({ ...form, minCgpa: e.target.value })} />
            </div>
            <div>
              <label className="label">Maximum Backlogs Allowed</label>
              <input className="input" type="number" min="0"
                placeholder="e.g. 0"
                value={form.maxBacklogs} onChange={e => setForm({ ...form, maxBacklogs: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="label">Eligible Branches</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {BRANCHES.map(branch => (
                <button
                  key={branch} type="button"
                  onClick={() => toggleBranch(branch)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    form.eligibleBranches.includes(branch)
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                  }`}
                >
                  {form.eligibleBranches.includes(branch) ? '✓ ' : ''}{branch}
                </button>
              ))}
            </div>
            {form.eligibleBranches.length === 0 && (
              <p className="text-xs text-slate-400 mt-1">No selection = open to all branches</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Eligible Batch Year</label>
              <select className="input" value={form.eligibleBatchYear}
                onChange={e => setForm({ ...form, eligibleBatchYear: e.target.value })}>
                <option value="">All Batches</option>
                {[2024, 2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Required Skills</label>
              <input className="input" placeholder="e.g. Java, Spring Boot, SQL"
                value={form.requiredSkills}
                onChange={e => setForm({ ...form, requiredSkills: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Eligibility preview */}
        {(form.minCgpa || form.maxBacklogs !== '' || form.eligibleBranches.length > 0 || form.eligibleBatchYear) && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-2">Eligibility Summary</p>
            <div className="flex flex-wrap gap-2">
              {form.minCgpa && <span className="badge-blue">Min CGPA: {form.minCgpa}</span>}
              {form.maxBacklogs !== '' && <span className="badge-blue">Max Backlogs: {form.maxBacklogs}</span>}
              {form.eligibleBranches.length > 0 && <span className="badge-blue">Branches: {form.eligibleBranches.join(', ')}</span>}
              {form.eligibleBatchYear && <span className="badge-blue">Batch: {form.eligibleBatchYear}</span>}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 justify-center">
            {mutation.isPending
              ? <><Loader2 size={16} className="animate-spin" /> Posting Job...</>
              : 'Post Job'
            }
          </button>
        </div>
      </form>
    </div>
  );
}

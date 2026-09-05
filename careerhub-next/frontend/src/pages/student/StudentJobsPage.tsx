import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi, studentApi } from '../../api';
import { StatusBadge, PageLoader, EmptyState, StatCard } from '../../components/ui';
import {
  Briefcase, Search, MapPin, DollarSign,
  Clock, CheckCircle, XCircle, Filter, Loader2
} from 'lucide-react';

export default function StudentJobsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [applying, setApplying] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: jobsRes, isLoading } = useQuery({
    queryKey: ['open-jobs'],
    queryFn: () => jobsApi.search(),
  });

  const { data: profileRes } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => studentApi.getProfile(),
  });

  const { data: appsRes } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => studentApi.getApplications(),
  });

  const applyMutation = useMutation({
    mutationFn: (jobId: number) => studentApi.applyToJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      setMessage({ type: 'success', text: 'Application submitted successfully!' });
      setApplying(null);
      setTimeout(() => setMessage(null), 4000);
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to apply' });
      setApplying(null);
      setTimeout(() => setMessage(null), 4000);
    },
  });

  if (isLoading) return <PageLoader />;

  const jobs = jobsRes?.data?.data || [];
  const profile = profileRes?.data?.data;
  const appliedJobIds = new Set(
    (appsRes?.data?.data || []).map((a: any) => a.job?.id)
  );

  const filtered = jobs.filter((j: any) =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const checkEligibility = (job: any) => {
    if (!profile) return { eligible: false, reason: 'Complete your profile first' };
    const e = job.jobEligibility || {};
    if (e.minCgpa && profile.cgpa < e.minCgpa)
      return { eligible: false, reason: `Min CGPA required: ${e.minCgpa} (yours: ${profile.cgpa})` };
    if (e.maxBacklogs !== null && profile.backlogCount > e.maxBacklogs)
      return { eligible: false, reason: `Max backlogs allowed: ${e.maxBacklogs}` };
    if (e.eligibleBranches && !e.eligibleBranches.toLowerCase().includes(profile.branch?.toLowerCase()))
      return { eligible: false, reason: `Branch not eligible (allowed: ${e.eligibleBranches})` };
    if (e.eligibleBatchYear && profile.batchYear !== e.eligibleBatchYear)
      return { eligible: false, reason: `Batch year required: ${e.eligibleBatchYear}` };
    return { eligible: true, reason: '' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Browse Jobs</h1>
        <p className="text-slate-500 text-sm mt-1">
          {filtered.length} open positions available
        </p>
      </div>

      {/* Toast message */}
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success'
            ? <CheckCircle size={18} />
            : <XCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by job title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-secondary">
          <Filter size={16} /> Filter
        </button>
      </div>

      {/* Jobs list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={28} />}
          title="No jobs found"
          description="Try changing your search or check back later for new openings."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((job: any) => {
            const { eligible, reason } = checkEligibility(job);
            const alreadyApplied = appliedJobIds.has(job.id);

            return (
              <div key={job.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  {/* Left */}
                  <div className="flex gap-4 flex-1">
                    {/* Company logo placeholder */}
                    <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-lg flex-shrink-0">
                      {job.company?.name?.[0] || 'C'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-slate-900">{job.title}</h3>
                        <StatusBadge status={job.status} />
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{job.company?.name}</p>

                      {/* Job details */}
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                        {job.ctc && (
                          <span className="flex items-center gap-1">
                            <DollarSign size={13} />
                            ₹{(job.ctc / 100000).toFixed(1)}L CTC
                          </span>
                        )}
                        {job.applicationDeadline && (
                          <span className="flex items-center gap-1">
                            <Clock size={13} />
                            Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Eligibility criteria */}
                      {job.jobEligibility && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {job.jobEligibility.minCgpa && (
                            <span className="badge-slate">Min CGPA: {job.jobEligibility.minCgpa}</span>
                          )}
                          {job.jobEligibility.eligibleBranches && (
                            <span className="badge-slate">{job.jobEligibility.eligibleBranches}</span>
                          )}
                          {job.jobEligibility.maxBacklogs !== null && (
                            <span className="badge-slate">Max Backlogs: {job.jobEligibility.maxBacklogs}</span>
                          )}
                          {job.jobEligibility.eligibleBatchYear && (
                            <span className="badge-slate">Batch: {job.jobEligibility.eligibleBatchYear}</span>
                          )}
                        </div>
                      )}

                      {/* Eligibility status */}
                      {!eligible && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                          <XCircle size={13} />
                          {reason}
                        </div>
                      )}
                      {eligible && !alreadyApplied && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                          <CheckCircle size={13} />
                          You are eligible for this job
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Apply button */}
                  <div className="flex-shrink-0">
                    {alreadyApplied ? (
                      <span className="badge-green px-3 py-2">Applied</span>
                    ) : (
                      <button
                        disabled={!eligible || applying === job.id}
                        onClick={() => {
                          setApplying(job.id);
                          applyMutation.mutate(job.id);
                        }}
                        className={`btn-primary text-sm px-4 py-2 ${
                          !eligible ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {applying === job.id
                          ? <><Loader2 size={14} className="animate-spin" /> Applying...</>
                          : 'Apply Now'
                        }
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                {job.description && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-600 line-clamp-2">{job.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

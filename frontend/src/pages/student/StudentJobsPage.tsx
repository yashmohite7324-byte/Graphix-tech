import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi, studentApi } from '../../api';
import { StatusBadge, PageLoader, EmptyState } from '../../components/ui';
import {
  Briefcase, Search, IndianRupee,
  Clock, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentJobsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [applying, setApplying] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSubscription, setShowSubscription] = useState(false);

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
    const el = job.jobEligibility;
    if (!el) return { eligible: true };

    if (el.minCgpa && (profile.cgpa || 0) < el.minCgpa)
      return { eligible: false, reason: `CGPA must be >= ${el.minCgpa}` };

    if (el.maxBacklogs !== null && (profile.backlogCount || 0) > el.maxBacklogs)
      return { eligible: false, reason: `Max ${el.maxBacklogs} backlogs allowed` };

    if (el.eligibleBatchYear && profile.batchYear !== el.eligibleBatchYear)
      return { eligible: false, reason: `Only for ${el.eligibleBatchYear} batch` };

    if (el.eligibleBranches) {
      const allowed = el.eligibleBranches.split(',').map((b: string) => b.trim());
      if (profile.branch && !allowed.includes(profile.branch)) {
        return { eligible: false, reason: `Branch must be one of: ${el.eligibleBranches}` };
      }
    }

    return { eligible: true };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Job Board</h1>
        <p className="text-slate-500 mt-1">Discover and apply to top opportunities matching your profile.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by role or company..."
          className="flex-1 bg-transparent border-none outline-none text-slate-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Jobs list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={28} />}
          title="No jobs found"
          description="Try changing your search or check back later for new openings."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((job: any) => {
            const { eligible, reason } = checkEligibility(job);
            const alreadyApplied = appliedJobIds.has(job.id);

            return (
              <div key={job.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between h-full group">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50 border border-brand-100 flex items-center justify-center text-brand-600 font-bold text-xl flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                      {job.company?.name?.[0] || 'C'}
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-brand-600 transition-colors">{job.title}</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">{job.company?.name}</p>
                  </div>

                  <div className="flex flex-col gap-3 mt-5 text-sm text-slate-500 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <div className="flex items-center gap-2">
                      <IndianRupee size={16} className="text-slate-400" />
                      {job.ctc ? `${job.ctc} LPA` : 'Not disclosed'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-slate-400" />
                      {job.applicationDeadline
                        ? `Apply by ${new Date(job.applicationDeadline).toLocaleDateString()}`
                        : 'No deadline specified'}
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-slate-500 line-clamp-3">
                    {job.description}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  {alreadyApplied ? (
                    <div className="flex items-center justify-center gap-2 text-green-600 font-medium bg-green-50 py-2.5 rounded-lg w-full">
                      <CheckCircle size={18} />
                      Applied
                    </div>
                  ) : !eligible ? (
                    <div className="flex items-center justify-center gap-2 text-amber-600 font-medium bg-amber-50 py-2.5 rounded-lg w-full" title={reason}>
                      <XCircle size={18} />
                      Not Eligible
                    </div>
                  ) : (
                    <button
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-brand-500/20"
                      disabled={applying === job.id}
                      onClick={() => {
                          const isAcademyStudent = user?.email?.endsWith('@graphix.edu') || user?.email?.endsWith('@graphix.edu.in');
                          if (!isAcademyStudent) {
                              setShowSubscription(true);
                              return;
                          }
                          setApplying(job.id);
                          applyMutation.mutate(job.id);
                      }}
                    >
                      {applying === job.id ? (
                        <><Loader2 className="animate-spin w-5 h-5" /> Applying...</>
                      ) : (
                        'Apply Now'
                      )}
                    </button>
                  )}
                  
                  {!eligible && !alreadyApplied && (
                      <div className="text-[10px] text-center text-slate-400 mt-2 uppercase tracking-wide">
                          {reason}
                      </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowSubscription(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <XCircle size={24} />
            </button>
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mx-auto mb-4 relative group">
                <div className="absolute inset-0 bg-brand-500 rounded-full animate-ping opacity-20"></div>
                <img src="/careerhub-pro-sketch.jpg" alt="CareerHub Pro" className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-brand-100 relative z-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">CareerHub Pro Access Required</h2>
              <p className="text-slate-500 mt-2">
                As a non-academy student, applying to premium opportunities requires an active subscription. Academy students (Graphix Edu) receive this for free.
              </p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-6 border border-brand-100 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                Recommended
              </div>
              <div className="flex items-center justify-center gap-1 text-3xl font-bold text-slate-800 mb-2">
                <IndianRupee size={28} />1,099 <span className="text-base text-slate-500 font-normal">/ year</span>
              </div>
              <ul className="space-y-3 mt-4 text-sm text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Unlimited Job Applications</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> AI Resume Scoring & Matching</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Priority Recruiter Visibility</li>
              </ul>
            </div>
            
            <button 
              onClick={() => setShowSubscription(false)}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-brand-500/30"
            >
              Subscribe Now
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">Secure payment powered by Razorpay</p>
          </div>
        </div>
      )}
    </div>
  );
}

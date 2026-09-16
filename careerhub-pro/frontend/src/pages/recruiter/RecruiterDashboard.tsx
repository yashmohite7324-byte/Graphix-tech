import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Briefcase, Users, Calendar, TrendingUp, ChevronRight, Plus,
  Clock, CheckCircle, Star, Building2, ArrowRight, Eye, Target
} from 'lucide-react';

function StatCard({ label, value, icon, gradient, sub }: any) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br ${gradient}`}>
      <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />
      <div className="relative">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">{icon}</div>
        <p className="text-3xl font-black">{value ?? '—'}</p>
        <p className="text-white/75 text-sm font-medium mt-0.5">{label}</p>
        {sub && <p className="text-white/50 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const PIPELINE_STAGES = [
  { key: 'APPLIED',             label: 'Applied',     color: '#94a3b8' },
  { key: 'UNDER_REVIEW',        label: 'In Review',   color: '#3b82f6' },
  { key: 'SHORTLISTED',         label: 'Shortlisted', color: '#6366f1' },
  { key: 'INTERVIEW_SCHEDULED', label: 'Interview',   color: '#8b5cf6' },
  { key: 'SELECTED',            label: 'Selected',    color: '#10b981' },
];

export default function RecruiterDashboard() {
  const { user } = useAuth();

  const { data: profileRes } = useQuery({
    queryKey: ['recruiter-profile'],
    queryFn: () => api.get('/recruiters/me'),
  });
  const { data: jobsRes } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: () => api.get('/jobs/my'),
  });
  const { data: appsRes } = useQuery({
    queryKey: ['recruiter-applications'],
    queryFn: () => api.get('/applications/recruiter'),
  });
  const { data: interviewsRes } = useQuery({
    queryKey: ['recruiter-interviews'],
    queryFn: () => api.get('/interviews/recruiter'),
  });

  const profile = profileRes?.data?.data;
  const jobs = jobsRes?.data?.data || [];
  const applications = appsRes?.data?.data || [];
  const interviews = interviewsRes?.data?.data || [];

  const openJobs = jobs.filter((j: any) => j.status === 'OPEN').length;
  const totalApps = applications.length;
  const shortlisted = applications.filter((a: any) =>
    ['SHORTLISTED','INTERVIEW_SCHEDULED','SELECTED','OFFERED'].includes(a.status)).length;
  const upcomingInterviews = interviews.filter((i: any) =>
    i.result === 'PENDING' && new Date(i.scheduledAt) > new Date()).length;

  // Pipeline counts
  const pipelineData = PIPELINE_STAGES.map(stage => ({
    name: stage.label,
    count: applications.filter((a: any) => a.status === stage.key).length,
    color: stage.color,
  }));

  // Job performance — applications per job
  const jobPerformance = jobs.slice(0, 5).map((job: any) => ({
    title: job.title?.slice(0, 18) + (job.title?.length > 18 ? '…' : ''),
    applications: applications.filter((a: any) => a.job?.id === job.id).length,
  }));

  const companyName = profile?.company?.name || 'Your Company';
  const designation = profile?.designation || 'Recruiter';

  return (
    <div className="space-y-6 animate-fade-up max-w-7xl mx-auto">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 p-7 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-24 translate-x-24" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 translate-y-16 -translate-x-10" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
              {companyName[0]}
            </div>
            <div>
              <p className="text-cyan-200 text-sm font-medium mb-0.5">{designation}</p>
              <h1 className="text-2xl font-black text-white leading-tight">{companyName}</h1>
              <p className="text-cyan-100 text-sm mt-1.5">
                {openJobs > 0
                  ? `${openJobs} open position${openJobs !== 1 ? 's' : ''} • ${totalApps} candidate${totalApps !== 1 ? 's' : ''} in pipeline`
                  : 'Post your first job to start receiving applications'}
              </p>
            </div>
          </div>
          <Link to="/recruiter/post-job"
            className="flex-shrink-0 flex items-center gap-2 bg-white text-blue-700 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
            <Plus size={15} /> Post a Job
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Jobs" value={openJobs}
          icon={<Briefcase size={20} />} gradient="from-blue-500 to-cyan-600"
          sub={`${jobs.length} total posted`} />
        <StatCard label="Total Applicants" value={totalApps}
          icon={<Users size={20} />} gradient="from-indigo-500 to-violet-600"
          sub="across all jobs" />
        <StatCard label="Shortlisted" value={shortlisted}
          icon={<Star size={20} />} gradient="from-amber-500 to-orange-500"
          sub="moved past screening" />
        <StatCard label="Interviews" value={upcomingInterviews}
          icon={<Calendar size={20} />} gradient="from-violet-500 to-purple-600"
          sub="scheduled ahead" />
      </div>

      {/* Pipeline visual */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Target size={15} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Hiring Pipeline</h3>
              <p className="text-xs text-slate-400">Candidates at each stage</p>
            </div>
          </div>
          <Link to="/recruiter/candidates"
            className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
            Manage pipeline <ChevronRight size={12} />
          </Link>
        </div>

        {/* Horizontal funnel bars */}
        <div className="space-y-2.5">
          {pipelineData.map((stage, i) => {
            const max = Math.max(...pipelineData.map(s => s.count), 1);
            const pct = (stage.count / max) * 100;
            return (
              <div key={stage.name} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-24 flex-shrink-0 font-medium">{stage.name}</span>
                <div className="flex-1 h-7 bg-slate-50 rounded-lg overflow-hidden relative">
                  <div className="h-full rounded-lg transition-all duration-700 flex items-center px-3"
                    style={{ width: `${Math.max(pct, 6)}%`, backgroundColor: stage.color }}>
                    <span className="text-xs font-bold text-white">{stage.count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Job performance chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Applications per Job</h3>
            <Link to="/recruiter/post-job" className="text-xs text-indigo-600 font-semibold hover:underline">
              Post new →
            </Link>
          </div>
          {jobPerformance.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase size={28} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No jobs posted yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={jobPerformance} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="title" width={110}
                  tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Bar dataKey="applications" radius={[0, 6, 6, 0]} fill="#6366f1" barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Upcoming interviews */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-50">
            <span className="text-sm font-bold text-slate-900">Upcoming Interviews</span>
            <Link to="/recruiter/interviews" className="text-xs text-indigo-600 hover:underline font-medium">
              All →
            </Link>
          </div>
          <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
            {interviews.filter((i: any) => i.result === 'PENDING').length === 0 ? (
              <div className="py-10 text-center">
                <Calendar size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No interviews scheduled</p>
              </div>
            ) : interviews.filter((i: any) => i.result === 'PENDING').slice(0, 5).map((iv: any) => (
              <div key={iv.id} className="px-4 py-3 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 text-xs font-black flex-shrink-0">
                    R{iv.round}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {iv.application?.student?.fullName || 'Candidate'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{iv.application?.job?.title}</p>
                    {iv.scheduledAt && (
                      <p className="text-[10px] text-violet-600 font-semibold mt-0.5 flex items-center gap-1">
                        <Clock size={9} />
                        {new Date(iv.scheduledAt).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active jobs list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Briefcase size={15} className="text-blue-600" />
            </div>
            <span className="font-bold text-slate-900 text-sm">My Job Postings</span>
          </div>
          <Link to="/recruiter/post-job"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
            <Plus size={12} /> New Job
          </Link>
        </div>
        {jobs.length === 0 ? (
          <div className="py-14 flex flex-col items-center text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
              <Briefcase size={24} className="text-blue-400" />
            </div>
            <p className="text-sm font-bold text-slate-700">No jobs posted yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Post your first job and students will be able to apply immediately
            </p>
            <Link to="/recruiter/post-job"
              className="mt-4 flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors">
              <Plus size={13} /> Post a Job
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {jobs.map((job: any) => {
              const appCount = applications.filter((a: any) => a.job?.id === job.id).length;
              return (
                <Link key={job.id} to="/recruiter/candidates"
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white flex-shrink-0">
                    <Briefcase size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{job.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {job.ctc && (
                        <span className="text-xs text-emerald-600 font-semibold">
                          ₹{(job.ctc / 100000).toFixed(1)}L
                        </span>
                      )}
                      {job.location && (
                        <span className="text-xs text-slate-400">{job.location}</span>
                      )}
                      {job.applicationDeadline && (
                        <span className="text-xs text-amber-500">
                          Closes {new Date(job.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-black text-slate-900">{appCount}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">applicants</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase flex-shrink-0 ${
                    job.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>{job.status}</span>
                  <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

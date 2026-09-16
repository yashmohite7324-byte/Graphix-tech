import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import {
  Briefcase, ClipboardList, Award, TrendingUp, ChevronRight,
  MapPin, Clock, Star, ArrowRight, Brain, Bell, BookOpen,
  CheckCircle, AlertCircle, Calendar, Zap
} from 'lucide-react';

function StatCard({ label, value, icon, gradient, sub }: any) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br ${gradient}`}>
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
      <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full bg-white/10" />
      <div className="relative">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
          {icon}
        </div>
        <p className="text-3xl font-black">{value ?? '—'}</p>
        <p className="text-white/75 text-sm font-medium mt-0.5">{label}</p>
        {sub && <p className="text-white/50 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ApplicationTimeline({ applications }: { applications: any[] }) {
  const STATUS_CONFIG: Record<string, { color: string; dot: string }> = {
    APPLIED:              { color: 'text-slate-500', dot: 'bg-slate-300' },
    UNDER_REVIEW:         { color: 'text-blue-600',  dot: 'bg-blue-400' },
    SHORTLISTED:          { color: 'text-indigo-600',dot: 'bg-indigo-500' },
    INTERVIEW_SCHEDULED:  { color: 'text-violet-600',dot: 'bg-violet-500' },
    SELECTED:             { color: 'text-emerald-600',dot: 'bg-emerald-500' },
    OFFERED:              { color: 'text-emerald-700',dot: 'bg-emerald-600' },
    REJECTED:             { color: 'text-red-500',   dot: 'bg-red-400' },
  };
  return (
    <div className="divide-y divide-slate-50">
      {applications.slice(0, 5).map((app: any) => {
        const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.APPLIED;
        return (
          <div key={app.id} className="flex items-center gap-3 py-3 px-4 hover:bg-slate-50/50 transition-colors">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {app.job?.title}
              </p>
              <p className="text-xs text-slate-400 truncate">{app.job?.company?.name}</p>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>
              {app.status?.replace(/_/g, ' ')}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Student';

  const { data: profileRes } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/students/me'),
  });
  const { data: appsRes } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get('/applications/my'),
  });
  const { data: jobsRes } = useQuery({
    queryKey: ['open-jobs'],
    queryFn: () => api.get('/jobs/public/search?size=4'),
  });
  const { data: notifRes } = useQuery({
    queryKey: ['notifications-recent'],
    queryFn: () => api.get('/notifications?size=4'),
  });
  const { data: interviewRes } = useQuery({
    queryKey: ['my-interviews'],
    queryFn: () => api.get('/interviews/my'),
  });

  const profile = profileRes?.data?.data;
  const applications = appsRes?.data?.data || [];
  const jobs = jobsRes?.data?.data?.content || jobsRes?.data?.data || [];
  const notifications = notifRes?.data?.data?.content || [];
  const interviews = interviewRes?.data?.data || [];

  const appliedCount = applications.length;
  const shortlisted = applications.filter((a: any) => ['SHORTLISTED','INTERVIEW_SCHEDULED','SELECTED','OFFERED'].includes(a.status)).length;
  const upcoming = interviews.filter((i: any) => i.result === 'PENDING' && new Date(i.scheduledAt) > new Date()).length;
  const isPlaced = profile?.isPlaced;

  // Profile completeness
  const fields = ['fullName','rollNumber','branch','cgpa','resumeUrl','photoUrl','linkedinUrl'];
  const filled = fields.filter(f => profile?.[f]).length;
  const completeness = Math.round((filled / fields.length) * 100);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 animate-fade-up max-w-6xl mx-auto">

      {/* Hero welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-7 text-white">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px), radial-gradient(circle at 20% 80%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-24 translate-x-24" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">{greeting} 👋</p>
            <h1 className="text-3xl font-black text-white">{firstName}</h1>
            <p className="text-indigo-200 text-sm mt-1 max-w-sm">
              {isPlaced
                ? '🎉 Congratulations! You are placed. Check your offer details.'
                : appliedCount === 0
                ? 'Start your placement journey — browse open positions below.'
                : `You have ${appliedCount} active application${appliedCount !== 1 ? 's' : ''}. Keep going!`
              }
            </p>
            {upcoming > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold">
                <Calendar size={13} /> {upcoming} interview{upcoming !== 1 ? 's' : ''} coming up
              </div>
            )}
          </div>
          <Link to="/student/jobs"
            className="flex-shrink-0 flex items-center gap-2 bg-white text-indigo-700 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
            Browse Jobs <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Applications" value={appliedCount}
          icon={<ClipboardList size={20} />}
          gradient="from-indigo-500 to-violet-600"
          sub="total submitted" />
        <StatCard label="Shortlisted" value={shortlisted}
          icon={<Star size={20} />}
          gradient="from-amber-500 to-orange-500"
          sub="past applied stage" />
        <StatCard label="Upcoming Interviews" value={upcoming}
          icon={<Calendar size={20} />}
          gradient="from-blue-500 to-cyan-500"
          sub="scheduled soon" />
        <StatCard label="Placement Status"
          value={isPlaced ? '✓ Placed' : 'Active'}
          icon={<Award size={20} />}
          gradient={isPlaced ? 'from-emerald-500 to-teal-500' : 'from-slate-500 to-slate-600'}
          sub={isPlaced ? 'Offer received' : 'Searching'} />
      </div>

      {/* Profile completeness alert */}
      {completeness < 80 && (
        <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">Complete your profile — {completeness}% done</p>
            <p className="text-xs text-amber-600 mt-0.5">
              A complete profile increases your chances of being shortlisted by recruiters.
            </p>
            <div className="mt-2 bg-amber-100 rounded-full h-1.5 w-48">
              <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${completeness}%` }} />
            </div>
          </div>
          <Link to="/student/profile"
            className="flex-shrink-0 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-2 rounded-xl transition-colors">
            Complete →
          </Link>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Applications */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                <ClipboardList size={15} className="text-indigo-600" />
              </div>
              <span className="font-bold text-slate-900 text-sm">My Applications</span>
            </div>
            <Link to="/student/applications"
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {applications.length === 0 ? (
            <div className="py-14 flex flex-col items-center text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
                <Briefcase size={24} className="text-indigo-400" />
              </div>
              <p className="text-sm font-bold text-slate-700">No applications yet</p>
              <p className="text-xs text-slate-400 mt-1">Start applying to jobs to see them here</p>
              <Link to="/student/jobs"
                className="mt-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors">
                Browse Jobs
              </Link>
            </div>
          ) : (
            <ApplicationTimeline applications={applications} />
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Recent notifications */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-900">Notifications</span>
              </div>
              <Link to="/student/notifications"
                className="text-xs text-indigo-600 hover:underline font-medium">All →</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">No new notifications</p>
              ) : notifications.slice(0, 3).map((n: any) => (
                <div key={n.id} className="px-4 py-3">
                  <div className="flex gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.isRead ? 'bg-slate-200' : 'bg-indigo-500'}`} />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 leading-tight">{n.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{n.message?.slice(0, 60)}...</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Score prompt */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-4 text-white">
            <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={18} />
                <span className="text-sm font-bold">AI Resume Score</span>
              </div>
              <p className="text-xs text-purple-200 leading-relaxed mb-3">
                Know your ATS score before recruiters see your resume.
              </p>
              <Link to="/student/ai-score"
                className="inline-flex items-center gap-1.5 bg-white text-violet-700 text-xs font-bold px-3 py-2 rounded-xl hover:bg-violet-50 transition-colors">
                <Zap size={12} /> Score Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Briefcase size={15} className="text-blue-600" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Open Opportunities</span>
          </div>
          <Link to="/student/jobs" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
            See all <ChevronRight size={12} />
          </Link>
        </div>
        {jobs.length === 0 ? (
          <p className="text-center py-10 text-sm text-slate-400">No open jobs at the moment</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-50">
            {jobs.slice(0, 4).map((job: any) => (
              <Link key={job.id} to={`/student/jobs`}
                className="flex items-start gap-3 p-4 hover:bg-slate-50/60 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {job.company?.name?.[0] || 'C'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{job.title}</p>
                  <p className="text-xs text-slate-400 truncate">{job.company?.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {job.ctc && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        ₹{(job.ctc / 100000).toFixed(1)}L
                      </span>
                    )}
                    {job.location && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <MapPin size={9} /> {job.location}
                      </span>
                    )}
                    {job.applicationDeadline && (
                      <span className="text-[10px] text-amber-500 flex items-center gap-0.5">
                        <Clock size={9} />
                        {new Date(job.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

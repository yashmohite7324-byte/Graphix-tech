import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { studentApi, jobsApi, notificationApi } from '../../api';
import { StatCard, StatusBadge, PageLoader, EmptyState } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase, ClipboardList,
  ArrowRight, CheckCircle, Clock, TrendingUp
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: profileRes, isLoading: profileLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => studentApi.getProfile(),
  });

  const { data: appsRes, isLoading: appsLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => studentApi.getApplications(),
  });

  const { data: jobsRes } = useQuery({
    queryKey: ['open-jobs'],
    queryFn: () => jobsApi.search(),
  });

  useQuery({
    queryKey: ['unread-count'],
    queryFn: () => notificationApi.getUnreadCount(),
  });

  if (profileLoading || appsLoading) return <PageLoader />;

  const profile = profileRes?.data?.data;
  const apps = appsRes?.data?.data || [];
  const jobs = jobsRes?.data?.data || [];
  

  const completionFields = ['fullName', 'branch', 'cgpa', 'resumeUrl', 'batchYear'];
  const filled = completionFields.filter((f) => profile?.[f]).length;
  const completion = Math.round((filled / completionFields.length) * 100);

  const activeApps = apps.filter((a: any) =>
    ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED'].includes(a.status));
  const selectedApps = apps.filter((a: any) =>
    ['SELECTED', 'OFFERED', 'PLACED'].includes(a.status));

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <h1>Good morning, {profile?.fullName || user?.email?.split('@')[0]} 👋</h1>
          <p className="text-slate-500 text-sm mt-1">
            Here's what's happening with your placement journey.
          </p>
        </div>
        <Link to="/student/profile" className="btn-secondary text-xs">
          Edit Profile <ArrowRight size={14} />
        </Link>
      </div>

      {/* Profile completion alert */}
      {completion < 100 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Clock size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">Complete your profile</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Your profile is {completion}% complete. A complete profile increases your chances of being shortlisted.
            </p>
            <div className="mt-2 bg-amber-200 rounded-full h-1.5 w-48">
              <div
                className="bg-amber-500 h-1.5 rounded-full"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
          <Link to="/student/profile" className="text-xs font-medium text-amber-700 hover:underline whitespace-nowrap">
            Complete now
          </Link>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Jobs" value={jobs.length} icon={<Briefcase size={22} />} color="blue" />
        <StatCard label="Applications" value={apps.length} icon={<ClipboardList size={22} />} color="purple" />
        <StatCard label="Active" value={activeApps.length} icon={<TrendingUp size={22} />} color="orange" />
        <StatCard label="Selected" value={selectedApps.length} icon={<CheckCircle size={22} />} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 card">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3>Recent Applications</h3>
            <Link to="/student/applications" className="text-xs text-brand-600 hover:underline font-medium">
              View all
            </Link>
          </div>
          {apps.length === 0 ? (
            <EmptyState
              icon={<ClipboardList size={28} />}
              title="No applications yet"
              description="Browse open jobs and apply to get started."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {apps.slice(0, 5).map((app: any) => (
                <div key={app.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {app.job?.title || `Job #${app.job?.id}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {app.job?.company?.name || 'Company'}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Profile card */}
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-lg">
                {profile?.fullName?.[0] || user?.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{profile?.fullName || 'Set your name'}</p>
                <p className="text-xs text-slate-500">{profile?.branch || 'Branch not set'} • {profile?.batchYear || '—'}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>CGPA</span>
                <span className="font-medium">{profile?.cgpa || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Backlogs</span>
                <span className="font-medium">{profile?.backlogCount ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Profile Completion</span>
                <span className="font-medium text-amber-600">{completion}%</span>
              </div>
            </div>
          </div>

          {/* Recommended jobs */}
          <div className="card">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3>Recommended Jobs</h3>
              <Link to="/student/jobs" className="text-xs text-brand-600 hover:underline">See all</Link>
            </div>
            {jobs.slice(0, 3).map((job: any) => (
              <div key={job.id} className="px-4 py-3 border-b border-slate-100 last:border-0">
                <p className="text-sm font-medium text-slate-900">{job.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{job.company?.name}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {job.ctc && (
                    <span className="text-xs font-medium text-green-600">
                      ₹{(job.ctc / 100000).toFixed(1)}L CTC
                    </span>
                  )}
                  <StatusBadge status={job.status} />
                </div>
              </div>
            ))}
            {jobs.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-slate-500">No open jobs right now</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

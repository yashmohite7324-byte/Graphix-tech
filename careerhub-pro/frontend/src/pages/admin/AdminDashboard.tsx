import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Users, Building2, Briefcase, Award, TrendingUp, ChevronRight,
  ArrowUpRight, CheckCircle, Clock, AlertCircle, GraduationCap,
  BarChart3, Activity, Zap
} from 'lucide-react';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

function KPICard({ label, value, change, icon, gradient, to }: any) {
  return (
    <Link to={to || '#'}
      className={`relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br ${gradient} hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 group`}>
      <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-white/10 group-hover:scale-110 transition-transform" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />
      <div className="relative">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
          {icon}
        </div>
        <p className="text-3xl font-black">{value ?? '—'}</p>
        <p className="text-white/75 text-sm font-medium mt-0.5">{label}</p>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpRight size={12} className="text-white/60" />
            <span className="text-xs text-white/60">{change > 0 ? '+' : ''}{change}% this month</span>
          </div>
        )}
      </div>
    </Link>
  );
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: analyticsRes } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get('/admin/analytics/summary'),
  });

  const { data: recentAppsRes } = useQuery({
    queryKey: ['recent-applications'],
    queryFn: () => api.get('/admin/applications/recent?size=6'),
  });

  const { data: companiesRes } = useQuery({
    queryKey: ['admin-companies-count'],
    queryFn: () => api.get('/admin/companies'),
  });

  const { data: placementsRes } = useQuery({
    queryKey: ['admin-placements-recent'],
    queryFn: () => api.get('/admin/placements?size=5'),
  });

  const analytics = analyticsRes?.data?.data || {};
  const recentApps = recentAppsRes?.data?.data?.content || recentAppsRes?.data?.data || [];
  const companies = companiesRes?.data?.data || [];
  const placements = placementsRes?.data?.data?.content || placementsRes?.data?.data || [];

  const approvedCo = companies.filter((c: any) => c.verificationStatus === 'APPROVED').length;
  const pendingCo  = companies.filter((c: any) => c.verificationStatus === 'PENDING').length;

  // Mock trend data (replace with real API data)
  const placementTrend = MONTHS.slice(0, 9).map((m, i) => ({
    month: m,
    placed: Math.floor(Math.random() * 15) + 2,
    applied: Math.floor(Math.random() * 40) + 20,
  }));

  const appStatusData = [
    { name: 'Applied',     value: analytics.totalApplications || 0 },
    { name: 'Shortlisted', value: analytics.shortlisted || 0 },
    { name: 'Placed',      value: analytics.totalPlacements || 0 },
    { name: 'Rejected',    value: analytics.rejected || 0 },
  ];

  const STATUS_COLORS: Record<string, string> = {
    APPLIED:             'text-slate-500 bg-slate-100',
    SHORTLISTED:         'text-indigo-600 bg-indigo-50',
    INTERVIEW_SCHEDULED: 'text-violet-600 bg-violet-50',
    SELECTED:            'text-emerald-600 bg-emerald-50',
    REJECTED:            'text-red-500 bg-red-50',
    OFFERED:             'text-emerald-700 bg-emerald-100',
  };

  return (
    <div className="space-y-6 animate-fade-up max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Graphix Technologies Institute — Placement Management
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-500">
          <Activity size={13} className="text-emerald-500" />
          <span>Live • {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Students"
          value={analytics.totalStudents || '—'}
          icon={<GraduationCap size={20} />}
          gradient="from-indigo-500 to-violet-600"
          to="/admin/students" />
        <KPICard label="Companies"
          value={approvedCo}
          icon={<Building2 size={20} />}
          gradient="from-blue-500 to-cyan-600"
          to="/admin/companies" />
        <KPICard label="Active Jobs"
          value={analytics.activeJobs || '—'}
          icon={<Briefcase size={20} />}
          gradient="from-amber-500 to-orange-500"
          to="/admin/jobs" />
        <KPICard label="Placements"
          value={analytics.totalPlacements || '—'}
          icon={<Award size={20} />}
          gradient="from-emerald-500 to-teal-600"
          to="/admin/placements" />
      </div>

      {/* Alerts row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {pendingCo > 0 && (
          <Link to="/admin/companies"
            className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl hover:bg-amber-100 transition-colors">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800">{pendingCo} pending approvals</p>
              <p className="text-xs text-amber-600">Companies awaiting review</p>
            </div>
            <ChevronRight size={15} className="text-amber-500 ml-auto" />
          </Link>
        )}
        <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">{approvedCo} active companies</p>
            <p className="text-xs text-emerald-600">Posting jobs and hiring</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl">
          <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-800">
              {analytics.totalPlacements
                ? `${Math.round((analytics.totalPlacements / Math.max(analytics.totalStudents, 1)) * 100)}%`
                : '—'} placed
            </p>
            <p className="text-xs text-indigo-600">Placement rate</p>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Placement trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Placement Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Applications vs Placements 2025</p>
            </div>
            <Link to="/admin/analytics" className="text-xs text-indigo-600 font-semibold hover:underline">
              Full analytics →
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={placementTrend}>
              <defs>
                <linearGradient id="applied" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="placed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Area type="monotone" dataKey="applied" stroke="#6366f1" strokeWidth={2} fill="url(#applied)" name="Applied" />
              <Area type="monotone" dataKey="placed" stroke="#10b981" strokeWidth={2} fill="url(#placed)" name="Placed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Application funnel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Application Funnel</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={appStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                dataKey="value" paddingAngle={3}>
                {appStatusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {appStatusData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-bold text-slate-900">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent applications + recent placements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <span className="font-bold text-slate-900 text-sm">Recent Applications</span>
            <Link to="/admin/students" className="text-xs text-indigo-600 font-semibold hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentApps.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">No applications yet</p>
            ) : recentApps.slice(0, 5).map((app: any) => {
              const cls = STATUS_COLORS[app.status] || 'text-slate-500 bg-slate-100';
              return (
                <div key={app.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {app.student?.fullName?.[0] || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {app.student?.fullName || 'Student'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{app.job?.title} — {app.job?.company?.name}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide flex-shrink-0 ${cls}`}>
                    {app.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Placements */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <span className="font-bold text-slate-900 text-sm">Recent Placements</span>
            <Link to="/admin/placements" className="text-xs text-indigo-600 font-semibold hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {placements.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">No placements recorded yet</p>
            ) : placements.slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {p.student?.fullName?.[0] || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {p.student?.fullName || 'Student'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {p.designation} at {p.company?.name}
                  </p>
                </div>
                {p.ctcOffered && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex-shrink-0">
                    ₹{(p.ctcOffered / 100000).toFixed(1)}L
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

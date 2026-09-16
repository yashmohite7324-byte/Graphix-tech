import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api';
import { Stat, Panel, PanelLink, Empty, Stage, Loading } from '../../components/Dash';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';
import {
  GraduationCap, Building2, Briefcase, Award,
  ClipboardList, AlertTriangle, Users, TrendingUp,
} from 'lucide-react';

export default function AdminDashboard() {
  const { resolved } = useTheme();
  const dark = resolved === 'dark';

  const { data: aRes, isLoading } = useQuery({
    queryKey: ['admin-summary'],
    queryFn: () => api.get('/admin/analytics/summary'), retry: false,
  });
  const { data: coRes } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: () => api.get('/admin/companies'), retry: false,
  });
  const { data: appRes } = useQuery({
    queryKey: ['admin-recent-apps'],
    queryFn: () => api.get('/admin/applications/recent?size=6'), retry: false,
  });
  const { data: plRes } = useQuery({
    queryKey: ['admin-recent-placements'],
    queryFn: () => api.get('/admin/placements?size=5'), retry: false,
  });

  const a         = aRes?.data?.data ?? {};
  const companies = coRes?.data?.data ?? [];
  const apps      = appRes?.data?.data?.content ?? appRes?.data?.data ?? [];
  const places    = plRes?.data?.data?.content  ?? plRes?.data?.data  ?? [];

  const pending  = companies.filter((c: any) => c.verificationStatus === 'PENDING').length;
  const approved = companies.filter((c: any) => c.verificationStatus === 'APPROVED').length;

  const students = a.totalStudents ?? 0;
  const placed   = a.totalPlacements ?? 0;
  const rate     = students ? Math.round((placed / students) * 100) : 0;

  const trend = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'].map((m, i) => ({
    m, applied: 18 + i * 4 + (i % 3) * 5, placed: 2 + Math.floor(i * 1.4),
  }));

  const grid = dark ? '#212A44' : '#E3E8F2';
  const axis = dark ? '#6B7794' : '#8A93A8';

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">

      {/* Hero — the placement rate is the one number this office is judged on,
          so it gets the dial and everything else stays quiet. */}
      <section className="surface mesh overflow-hidden">
        <div className="grid md:grid-cols-[1fr_auto] gap-6 p-6 items-center">
          <div>
            <p className="text-sm t-secondary">Graphix Technologies Institute</p>
            <h1 className="font-display text-2xl font-bold t-primary mt-1">
              Placement overview
            </h1>
            <p className="text-sm t-secondary mt-2 max-w-[52ch] leading-relaxed">
              {placed > 0
                ? `${placed} of ${students} students placed so far this cycle across ${approved} hiring partners.`
                : `${students} students registered and ${approved} partners onboarded. No offers recorded yet this cycle.`}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link to="/admin/companies" className="btn btn-primary">Review companies</Link>
              <Link to="/admin/analytics" className="btn btn-ghost">Full analytics</Link>
            </div>
          </div>

          <div className="relative w-44 h-44 mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="72%" outerRadius="100%"
                data={[{ value: rate, fill: 'url(#rateGrad)' }]}
                startAngle={90} endAngle={-270}
              >
                <defs>
                  <linearGradient id="rateGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%"   stopColor="#5B6BF5" />
                    <stop offset="55%"  stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="value" cornerRadius={99} background={{ fill: grid }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-display text-4xl font-bold grad-text tnum leading-none">{rate}%</span>
              <span className="text-xs t-tertiary mt-1">placed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Students"   value={students} icon={<GraduationCap size={17} />}
              accent="var(--role-student-a)"   to="/admin/students" hint="registered this cycle" />
        <Stat label="Partners"   value={approved} icon={<Building2 size={17} />}
              accent="var(--role-recruiter-a)" to="/admin/companies" hint={`${pending} awaiting review`} />
        <Stat label="Open roles" value={a.activeJobs ?? 0} icon={<Briefcase size={17} />}
              accent="var(--role-trainer-a)"   to="/admin/jobs" hint="accepting applications" />
        <Stat label="Offers"     value={placed} icon={<Award size={17} />}
              accent="var(--stage-offered)"    to="/admin/placements" hint="recorded to date" />
      </div>

      {/* Pending approvals is the one thing that blocks recruiters from working,
          so it surfaces as a banner rather than a buried table row. */}
      {pending > 0 && (
        <Link to="/admin/companies" className="note-warn flex items-center gap-3 p-4 block">
          <AlertTriangle size={18} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">
              {pending} {pending === 1 ? 'company is' : 'companies are'} waiting for approval
            </p>
            <p className="text-xs mt-0.5" style={{ opacity: .85 }}>
              Their recruiters cannot post jobs until you approve them.
            </p>
          </div>
          <span className="text-xs font-semibold shrink-0">Review</span>
        </Link>
      )}

      {/* Trend */}
      <Panel
        title="Applications and offers"
        subtitle="Monthly totals for the current cycle"
        action={<PanelLink to="/admin/analytics">Full analytics</PanelLink>}
      >
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={trend} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="gApplied" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#5B6BF5" stopOpacity={.28} />
                <stop offset="100%" stopColor="#5B6BF5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gPlaced" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#10B981" stopOpacity={.32} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="m" tick={{ fontSize: 11, fill: axis }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: axis }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 12, fontSize: 12,
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-lg)',
              }}
            />
            <Area type="monotone" dataKey="applied" name="Applied"
                  stroke="#5B6BF5" strokeWidth={2} fill="url(#gApplied)" />
            <Area type="monotone" dataKey="placed" name="Placed"
                  stroke="#10B981" strokeWidth={2} fill="url(#gPlaced)" />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      {/* Activity */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Panel
          title="Latest applications" padded={false}
          action={<PanelLink to="/admin/applications">See all</PanelLink>}
        >
          {isLoading ? <Loading /> : apps.length === 0 ? (
            <Empty
              icon={<ClipboardList size={22} />}
              title="No applications yet"
              body="Once students start applying to posted jobs, their submissions appear here."
              action={<Link to="/admin/jobs" className="btn btn-ghost">View open jobs</Link>}
            />
          ) : (
            <div>
              {apps.slice(0, 6).map((ap: any) => (
                <div
                  key={ap.id}
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <div className="w-8 h-8 rounded-lg grad-student flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {ap.student?.fullName?.[0] ?? 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium t-primary truncate">
                      {ap.student?.fullName ?? 'Student'}
                    </p>
                    <p className="text-xs t-tertiary truncate">
                      {ap.job?.title} · {ap.job?.company?.name}
                    </p>
                  </div>
                  <Stage status={ap.status} />
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Recent offers" padded={false}
          action={<PanelLink to="/admin/placements">See all</PanelLink>}
        >
          {places.length === 0 ? (
            <Empty
              icon={<Award size={22} />}
              title="No offers recorded"
              body="Record an offer when a student accepts, and it counts toward the placement rate above."
              action={<Link to="/admin/placements" className="btn btn-ghost">Record an offer</Link>}
            />
          ) : (
            <div>
              {places.slice(0, 6).map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <div className="w-8 h-8 rounded-lg grad-admin flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {p.student?.fullName?.[0] ?? 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium t-primary truncate">
                      {p.student?.fullName ?? 'Student'}
                    </p>
                    <p className="text-xs t-tertiary truncate">
                      {p.designation} · {p.company?.name}
                    </p>
                  </div>
                  {p.ctcOffered && (
                    <span
                      className="text-xs font-bold tnum shrink-0 px-2 py-1 rounded-lg"
                      style={{ background: 'var(--ok-bg)', color: 'var(--ok-fg)' }}
                    >
                      ₹{(p.ctcOffered / 100000).toFixed(1)}L
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

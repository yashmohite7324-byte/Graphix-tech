import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { Stat, Panel, PanelLink, Empty, Stage, Loading } from '../../components/Dash';
import {
  Briefcase, ClipboardList, CalendarDays, Award,
  MapPin, Brain, ArrowRight, Sparkles,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const first = (user?.name || user?.email?.split('@')[0] || 'there').split(' ')[0];

  const { data: pRes }  = useQuery({ queryKey: ['me'],        queryFn: () => api.get('/students/me'),            retry: false });
  const { data: aRes, isLoading } = useQuery({ queryKey: ['my-apps'],   queryFn: () => api.get('/applications/my'),        retry: false });
  const { data: jRes }  = useQuery({ queryKey: ['open-jobs'], queryFn: () => api.get('/jobs/public/search?size=4'), retry: false });
  const { data: iRes }  = useQuery({ queryKey: ['my-ivs'],    queryFn: () => api.get('/interviews/my'),           retry: false });

  const profile = pRes?.data?.data ?? {};
  const apps    = aRes?.data?.data ?? [];
  const jobs    = jRes?.data?.data?.content ?? jRes?.data?.data ?? [];
  const ivs     = iRes?.data?.data ?? [];

  const shortlisted = apps.filter((a: any) =>
    ['SHORTLISTED','INTERVIEW_SCHEDULED','SELECTED','OFFERED'].includes(a.status)).length;
  const upcoming = ivs.filter((i: any) =>
    i.result === 'PENDING' && new Date(i.scheduledAt) > new Date());

  const FIELDS = ['fullName','rollNumber','branch','cgpa','resumeUrl','photoUrl'];
  const done = FIELDS.filter(f => profile?.[f]).length;
  const pct  = Math.round((done / FIELDS.length) * 100);

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">

      <section className="surface mesh p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm t-secondary">{greet}</p>
            <h1 className="font-display text-2xl font-bold t-primary mt-0.5">{first}</h1>
            <p className="text-sm t-secondary mt-2 max-w-[50ch] leading-relaxed">
              {profile.isPlaced
                ? 'You have accepted an offer. Your placement record is with the office.'
                : apps.length === 0
                ? 'You have not applied anywhere yet. Open roles are listed below.'
                : upcoming.length > 0
                ? `${apps.length} applications in progress, with ${upcoming.length} interview${upcoming.length > 1 ? 's' : ''} coming up.`
                : `${apps.length} application${apps.length > 1 ? 's' : ''} in progress.`}
            </p>
          </div>
          <Link to="/student/jobs" className="btn btn-primary">
            Browse jobs <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Applications" value={apps.length} icon={<ClipboardList size={17} />}
              accent="var(--stage-review)" to="/student/applications" hint="submitted" />
        <Stat label="Shortlisted" value={shortlisted} icon={<Award size={17} />}
              accent="var(--stage-shortlisted)" hint="past first screening" />
        <Stat label="Interviews" value={upcoming.length} icon={<CalendarDays size={17} />}
              accent="var(--stage-interview)" to="/student/interviews" hint="scheduled ahead" />
        <Stat label="Profile" value={`${pct}%`} icon={<Sparkles size={17} />}
              accent="var(--stage-offered)" to="/student/profile" hint="complete" />
      </div>

      {/* Only surfaces when it's actually a problem worth fixing */}
      {pct < 80 && (
        <Link to="/student/profile" className="note-warn block p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold">
                Your profile is {pct}% complete
              </p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ opacity: .85 }}>
                Recruiters filter on CGPA, branch and resume. Missing fields keep you out of those lists.
              </p>
              <div className="h-1.5 rounded-full mt-2.5 max-w-xs overflow-hidden"
                   style={{ background: 'color-mix(in srgb, currentColor 20%, transparent)' }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'currentColor' }} />
              </div>
            </div>
            <span className="text-xs font-semibold shrink-0">Complete it</span>
          </div>
        </Link>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Panel
            title="Your applications" padded={false}
            action={<PanelLink to="/student/applications">See all</PanelLink>}
          >
            {isLoading ? <Loading /> : apps.length === 0 ? (
              <Empty
                icon={<Briefcase size={22} />}
                title="Nothing applied for yet"
                body="Roles that match your branch and CGPA are open right now."
                action={<Link to="/student/jobs" className="btn btn-primary">Browse open roles</Link>}
              />
            ) : (
              <div>
                {apps.slice(0, 6).map((ap: any) => (
                  <div key={ap.id} className="flex items-center gap-3 px-5 py-3.5"
                       style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="w-9 h-9 rounded-xl grad-recruiter flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {ap.job?.company?.name?.[0] ?? 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium t-primary truncate">{ap.job?.title}</p>
                      <p className="text-xs t-tertiary truncate">{ap.job?.company?.name}</p>
                    </div>
                    <Stage status={ap.status} />
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Next interview" padded={false}>
            {upcoming.length === 0 ? (
              <Empty
                icon={<CalendarDays size={20} />}
                title="None scheduled"
                body="Interview invitations appear here as soon as a company books a round."
              />
            ) : (
              <div className="p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-9 h-9 rounded-xl grad-student flex items-center justify-center text-white text-xs font-bold">
                    R{upcoming[0].round}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold t-primary truncate">
                      {upcoming[0].application?.job?.title}
                    </p>
                    <p className="text-xs t-tertiary truncate">
                      {upcoming[0].application?.job?.company?.name}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold t-primary tnum">
                  {new Date(upcoming[0].scheduledAt).toLocaleString('en-IN', {
                    weekday: 'short', day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
                {upcoming[0].mode && (
                  <p className="text-xs t-secondary mt-1">{upcoming[0].mode}</p>
                )}
                {upcoming[0].meetingLink && (
                  <a href={upcoming[0].meetingLink} target="_blank" rel="noreferrer"
                     className="btn btn-ghost w-full justify-center mt-3">
                    Open meeting link
                  </a>
                )}
              </div>
            )}
          </Panel>

          <Link to="/student/ai-score" className="surface surface-link grad-brand block p-5 text-white">
            <Brain size={20} />
            <p className="font-display font-semibold text-sm mt-2.5">Check your resume score</p>
            <p className="text-xs mt-1 leading-relaxed" style={{ opacity: .85 }}>
              See how a recruiter's filter reads your resume before you apply.
            </p>
          </Link>
        </div>
      </div>

      <Panel
        title="Open roles" subtitle="Matching your branch and batch" padded={false}
        action={<PanelLink to="/student/jobs">See all</PanelLink>}
      >
        {jobs.length === 0 ? (
          <Empty icon={<Briefcase size={22} />} title="No roles open right now"
                 body="The placement office posts new roles as companies confirm. Check back shortly." />
        ) : (
          <div className="grid sm:grid-cols-2">
            {jobs.slice(0, 4).map((j: any, i: number) => (
              <Link key={j.id} to="/student/jobs"
                    className="flex items-start gap-3 p-4"
                    style={{
                      borderTop: '1px solid var(--border)',
                      borderRight: i % 2 === 0 ? '1px solid var(--border)' : undefined,
                    }}>
                <div className="w-10 h-10 rounded-xl grad-recruiter flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {j.company?.name?.[0] ?? 'C'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium t-primary truncate">{j.title}</p>
                  <p className="text-xs t-tertiary truncate">{j.company?.name}</p>
                  <div className="flex items-center gap-2.5 mt-1.5">
                    {j.ctc && (
                      <span className="text-xs font-semibold tnum" style={{ color: 'var(--stage-offered)' }}>
                        ₹{(j.ctc / 100000).toFixed(1)}L
                      </span>
                    )}
                    {j.location && (
                      <span className="text-xs t-tertiary flex items-center gap-1">
                        <MapPin size={10} /> {j.location}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api';
import ThemeToggle from '../../components/ThemeToggle';
import { Panel } from '../../components/Dash';
import {
  Palette, User, Lock, BellRing, ShieldAlert,
  Check, Loader2, Eye, EyeOff, AlertCircle,
} from 'lucide-react';

type Tab = 'appearance' | 'profile' | 'security' | 'notifications' | 'account';

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: 'appearance',    label: 'Appearance',    icon: Palette },
  { key: 'profile',       label: 'Profile',       icon: User },
  { key: 'security',      label: 'Security',      icon: Lock },
  { key: 'notifications', label: 'Notifications', icon: BellRing },
  { key: 'account',       label: 'Account',       icon: ShieldAlert },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { resolved } = useTheme();
  const [tab, setTab] = useState<Tab>('appearance');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const flash = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* Profile */
  const [profile, setProfile] = useState({ name: user?.name ?? '', mobile: user?.mobile ?? '' });
  const saveProfile = useMutation({
    mutationFn: () => api.patch('/users/me', profile),
    onSuccess: () => flash('Profile saved'),
    onError: (e: any) => flash(e.response?.data?.error ?? 'Could not save profile', false),
  });

  /* Password */
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const changePw = useMutation({
    mutationFn: () => api.post('/auth/change-password', {
      currentPassword: pw.current, newPassword: pw.next,
    }),
    onSuccess: () => { flash('Password changed'); setPw({ current: '', next: '', confirm: '' }); },
    onError: (e: any) => flash(e.response?.data?.error ?? 'Could not change password', false),
  });

  const pwChecks = [
    { ok: pw.next.length >= 8,            label: '8 or more characters' },
    { ok: /[A-Z]/.test(pw.next),          label: 'One capital letter' },
    { ok: /[0-9]/.test(pw.next),          label: 'One number' },
    { ok: /[^A-Za-z0-9]/.test(pw.next),   label: 'One symbol' },
  ];
  const pwStrength = pwChecks.filter(c => c.ok).length;

  const submitPw = () => {
    if (pw.next !== pw.confirm) return flash('The two new passwords do not match', false);
    if (pwStrength < 3) return flash('Choose a stronger password', false);
    changePw.mutate();
  };

  /* Notifications */
  const [prefs, setPrefs] = useState({
    emailStatus: true, emailInterview: true, emailJobs: true,
    smsInterview: true, smsUrgent: false,
  });
  const savePrefs = useMutation({
    mutationFn: () => api.patch('/users/notification-preferences', prefs),
    onSuccess: () => flash('Notification settings saved'),
    onError: () => flash('Could not save notification settings', false),
  });

  const ROLE_LABEL: Record<string, string> = {
    STUDENT: 'Student', RECRUITER: 'Recruiter', TRAINER: 'Trainer',
    PLACEMENT_ADMIN: 'Placement Admin', SUPER_ADMIN: 'Super Admin',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {toast && (
        <div
          className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
          style={{
            background: toast.ok ? 'var(--ok-bg)' : 'var(--err-bg)',
            color:      toast.ok ? 'var(--ok-fg)' : 'var(--err-fg)',
            border: `1px solid ${toast.ok ? 'var(--ok-line)' : 'var(--err-line)'}`,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {toast.ok ? <Check size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="font-display text-2xl font-bold t-primary">Settings</h1>
        <p className="text-sm t-secondary mt-1">
          Control how Graphix TechHire looks and how it reaches you.
        </p>
      </div>

      <div className="grid lg:grid-cols-[200px_1fr] gap-6">

        {/* Tabs */}
        <nav className="surface p-2 h-fit lg:sticky lg:top-0">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5"
                style={{
                  background: active ? 'var(--brand-50)' : 'transparent',
                  color:      active ? 'var(--brand-600)' : 'var(--text-secondary)',
                }}
              >
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </nav>

        <div className="space-y-5">

          {/* ── Appearance ── */}
          {tab === 'appearance' && (
            <>
              <Panel
                title="Theme"
                subtitle={`Currently showing the ${resolved} theme`}
              >
                <ThemeToggle variant="menu" />
                <p className="text-xs t-tertiary mt-4 leading-relaxed max-w-[60ch]">
                  Following the system means the portal switches automatically when
                  your device moves between light and dark — useful if your
                  laptop dims in the evening.
                </p>
              </Panel>

              {/* Live preview so the choice is visible before leaving the page */}
              <Panel title="Preview" subtitle="How your dashboard looks with this theme">
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Applications', value: '24', accent: 'var(--stage-review)' },
                    { label: 'Shortlisted',  value: '7',  accent: 'var(--stage-shortlisted)' },
                    { label: 'Offers',       value: '2',  accent: 'var(--stage-offered)' },
                  ].map(s => (
                    <div key={s.label} className="surface relative overflow-hidden p-4">
                      <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: s.accent }} />
                      <p className="font-display text-2xl font-bold t-primary tnum">{s.value}</p>
                      <p className="text-xs t-secondary mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="stage stage-applied">Applied</span>
                  <span className="stage stage-shortlisted">Shortlisted</span>
                  <span className="stage stage-interview">Interview</span>
                  <span className="stage stage-offered">Offered</span>
                  <span className="stage stage-rejected">Rejected</span>
                </div>
              </Panel>
            </>
          )}

          {/* ── Profile ── */}
          {tab === 'profile' && (
            <Panel title="Your details" subtitle="Shown to recruiters and the placement office">
              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface-2)' }}>
                  <p className="text-xs t-tertiary">Email</p>
                  <p className="text-sm font-semibold t-primary mt-1 truncate">{user?.email}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface-2)' }}>
                  <p className="text-xs t-tertiary">Role</p>
                  <p className="text-sm font-semibold t-primary mt-1">
                    {ROLE_LABEL[user?.role ?? ''] ?? user?.role}
                  </p>
                </div>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="field-label">Full name</label>
                  <input
                    className="field"
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Your name as it should appear"
                  />
                </div>
                <div>
                  <label className="field-label">Mobile number</label>
                  <input
                    className="field tnum"
                    value={profile.mobile}
                    onChange={e => setProfile({ ...profile, mobile: e.target.value })}
                    placeholder="9876543210"
                  />
                  <p className="text-xs t-tertiary mt-1.5">
                    Used for login codes and interview reminders.
                  </p>
                </div>
                <button
                  onClick={() => saveProfile.mutate()}
                  disabled={saveProfile.isPending}
                  className="btn btn-primary"
                >
                  {saveProfile.isPending
                    ? <><Loader2 size={14} className="animate-spin" /> Saving</>
                    : 'Save changes'}
                </button>
              </div>
            </Panel>
          )}

          {/* ── Security ── */}
          {tab === 'security' && (
            <Panel title="Password" subtitle="Change the password you use to sign in">
              <div className="space-y-4 max-w-md">
                {([
                  ['current', 'Current password'],
                  ['next',    'New password'],
                  ['confirm', 'Confirm new password'],
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <label className="field-label">{label}</label>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        className="field pr-10"
                        value={pw[key]}
                        onChange={e => setPw({ ...pw, [key]: e.target.value })}
                        placeholder="••••••••"
                      />
                      {key === 'current' && (
                        <button
                          type="button"
                          onClick={() => setShowPw(s => !s)}
                          aria-label={showPw ? 'Hide passwords' : 'Show passwords'}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {pw.next && (
                  <div className="space-y-2">
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3].map(i => (
                        <span
                          key={i}
                          className="h-1 flex-1 rounded-full transition-colors"
                          style={{
                            background: i < pwStrength
                              ? (pwStrength >= 3 ? 'var(--stage-selected)' : 'var(--warn-fg)')
                              : 'var(--bg-surface-3)',
                          }}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {pwChecks.map(c => (
                        <span
                          key={c.label}
                          className="text-xs flex items-center gap-1.5"
                          style={{ color: c.ok ? 'var(--stage-selected)' : 'var(--text-tertiary)' }}
                        >
                          <Check size={11} strokeWidth={3} style={{ opacity: c.ok ? 1 : .3 }} />
                          {c.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={submitPw}
                  disabled={!pw.current || !pw.next || changePw.isPending}
                  className="btn btn-primary"
                >
                  {changePw.isPending
                    ? <><Loader2 size={14} className="animate-spin" /> Updating</>
                    : 'Change password'}
                </button>
              </div>
            </Panel>
          )}

          {/* ── Notifications ── */}
          {tab === 'notifications' && (
            <Panel title="What reaches you" subtitle="Turn off anything you don't need">
              <div className="space-y-5 max-w-lg">
                <div>
                  <p className="text-xs font-semibold t-secondary mb-2">Email</p>
                  <div className="space-y-1">
                    {([
                      ['emailStatus',   'Application updates', 'When your application moves to a new stage'],
                      ['emailInterview','Interview invites',    'When a company schedules a round with you'],
                      ['emailJobs',     'New job matches',      'When a job opens that fits your branch and CGPA'],
                    ] as const).map(([key, label, desc]) => (
                      <label
                        key={key}
                        className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                        style={{ background: prefs[key] ? 'var(--bg-surface-2)' : 'transparent' }}
                      >
                        <input
                          type="checkbox"
                          checked={prefs[key]}
                          onChange={e => setPrefs({ ...prefs, [key]: e.target.checked })}
                          className="mt-0.5 w-4 h-4 rounded"
                          style={{ accentColor: 'var(--brand-500)' }}
                        />
                        <span>
                          <span className="block text-sm font-medium t-primary">{label}</span>
                          <span className="block text-xs t-tertiary mt-0.5">{desc}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                  <p className="text-xs font-semibold t-secondary mb-2">Text message</p>
                  <div className="space-y-1">
                    {([
                      ['smsInterview', 'Interview reminders', 'A text the day before your interview'],
                      ['smsUrgent',    'Deadline warnings',   'When an application closes within 24 hours'],
                    ] as const).map(([key, label, desc]) => (
                      <label
                        key={key}
                        className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                        style={{ background: prefs[key] ? 'var(--bg-surface-2)' : 'transparent' }}
                      >
                        <input
                          type="checkbox"
                          checked={prefs[key]}
                          onChange={e => setPrefs({ ...prefs, [key]: e.target.checked })}
                          className="mt-0.5 w-4 h-4 rounded"
                          style={{ accentColor: 'var(--brand-500)' }}
                        />
                        <span>
                          <span className="block text-sm font-medium t-primary">{label}</span>
                          <span className="block text-xs t-tertiary mt-0.5">{desc}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => savePrefs.mutate()}
                  disabled={savePrefs.isPending}
                  className="btn btn-primary"
                >
                  {savePrefs.isPending
                    ? <><Loader2 size={14} className="animate-spin" /> Saving</>
                    : 'Save preferences'}
                </button>
              </div>
            </Panel>
          )}

          {/* ── Account ── */}
          {tab === 'account' && (
            <Panel title="Session and access" subtitle="Manage where you're signed in">
              <div className="space-y-3 max-w-lg">
                <div
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ background: 'var(--bg-surface-2)' }}
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold t-primary">Sign out everywhere</p>
                    <p className="text-xs t-tertiary mt-0.5 leading-relaxed">
                      Ends every session on every device. You'll sign in again here.
                    </p>
                  </div>
                  <button
                    onClick={() => api.post('/auth/logout-all').finally(logout)}
                    className="btn btn-ghost shrink-0"
                  >
                    Sign out all
                  </button>
                </div>

                <div className="note-warn p-4 flex items-start gap-3">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Closing your account</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ opacity: .85 }}>
                      The placement office handles account closure so your placement
                      record stays intact for institute reporting.
                    </p>
                    <a
                      href="mailto:tpo@graphixtechnologies.com"
                      className="inline-block text-xs font-semibold underline mt-2"
                    >
                      Email the placement office
                    </a>
                  </div>
                </div>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

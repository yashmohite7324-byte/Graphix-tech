import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/* ── Stat tile ─────────────────────────────────────────────────
   The figure is the hero. Label sits below it, icon is quiet in the
   corner, and the gradient is a thin left edge rather than a full
   wash — so a row of six tiles stays readable. */
export function Stat({
  label, value, hint, icon, accent = 'var(--brand-500)', trend, to,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  accent?: string;
  trend?: number;
  to?: string;
}) {
  const body = (
    <div className="surface surface-link relative overflow-hidden p-5 h-full">
      <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: accent }} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-3xl font-bold t-primary tnum leading-none">{value}</p>
          <p className="text-sm font-medium t-secondary mt-2">{label}</p>
          {hint && <p className="text-xs t-tertiary mt-0.5">{hint}</p>}
        </div>
        {icon && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }}
          >
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-3">
          {trend >= 0
            ? <ArrowUpRight size={13} style={{ color: 'var(--stage-selected)' }} />
            : <ArrowDownRight size={13} style={{ color: 'var(--stage-rejected)' }} />}
          <span
            className="text-xs font-semibold tnum"
            style={{ color: trend >= 0 ? 'var(--stage-selected)' : 'var(--stage-rejected)' }}
          >
            {Math.abs(trend)}%
          </span>
          <span className="text-xs t-tertiary">vs last month</span>
        </div>
      )}
    </div>
  );
  return to ? <Link to={to} className="block h-full">{body}</Link> : body;
}

/* ── Panel ─────────────────────────────────────────────────── */
export function Panel({
  title, subtitle, action, children, padded = true,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <section className="surface overflow-hidden">
      <header
        className="flex items-center justify-between gap-3 px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="min-w-0">
          <h2 className="font-display font-semibold text-sm t-primary">{title}</h2>
          {subtitle && <p className="text-xs t-tertiary mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

/* ── Panel link in the header ─────────────────────────────── */
export function PanelLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="text-xs font-semibold shrink-0 hover:underline"
      style={{ color: 'var(--brand-600)' }}
    >
      {children}
    </Link>
  );
}

/* ── Empty state ───────────────────────────────────────────
   An empty screen is an invitation to act, so it always carries
   the next action rather than just an apology. */
export function Empty({
  icon, title, body, action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--bg-surface-2)', color: 'var(--text-tertiary)' }}
      >
        {icon}
      </div>
      <p className="font-display font-semibold text-sm t-primary">{title}</p>
      <p className="text-xs t-tertiary mt-1.5 max-w-[34ch] leading-relaxed">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ── Pipeline stage badge ──────────────────────────────────
   One mapping used everywhere, so a status always looks the same. */
const STAGE_CLASS: Record<string, string> = {
  APPLIED:             'stage-applied',
  UNDER_REVIEW:        'stage-review',
  SHORTLISTED:         'stage-shortlisted',
  INTERVIEW_SCHEDULED: 'stage-interview',
  INTERVIEWED:         'stage-interview',
  SELECTED:            'stage-selected',
  OFFERED:             'stage-offered',
  PLACED:              'stage-offered',
  REJECTED:            'stage-rejected',
  WITHDRAWN:           'stage-applied',
  ON_HOLD:             'stage-review',
  PENDING:             'stage-review',
  APPROVED:            'stage-selected',
  ACTIVE:              'stage-selected',
  OPEN:                'stage-selected',
  CLOSED:              'stage-applied',
  SUSPENDED:           'stage-rejected',
  PASSED:              'stage-selected',
  FAILED:              'stage-rejected',
};

export function Stage({ status }: { status?: string }) {
  if (!status) return null;
  return (
    <span className={`stage ${STAGE_CLASS[status] ?? 'stage-applied'}`}>
      {status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
    </span>
  );
}

/* ── Loading skeleton ──────────────────────────────────────── */
export function Loading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-2/5" />
            <div className="skeleton h-2.5 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Horizontal funnel ─────────────────────────────────────
   Bars are proportional to the largest stage, so the shape of the
   pipeline is readable without reading any numbers. */
export function Funnel({ stages }: { stages: { label: string; count: number; color: string }[] }) {
  const max = Math.max(...stages.map(s => s.count), 1);
  return (
    <div className="space-y-2.5">
      {stages.map(s => (
        <div key={s.label} className="flex items-center gap-3">
          <span className="text-xs t-secondary w-24 shrink-0">{s.label}</span>
          <div className="flex-1 h-7 rounded-lg overflow-hidden" style={{ background: 'var(--bg-surface-2)' }}>
            <div
              className="h-full rounded-lg flex items-center px-2.5 transition-[width] duration-700"
              style={{ width: `${Math.max((s.count / max) * 100, 7)}%`, background: s.color }}
            >
              <span className="text-xs font-bold text-white tnum">{s.count}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

import { Loader2 } from 'lucide-react';

// Status badge that picks color based on status value
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    APPLIED: 'badge-blue',
    UNDER_REVIEW: 'badge-yellow',
    SHORTLISTED: 'badge-blue',
    INTERVIEW_SCHEDULED: 'badge-yellow',
    INTERVIEWED: 'badge-yellow',
    SELECTED: 'badge-green',
    OFFERED: 'badge-green',
    PLACED: 'badge-green',
    REJECTED: 'badge-red',
    WITHDRAWN: 'badge-slate',
    ON_HOLD: 'badge-yellow',
    OPEN: 'badge-green',
    CLOSED: 'badge-slate',
    DRAFT: 'badge-yellow',
    APPROVED: 'badge-green',
    PENDING: 'badge-yellow',
    ACTIVE: 'badge-green',
    SUSPENDED: 'badge-red',
    PASSED: 'badge-green',
    FAILED: 'badge-red',
    PRESENT: 'badge-green',
    ABSENT: 'badge-red',
    LATE: 'badge-yellow',
  };
  const cls = map[status] || 'badge-slate';
  return <span className={cls}>{status?.replace(/_/g, ' ')}</span>;
}

// A stat card used in dashboards
export function StatCard({
  label, value, icon, color = 'blue',
}: { label: string; value: string | number; icon: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    teal: 'bg-teal-50 text-teal-600',
  };
  return (
    <div className="stat-card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// Spinner for loading states
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return <Loader2 className={`${sizes[size]} animate-spin text-brand-500`} />;
}

// Full-page loading screen
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64 w-full">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    </div>
  );
}

// Empty state with icon + message
export function EmptyState({ icon, title, description }: {
  icon: React.ReactNode; title: string; description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-xs">{description}</p>}
    </div>
  );
}

// Simple toast notification
export function Toast({ message, type = 'success', onClose }: {
  message: string; type?: 'success' | 'error' | 'info'; onClose: () => void;
}) {
  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-brand-600',
  };
  return (
    <div className={`fixed bottom-6 right-6 z-50 ${colors[type]} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium animate-fade-in`}>
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 text-white">×</button>
    </div>
  );
}

// Form field wrapper
export function FormField({ label, error, children }: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Section header inside a page
export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {action}
    </div>
  );
}

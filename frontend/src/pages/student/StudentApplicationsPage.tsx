import { useQuery } from '@tanstack/react-query';
import { studentApi } from '../../api';
import { StatusBadge, PageLoader, EmptyState } from '../../components/ui';
import {
  ClipboardList, CheckCircle, Clock, XCircle,
  ChevronRight, Calendar, Building2
} from 'lucide-react';

const STATUS_STEPS = [
  'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED',
  'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'OFFERED', 'PLACED'
];

const TERMINAL_REJECTED = ['REJECTED', 'WITHDRAWN', 'ON_HOLD'];

function StatusTimeline({ current }: { current: string }) {
  if (TERMINAL_REJECTED.includes(current)) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
        <XCircle size={14} />
        {current === 'REJECTED' ? 'Application was not shortlisted' : current.replace('_', ' ')}
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(current);

  return (
    <div className="flex items-center gap-1 mt-3 flex-wrap">
      {STATUS_STEPS.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const pending = idx > currentIdx;

        return (
          <div key={step} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              active ? 'bg-brand-500 text-white' :
              done ? 'bg-green-100 text-green-700' :
              'bg-slate-100 text-slate-400'
            }`}>
              {done && <CheckCircle size={11} />}
              {active && <Clock size={11} />}
              {step.replace(/_/g, ' ')}
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <ChevronRight size={12} className={done ? 'text-green-400' : 'text-slate-200'} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function StudentApplicationsPage() {
  const { data: appsRes, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => studentApi.getApplications(),
  });

  if (isLoading) return <PageLoader />;

  const apps = appsRes?.data?.data || [];

  const active = apps.filter((a: any) =>
    !TERMINAL_REJECTED.includes(a.status) && a.status !== 'PLACED');
  const placed = apps.filter((a: any) => a.status === 'PLACED' || a.status === 'OFFERED');
  const rejected = apps.filter((a: any) => TERMINAL_REJECTED.includes(a.status));

  return (
    <div className="space-y-6">
      <div>
        <h1>My Applications</h1>
        <p className="text-slate-500 text-sm mt-1">
          Track the status of all your job applications.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Applied', value: apps.length, color: 'bg-blue-50 text-blue-600' },
          { label: 'In Progress', value: active.length, color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Offers / Placed', value: placed.length, color: 'bg-green-50 text-green-600' },
          { label: 'Not Selected', value: rejected.length, color: 'bg-red-50 text-red-600' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${s.color}`}>
              {s.value}
            </div>
            <p className="text-sm text-slate-600 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Applications list */}
      {apps.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={28} />}
          title="No applications yet"
          description="Browse open jobs and apply to start tracking your applications here."
        />
      ) : (
        <div className="space-y-4">
          {apps.map((app: any) => (
            <div key={app.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 items-start">
                  <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-bold flex-shrink-0">
                    {app.job?.company?.name?.[0] || 'C'}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {app.job?.title || `Job #${app.job?.id}`}
                    </h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Building2 size={12} />
                        {app.job?.company?.name || 'Company'}
                      </span>
                      {app.appliedAt && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar size={12} />
                          Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <StatusBadge status={app.status} />
              </div>

              {/* Status timeline */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-2">Application Progress</p>
                <StatusTimeline current={app.status} />
              </div>

              {/* CTC info if offered */}
              {(app.status === 'OFFERED' || app.status === 'PLACED') && app.job?.ctc && (
                <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                  <CheckCircle size={16} />
                  Offer: ₹{(app.job.ctc / 100000).toFixed(1)}L CTC — {app.job.company?.name}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

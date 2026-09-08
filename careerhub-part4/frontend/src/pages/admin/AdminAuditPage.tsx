import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api';
import { PageLoader, EmptyState } from '../../components/ui';
import { FileText, Search, Shield } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'badge-green',
  REGISTER: 'badge-blue',
  OTP_VERIFIED: 'badge-blue',
  COMPANY_APPROVED: 'badge-green',
  COMPANY_REJECTED: 'badge-red',
  APPLICATION_STATUS_CHANGED: 'badge-yellow',
  INTERVIEW_SCHEDULED: 'badge-blue',
  INTERVIEW_RESULT_UPDATED: 'badge-yellow',
  PLACEMENT_RECORDED: 'badge-green',
  ANNOUNCEMENT_CREATED: 'badge-blue',
  ANNOUNCEMENT_DELETED: 'badge-red',
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminAuditPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const { data: res, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => adminApi.getAuditLogs(),
  });

  if (isLoading) return <PageLoader />;

  const logs = res?.data?.data?.content || res?.data?.data || [];

  const actions = ['ALL', ...Array.from(new Set(
    logs.map((l: any) => l.action).filter(Boolean)
  )) as string[]];

  const filtered = logs.filter((l: any) => {
    const matchSearch =
      l.actorEmail?.toLowerCase().includes(search.toLowerCase()) ||
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.entityName?.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'ALL' || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1>Audit Log</h1>
        <p className="text-slate-500 text-sm mt-1">
          All sensitive actions recorded with actor, timestamp and details.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9 text-sm" placeholder="Search by email, action or entity..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto text-sm" value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}>
          {actions.map(a => <option key={a} value={a}>{a === 'ALL' ? 'All Actions' : a.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Log table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="flex items-center gap-2">
            <Shield size={16} className="text-slate-400" />
            {filtered.length} records
          </h3>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText size={28} />}
            title="No audit records found"
            description="Audit logs will appear here as users perform actions."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="table-header">Actor</th>
                  <th className="table-header">Action</th>
                  <th className="table-header">Entity</th>
                  <th className="table-header">Entity ID</th>
                  <th className="table-header">Details</th>
                  <th className="table-header">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                          {log.actorEmail?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="text-xs text-slate-700 truncate max-w-32">
                          {log.actorEmail || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={ACTION_COLORS[log.action] || 'badge-slate'}>
                        {log.action?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="table-cell text-sm text-slate-600">{log.entityName || '—'}</td>
                    <td className="table-cell text-sm text-slate-400">{log.entityId || '—'}</td>
                    <td className="table-cell text-sm text-slate-600 max-w-xs truncate">
                      {log.details || '—'}
                    </td>
                    <td className="table-cell text-xs text-slate-400 whitespace-nowrap">
                      {log.createdAt ? timeAgo(log.createdAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

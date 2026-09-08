import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api';
import { StatusBadge, PageLoader, EmptyState, SectionHeader } from '../../components/ui';
import {
  Building2, CheckCircle, XCircle, Search,
  Globe, Filter, Eye, Plus
} from 'lucide-react';

export default function AdminCompaniesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [toast, setToast] = useState('');

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: () => adminApi.getCompanies(),
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.approveCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      showToast('Company approved successfully');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminApi.rejectCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      showToast('Company rejected');
    },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
    </div>
  );

  const companies = res?.data?.data || [];
  const filtered = companies.filter((c: any) => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.industry?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || c.verificationStatus === filter;
    return matchSearch && matchFilter;
  });

  const pending = companies.filter((c: any) => c.verificationStatus === 'PENDING').length;
  const approved = companies.filter((c: any) => c.verificationStatus === 'APPROVED').length;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          ✓ {toast}
        </div>
      )}

      <SectionHeader
        title="Company Management"
        action={
          <button className="btn-primary">
            <Plus size={16} /> Add Company
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Companies', value: companies.length, color: 'bg-blue-50 text-blue-600' },
          { label: 'Pending Approval', value: pending, color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Approved', value: approved, color: 'bg-green-50 text-green-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${s.color}`}>
              {s.value}
            </div>
            <p className="text-sm font-medium text-slate-600">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9 text-sm" placeholder="Search companies..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Building2 size={28} />}
            title="No companies found"
            description="No companies match your current filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="table-header">Company</th>
                  <th className="table-header">Industry</th>
                  <th className="table-header">Website</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((company: any) => (
                  <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-sm flex-shrink-0">
                          {company.name?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{company.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">ID: #{company.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="badge-slate">{company.industry || '—'}</span>
                    </td>
                    <td className="table-cell">
                      {company.website ? (
                        <a href={`https://${company.website}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-brand-600 hover:underline text-sm">
                          <Globe size={13} /> {company.website}
                        </a>
                      ) : '—'}
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={company.verificationStatus} />
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="View details">
                          <Eye size={15} />
                        </button>
                        {company.verificationStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={() => approveMutation.mutate(company.id)}
                              disabled={approveMutation.isPending}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                            >
                              <CheckCircle size={13} /> Approve
                            </button>
                            <button
                              onClick={() => rejectMutation.mutate(company.id)}
                              disabled={rejectMutation.isPending}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </>
                        )}
                        {company.verificationStatus === 'APPROVED' && (
                          <button
                            onClick={() => rejectMutation.mutate(company.id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
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

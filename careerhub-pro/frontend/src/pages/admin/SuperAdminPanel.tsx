import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import {
  Users, Upload, Download, Shield, Search, MoreVertical,
  CheckCircle, XCircle, Loader2, FileSpreadsheet, AlertCircle,
  UserPlus, Ban, RotateCcw, Trash2, FileDown, Database
} from 'lucide-react';

type Tab = 'users' | 'import' | 'export';

// ─── Bulk Upload Card ─────────────────────────────────────────
function BulkUploadCard({ type, title, description, templateUrl, uploadUrl }: {
  type: 'students' | 'companies';
  title: string;
  description: string;
  templateUrl: string;
  uploadUrl: string;
}) {
  const [result, setResult] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post(uploadUrl, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data.data);
      queryClient.invalidateQueries();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Upload failed. Check the file format.');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    const res = await api.get(templateUrl, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <FileSpreadsheet size={17} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-400">{description}</p>
          </div>
        </div>
        <button onClick={downloadTemplate}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
          <Download size={13} /> Template
        </button>
      </div>

      <div className="p-5">
        <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden"
          onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />

        <button onClick={() => inputRef.current?.click()} disabled={uploading}
          className="w-full border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 rounded-2xl p-6 transition-all disabled:opacity-60">
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={26} className="text-emerald-500 animate-spin" />
              <p className="text-sm font-medium text-emerald-600">Processing file...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={26} className="text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Click to upload Excel file</p>
                <p className="text-xs text-slate-400 mt-0.5">.xlsx or .xls • Max 5 MB</p>
              </div>
            </div>
          )}
        </button>

        {error && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-xl font-black text-emerald-600">{result.createdCount}</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">Created</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-xl font-black text-amber-600">{result.skippedCount}</p>
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Skipped</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-xl font-black text-red-500">{result.errorCount}</p>
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wide">Errors</p>
              </div>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
              <p className="text-xs text-indigo-700 font-medium">{result.message}</p>
              {result.defaultPassword && (
                <p className="text-xs text-indigo-600 mt-1">
                  Default password: <code className="bg-white px-1.5 py-0.5 rounded font-mono">{result.defaultPassword}</code>
                </p>
              )}
            </div>

            {result.errors?.length > 0 && (
              <details className="text-xs">
                <summary className="cursor-pointer text-red-600 font-semibold">
                  View {result.errors.length} error{result.errors.length !== 1 ? 's' : ''}
                </summary>
                <div className="mt-2 max-h-32 overflow-y-auto space-y-1 bg-red-50 rounded-lg p-2">
                  {result.errors.map((err: string, i: number) => (
                    <p key={i} className="text-red-600">{err}</p>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────
export default function SuperAdminPanel() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('users');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [toast, setToast] = useState('');

  const show = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => api.get('/admin/users'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/admin/users/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      show('User status updated');
    },
  });

  const resetPwMutation = useMutation({
    mutationFn: (id: number) => api.post(`/admin/users/${id}/reset-password`),
    onSuccess: () => show('Password reset — user notified by email'),
  });

  const users = usersRes?.data?.data || [];
  const filtered = users.filter((u: any) => {
    const matchSearch = u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleCounts = {
    STUDENT:         users.filter((u: any) => u.role === 'STUDENT').length,
    RECRUITER:       users.filter((u: any) => u.role === 'RECRUITER').length,
    TRAINER:         users.filter((u: any) => u.role === 'TRAINER').length,
    PLACEMENT_ADMIN: users.filter((u: any) => u.role === 'PLACEMENT_ADMIN').length,
    SUPER_ADMIN:     users.filter((u: any) => u.role === 'SUPER_ADMIN').length,
  };

  const ROLE_STYLE: Record<string, string> = {
    STUDENT:         'bg-indigo-50 text-indigo-700',
    RECRUITER:       'bg-blue-50 text-blue-700',
    TRAINER:         'bg-amber-50 text-amber-700',
    PLACEMENT_ADMIN: 'bg-emerald-50 text-emerald-700',
    SUPER_ADMIN:     'bg-slate-800 text-white',
  };

  const STATUS_STYLE: Record<string, string> = {
    ACTIVE:    'bg-emerald-50 text-emerald-600',
    PENDING:   'bg-amber-50 text-amber-600',
    SUSPENDED: 'bg-red-50 text-red-600',
  };

  const exportFile = async (url: string, name: string) => {
    const res = await api.get(url, { responseType: 'blob' });
    const blobUrl = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = name;
    a.click();
    URL.revokeObjectURL(blobUrl);
    show(`${name} downloaded`);
  };

  return (
    <div className="space-y-6 animate-fade-up max-w-7xl mx-auto">

      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold">
          <CheckCircle size={16} className="text-emerald-400" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-slate-950 p-7 text-white">
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/5 -translate-y-20 translate-x-20" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} className="text-slate-400" />
            <span className="text-slate-400 text-sm font-medium">System Administration</span>
          </div>
          <h1 className="text-3xl font-black text-white">Super Admin Panel</h1>
          <p className="text-slate-300 text-sm mt-1">
            Manage all users, bulk import data, and export institutional reports
          </p>

          {/* Role counts */}
          <div className="flex flex-wrap gap-2.5 mt-5">
            {Object.entries(roleCounts).map(([role, count]) => (
              <div key={role} className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2">
                <p className="text-lg font-black text-white leading-none">{count}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">
                  {role.replace('_', ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {([
          { key: 'users',  label: 'User Management', icon: Users },
          { key: 'import', label: 'Bulk Import',     icon: Upload },
          { key: 'export', label: 'Reports & Export',icon: FileDown },
        ] as const).map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ─── Users Tab ─── */}
      {tab === 'users' && (
        <>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Search by email..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {['ALL','STUDENT','RECRUITER','TRAINER','PLACEMENT_ADMIN'].map(r => (
                <button key={r} onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    roleFilter === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}>{r.replace('_',' ')}</button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="py-16 flex justify-center">
                <Loader2 size={24} className="animate-spin text-indigo-500" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-14 text-center text-sm text-slate-400">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      {['User','Role','Status','Joined','Actions'].map(h => (
                        <th key={h} className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-5 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((u: any) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                              {u.email?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{u.email}</p>
                              {u.mobile && <p className="text-xs text-slate-400">{u.mobile}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${ROLE_STYLE[u.role] || 'bg-slate-100 text-slate-600'}`}>
                            {u.role?.replace('_',' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${STATUS_STYLE[u.status] || 'bg-slate-100 text-slate-600'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1.5">
                            {u.status === 'ACTIVE' ? (
                              <button onClick={() => statusMutation.mutate({ id: u.id, status: 'SUSPENDED' })}
                                title="Suspend user"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Ban size={14} />
                              </button>
                            ) : (
                              <button onClick={() => statusMutation.mutate({ id: u.id, status: 'ACTIVE' })}
                                title="Activate user"
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                <CheckCircle size={14} />
                              </button>
                            )}
                            <button onClick={() => resetPwMutation.mutate(u.id)}
                              title="Reset password"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                              <RotateCcw size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 text-xs text-slate-400">
              Showing {filtered.length} of {users.length} users
            </div>
          </div>
        </>
      )}

      {/* ─── Import Tab ─── */}
      {tab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <BulkUploadCard
            type="students"
            title="Import Students"
            description="Upload an Excel sheet of student records"
            templateUrl="/admin/bulk/template/students"
            uploadUrl="/admin/bulk/students"
          />
          <BulkUploadCard
            type="companies"
            title="Import Companies"
            description="Upload an Excel sheet of companies + recruiters"
            templateUrl="/admin/bulk/template/companies"
            uploadUrl="/admin/bulk/companies"
          />
        </div>
      )}

      {/* ─── Export Tab ─── */}
      {tab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Student Master List', desc: 'All students with CGPA, branch, placement status', url: '/admin/export/students', file: 'students_export.xlsx', gradient: 'from-indigo-500 to-violet-600', icon: Users },
            { label: 'Placement Report',    desc: 'Placements with CTC, average and highest package', url: '/admin/export/placements', file: 'placement_report.xlsx', gradient: 'from-emerald-500 to-teal-600', icon: FileSpreadsheet },
            { label: 'Application Log',     desc: 'Every application with current status and date', url: '/admin/export/applications', file: 'applications_export.xlsx', gradient: 'from-blue-500 to-cyan-600', icon: Database },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button key={item.url} onClick={() => exportFile(item.url, item.file)}
                className="text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-3`}>
                  <Icon size={19} />
                </div>
                <p className="text-sm font-bold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-indigo-600">
                  <Download size={13} /> Download .xlsx
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

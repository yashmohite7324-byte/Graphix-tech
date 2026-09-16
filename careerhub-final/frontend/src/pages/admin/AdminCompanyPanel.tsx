import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';

const COMPANY_DATA = [
  { name: 'LOGICA ENGINEERING & MANUFACTURING INDIA PVT. LTD.', designation: 'HR Executive', location: 'Bhosari', email: 'hr@logicaengineering.com', industry: 'Engineering & Manufacturing' },
  { name: 'Manjushree fab', designation: 'HR Executive', location: 'Bhosari', email: 'hr@manjushreefab.com', industry: 'Fabrication' },
  { name: 'Avamdharma Consulting Solutions Pvt Ltd', designation: 'Chief Technology Officer', location: 'Pune', email: 'cto@avamdharma.com', industry: 'IT Consulting' },
  { name: 'Powermech', designation: 'HR Executive', location: 'Mumbai', email: 'hr@powermech.com', industry: 'Engineering' },
  { name: 'Buildnest', designation: 'CEO', location: 'Bangalore', email: 'ceo@buildnest.com', industry: 'Construction' },
  { name: 'KD Architecture and Structure', designation: 'HR Executive', location: 'Pune', email: 'hr@kdarchitecture.com', industry: 'Architecture' },
  { name: 'Grey Space Computing', designation: 'HR Generalist', location: 'Kodhwa', email: 'hr@greyspacecomputing.com', industry: 'IT/Software' },
  { name: 'ULTRA PRECISION INDUSTRIES', designation: 'CEO', location: 'Bhosari', email: 'ceo@ultraprecision.com', industry: 'Manufacturing' },
  { name: 'Sai Nath Engineering', designation: 'HR Executive', location: 'Kharadi', email: 'hr@sainathengineering.com', industry: 'Engineering' },
  { name: 'ULC Plast', designation: 'HR Executive', location: 'Bhosari', email: 'hr@ulcplast.com', industry: 'Plastics' },
];

export default function AdminCompanyPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const { data: res } = useQuery({
    queryKey: ['admin-companies-full'],
    queryFn: () => api.get('/admin/companies'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/companies/${id}/approve`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-companies-full'] }); showToast('Company approved! Recruiter can now login.'); setSelected(null); },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/companies/${id}/reject`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-companies-full'] }); showToast('Company rejected.'); setSelected(null); },
  });

  const companies = res?.data?.data || [];
  const filtered = companies.filter((c: any) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor: Record<string, string> = {
    APPROVED: 'bg-emerald-100 text-emerald-700',
    PENDING: 'bg-amber-100 text-amber-700',
    REJECTED: 'bg-red-100 text-red-600',
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold animate-fade-up">
          ✓ {toast}
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-7 text-white"
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-16 translate-x-16" />
        <div className="relative">
          <p className="text-slate-400 text-sm font-medium mb-1">Graphix Infotech Admin Panel</p>
          <h1 className="text-3xl font-black text-white mb-2">Company Management</h1>
          <p className="text-slate-300 text-sm">
            Approve companies to grant their recruiters full portal access.
            All 10 institute-linked companies are pre-loaded below.
          </p>
          <div className="flex gap-4 mt-5">
            {[
              { label: 'Total', value: companies.length, color: 'text-white' },
              { label: 'Approved', value: companies.filter((c: any) => c.verificationStatus === 'APPROVED').length, color: 'text-emerald-400' },
              { label: 'Pending', value: companies.filter((c: any) => c.verificationStatus === 'PENDING').length, color: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-2xl px-4 py-3 text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <input className="input" placeholder="Search companies..."
        value={search} onChange={e => setSearch(e.target.value)} />

      {/* Company Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-2xl">
                  {selected.name[0]}
                </div>
                <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white text-2xl">×</button>
              </div>
              <h2 className="text-xl font-bold text-white mt-3">{selected.name}</h2>
              <p className="text-slate-300 text-sm mt-1">{selected.industry} • {selected.headquarters}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Recruiter Email', value: selected.recruiterEmail || '—' },
                  { label: 'Designation', value: selected.recruiterDesignation || '—' },
                  { label: 'Location', value: selected.headquarters || '—' },
                  { label: 'Status', value: selected.verificationStatus },
                ].map(f => (
                  <div key={f.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{f.label}</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{f.value}</p>
                  </div>
                ))}
              </div>

              {selected.verificationStatus === 'PENDING' && (
                <div className="flex gap-3 pt-2">
                  <button onClick={() => rejectMutation.mutate(selected.id)}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors">
                    ✕ Reject
                  </button>
                  <button onClick={() => approveMutation.mutate(selected.id)}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    ✓ Approve & Enable Login
                  </button>
                </div>
              )}
              {selected.verificationStatus === 'APPROVED' && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Company Approved</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Recruiter can login and post jobs</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Companies grid */}
      {companies.length === 0 ? (
        /* Show the seed data visually before DB loads */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {COMPANY_DATA.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase())
          ).map((c, i) => (
            <div key={i} className="card p-5 opacity-60">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg"
                  style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                  {c.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-tight">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.industry}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{c.location}</span>
                <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">PENDING</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((company: any) => {
            const seedData = COMPANY_DATA.find(c =>
              c.name.toLowerCase().includes(company.name?.toLowerCase()?.slice(0, 10))
            );
            return (
              <div key={company.id}
                className="card p-5 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-indigo-200"
                onClick={() => setSelected({
                  ...company,
                  recruiterEmail: seedData?.email,
                  recruiterDesignation: seedData?.designation,
                })}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                      {company.name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">{company.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{company.industry}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[company.verificationStatus] || 'bg-slate-100 text-slate-600'}`}>
                    {company.verificationStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <span>📍 {company.headquarters || seedData?.location}</span>
                  <span>👔 {seedData?.designation}</span>
                  <span className="col-span-2 truncate">✉ {seedData?.email}</span>
                </div>

                {company.verificationStatus === 'PENDING' && (
                  <div className="flex gap-2 mt-4" onClick={e => e.stopPropagation()}>
                    <button onClick={() => rejectMutation.mutate(company.id)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors">
                      Reject
                    </button>
                    <button onClick={() => approveMutation.mutate(company.id)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                      ✓ Approve
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

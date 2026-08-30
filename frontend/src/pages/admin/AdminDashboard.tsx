import { useQuery } from '@tanstack/react-query';
import { adminApi, placementApi } from '../../api';
import { StatCard, PageLoader, StatusBadge } from '../../components/ui';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Users, Building2, Briefcase, GraduationCap, TrendingUp, DollarSign } from 'lucide-react';

const COLORS = ['#3b5bdb', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b'];

// Dummy analytics data until real aggregation endpoints are built
const branchData = [
  { branch: 'CSE', placed: 45, total: 60 },
  { branch: 'IT', placed: 32, total: 45 },
  { branch: 'ECE', placed: 28, total: 50 },
  { branch: 'MECH', placed: 15, total: 40 },
  { branch: 'CIVIL', placed: 10, total: 35 },
];

const trendData = [
  { month: 'Jan', applications: 40, placements: 12 },
  { month: 'Feb', applications: 65, placements: 18 },
  { month: 'Mar', applications: 90, placements: 25 },
  { month: 'Apr', applications: 120, placements: 38 },
  { month: 'May', applications: 180, placements: 55 },
  { month: 'Jun', applications: 210, placements: 72 },
];

const sectorData = [
  { name: 'IT Services', value: 40 },
  { name: 'Product', value: 25 },
  { name: 'Finance', value: 15 },
  { name: 'Consulting', value: 12 },
  { name: 'Others', value: 8 },
];

export default function AdminDashboard() {
  const { data: companiesRes, isLoading } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: () => adminApi.getCompanies(),
  });

  const { data: statsRes } = useQuery({
    queryKey: ['placement-stats'],
    queryFn: () => placementApi.getStats(),
  });

  if (isLoading) return <PageLoader />;

  const companies = companiesRes?.data?.data || [];
  const stats = statsRes?.data?.data || {};
  const pendingCompanies = companies.filter((c: any) => c.verificationStatus === 'PENDING');

  return (
    <div className="space-y-6">
      <div>
        <h1>Placement Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of placement activities and analytics for this academic year.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value="2,400" icon={<Users size={22} />} color="blue" />
        <StatCard label="Active Companies" value={companies.filter((c: any) => c.verificationStatus === 'APPROVED').length} icon={<Building2 size={22} />} color="purple" />
        <StatCard label="Total Placements" value={stats.totalPlacements || 0} icon={<GraduationCap size={22} />} color="green" />
        <StatCard label="Avg Package" value={stats.averageCtc ? `₹${(stats.averageCtc / 100000).toFixed(1)}L` : '—'} icon={<DollarSign size={22} />} color="orange" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Highest Package" value={stats.highestCtc ? `₹${(stats.highestCtc / 100000).toFixed(1)}L` : '—'} icon={<TrendingUp size={22} />} color="teal" />
        <StatCard label="Pending Approvals" value={pendingCompanies.length} icon={<Building2 size={22} />} color="red" />
        <StatCard label="Open Jobs" value="48" icon={<Briefcase size={22} />} color="blue" />
        <StatCard label="Placement %" value="78%" icon={<TrendingUp size={22} />} color="green" />
      </div>

      {/* Pending company approvals */}
      {pendingCompanies.length > 0 && (
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3>⏳ Pending Company Approvals ({pendingCompanies.length})</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingCompanies.map((c: any) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.industry} • {c.website}</p>
                </div>
                <div className="flex gap-2">
                  <ApproveRejectButtons companyId={c.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch-wise placement */}
        <div className="card p-5">
          <h3 className="mb-4">Branch-wise Placement</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={branchData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="placed" fill="#3b5bdb" radius={[4, 4, 0, 0]} name="Placed" />
              <Bar dataKey="total" fill="#e0eaff" radius={[4, 4, 0, 0]} name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Application trend */}
        <div className="card p-5">
          <h3 className="mb-4">Application & Placement Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="applications" stroke="#3b5bdb" strokeWidth={2} dot={false} name="Applications" />
              <Line type="monotone" dataKey="placements" stroke="#10b981" strokeWidth={2} dot={false} name="Placements" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector distribution */}
        <div className="card p-5">
          <h3 className="mb-4">Placement by Sector</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={sectorData} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                {sectorData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {sectorData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-slate-600 flex-1">{s.name}</span>
                <span className="font-medium">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent companies */}
        <div className="card lg:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3>All Companies</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Company</th>
                  <th className="table-header">Industry</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {companies.slice(0, 6).map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="table-cell">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.website}</p>
                    </td>
                    <td className="table-cell">{c.industry}</td>
                    <td className="table-cell">
                      <StatusBadge status={c.verificationStatus} />
                    </td>
                  </tr>
                ))}
                {companies.length === 0 && (
                  <tr>
                    <td colSpan={3} className="table-cell text-center text-slate-400 py-8">No companies yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApproveRejectButtons({ companyId }: { companyId: number }) {
  const { mutate: approve } = useMutation({
    mutationFn: () => adminApi.approveCompany(companyId),
    onSuccess: () => window.location.reload(),
  });
  const { mutate: reject } = useMutation({
    mutationFn: () => adminApi.rejectCompany(companyId),
    onSuccess: () => window.location.reload(),
  });

  return (
    <>
      <button onClick={() => approve()} className="btn-primary text-xs px-3 py-1.5">Approve</button>
      <button onClick={() => reject()} className="btn-danger text-xs px-3 py-1.5">Reject</button>
    </>
  );
}

function useMutation({ mutationFn, onSuccess }: { mutationFn: () => Promise<any>, onSuccess: () => void }) {
  const mutate = async () => { try { await mutationFn(); onSuccess(); } catch (e) { console.error(e); } };
  return { mutate };
}

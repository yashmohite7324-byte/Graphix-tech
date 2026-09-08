import { useQuery } from '@tanstack/react-query';
import api, { placementApi } from '../../api';
import { PageLoader, StatCard } from '../../components/ui';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { TrendingUp, Users, DollarSign, Building2 } from 'lucide-react';

const COLORS = ['#3b5bdb', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const branchData = [
  { branch: 'CSE', placed: 45, total: 60, percentage: 75 },
  { branch: 'IT', placed: 32, total: 45, percentage: 71 },
  { branch: 'ECE', placed: 28, total: 50, percentage: 56 },
  { branch: 'MECH', placed: 15, total: 40, percentage: 38 },
  { branch: 'CIVIL', placed: 10, total: 35, percentage: 29 },
  { branch: 'MBA', placed: 22, total: 30, percentage: 73 },
];

const monthlyTrend = [
  { month: 'Aug', applications: 45, shortlisted: 20, placed: 8 },
  { month: 'Sep', applications: 78, shortlisted: 35, placed: 15 },
  { month: 'Oct', applications: 120, shortlisted: 55, placed: 28 },
  { month: 'Nov', applications: 180, shortlisted: 82, placed: 45 },
  { month: 'Dec', applications: 210, shortlisted: 95, placed: 62 },
  { month: 'Jan', applications: 165, shortlisted: 75, placed: 55 },
];

const ctcDistribution = [
  { range: '3-5L', count: 28 },
  { range: '5-8L', count: 45 },
  { range: '8-12L', count: 32 },
  { range: '12-20L', count: 18 },
  { range: '20L+', count: 9 },
];

const sectorData = [
  { name: 'IT Services', value: 38 },
  { name: 'Product', value: 27 },
  { name: 'Finance', value: 16 },
  { name: 'Consulting', value: 12 },
  { name: 'Others', value: 7 },
];

const topCompanies = [
  { name: 'TCS', hired: 18 },
  { name: 'Infosys', hired: 15 },
  { name: 'Wipro', hired: 12 },
  { name: 'Google', hired: 4 },
  { name: 'Microsoft', hired: 3 },
  { name: 'Amazon', hired: 6 },
];

export default function AdminAnalyticsPage() {
  const { data: statsRes, isLoading } = useQuery({
    queryKey: ['placement-stats'],
    queryFn: () => placementApi.getStats(),
  });

  const { data: summaryRes } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => api.get('/admin/analytics/summary'),
  });

  if (isLoading) return <PageLoader />;

  const stats = statsRes?.data?.data || {};
  const summary = summaryRes?.data?.data || {};

  const totalPlaced = branchData.reduce((s, b) => s + b.placed, 0);
  const totalStudents = branchData.reduce((s, b) => s + b.total, 0);
  const placementPct = Math.round((totalPlaced / totalStudents) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1>Analytics & Reports</h1>
        <p className="text-slate-500 text-sm mt-1">
          Placement analytics and performance metrics for this academic year.
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={summary.totalStudents || totalStudents}
          icon={<Users size={22} />}
          color="blue"
        />
        <StatCard
          label="Placement %"
          value={`${placementPct}%`}
          icon={<TrendingUp size={22} />}
          color="green"
        />
        <StatCard
          label="Avg Package"
          value={stats.averageCtc ? `₹${(stats.averageCtc / 100000).toFixed(1)}L` : '₹7.2L'}
          icon={<DollarSign size={22} />}
          color="purple"
        />
        <StatCard
          label="Companies"
          value={summary.totalCompanies || 48}
          icon={<Building2 size={22} />}
          color="orange"
        />
      </div>

      {/* Branch-wise placement + monthly trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="mb-1">Branch-wise Placement</h3>
          <p className="text-xs text-slate-400 mb-4">Placed vs total eligible students per branch</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={branchData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="branch" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="total" fill="#e0eaff" radius={[4, 4, 0, 0]} name="Total" />
              <Bar dataKey="placed" fill="#3b5bdb" radius={[4, 4, 0, 0]} name="Placed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-1">Monthly Placement Trend</h3>
          <p className="text-xs text-slate-400 mb-4">Applications, shortlisted, and placements over time</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b5bdb" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b5bdb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPlaced" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="applications" stroke="#3b5bdb" fill="url(#colorApps)" strokeWidth={2} name="Applications" />
              <Area type="monotone" dataKey="shortlisted" stroke="#8b5cf6" fill="none" strokeWidth={2} strokeDasharray="5 5" name="Shortlisted" />
              <Area type="monotone" dataKey="placed" stroke="#10b981" fill="url(#colorPlaced)" strokeWidth={2} name="Placed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CTC distribution + sector + top companies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5">
          <h3 className="mb-1">CTC Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Number of students per salary range</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ctcDistribution} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="range" type="category" tick={{ fontSize: 11 }} width={40} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar dataKey="count" fill="#3b5bdb" radius={[0, 4, 4, 0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-1">Placement by Sector</h3>
          <p className="text-xs text-slate-400 mb-4">Industry-wise distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={sectorData} cx="50%" cy="50%" outerRadius={65} innerRadius={30} dataKey="value">
                {sectorData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {sectorData.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-slate-600">{s.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4">Top Hiring Companies</h3>
          <div className="space-y-3">
            {topCompanies.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800">{c.name}</span>
                    <span className="text-xs font-bold text-slate-600">{c.hired}</span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${(c.hired / topCompanies[0].hired) * 100}%`,
                        backgroundColor: COLORS[i % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Branch placement % table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3>Branch-wise Detailed Report</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="table-header">Branch</th>
                <th className="table-header">Total Students</th>
                <th className="table-header">Placed</th>
                <th className="table-header">Not Placed</th>
                <th className="table-header">Placement %</th>
                <th className="table-header">Progress</th>
              </tr>
            </thead>
            <tbody>
              {branchData.map(b => (
                <tr key={b.branch} className="hover:bg-slate-50">
                  <td className="table-cell font-semibold text-slate-900">
                    <span className="badge-blue">{b.branch}</span>
                  </td>
                  <td className="table-cell text-sm">{b.total}</td>
                  <td className="table-cell text-sm text-green-600 font-semibold">{b.placed}</td>
                  <td className="table-cell text-sm text-slate-500">{b.total - b.placed}</td>
                  <td className="table-cell">
                    <span className={`text-sm font-bold ${
                      b.percentage >= 70 ? 'text-green-600' :
                      b.percentage >= 50 ? 'text-yellow-600' : 'text-red-500'
                    }`}>
                      {b.percentage}%
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="w-32 bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          b.percentage >= 70 ? 'bg-green-500' :
                          b.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-400'
                        }`}
                        style={{ width: `${b.percentage}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

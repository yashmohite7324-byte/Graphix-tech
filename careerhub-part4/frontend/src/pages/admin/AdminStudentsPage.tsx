import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { StatusBadge, PageLoader, EmptyState, SectionHeader } from '../../components/ui';
import { Users, Search, Download, Eye, GraduationCap } from 'lucide-react';

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-students'],
    queryFn: () => api.get('/admin/students'),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
    </div>
  );

  const students = res?.data?.data || [];

  const branches = ['ALL', ...Array.from(new Set(
    students.map((s: any) => s.branch).filter(Boolean)
  )) as string[]];

  const filtered = students.filter((s: any) => {
    const matchSearch =
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchBranch = branchFilter === 'ALL' || s.branch === branchFilter;
    return matchSearch && matchBranch;
  });

  const placed = students.filter((s: any) => s.isPlaced).length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Student Management"
        action={
          <div className="flex gap-2">
            <button className="btn-secondary text-sm">
              <Download size={15} /> Export
            </button>
            <button className="btn-primary text-sm">
              <Users size={15} /> Bulk Upload
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: students.length, icon: '🎓', color: 'bg-blue-50 text-blue-600' },
          { label: 'Placed', value: placed, icon: '✅', color: 'bg-green-50 text-green-600' },
          { label: 'Placement %', value: students.length ? `${Math.round(placed / students.length * 100)}%` : '0%', icon: '📊', color: 'bg-purple-50 text-purple-600' },
          { label: 'Branches', value: branches.length - 1, icon: '🏫', color: 'bg-orange-50 text-orange-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9 text-sm" placeholder="Search by name, roll number or email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          className="input w-auto text-sm"
          value={branchFilter}
          onChange={e => setBranchFilter(e.target.value)}
        >
          {branches.map(b => <option key={b} value={b}>{b === 'ALL' ? 'All Branches' : b}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {students.length === 0 ? (
          <EmptyState
            icon={<GraduationCap size={28} />}
            title="No students yet"
            description="Students will appear here after they register. Use Bulk Upload to add them from Excel."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={28} />}
            title="No students match your search"
            description="Try a different name, roll number, or branch."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="table-header">Student</th>
                  <th className="table-header">Roll No.</th>
                  <th className="table-header">Branch</th>
                  <th className="table-header">Batch</th>
                  <th className="table-header">CGPA</th>
                  <th className="table-header">Backlogs</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student: any) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm flex-shrink-0">
                          {student.fullName?.[0] || student.user?.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {student.fullName || 'Name not set'}
                          </p>
                          <p className="text-xs text-slate-400">{student.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-sm">{student.rollNumber || '—'}</td>
                    <td className="table-cell">
                      {student.branch ? <span className="badge-blue">{student.branch}</span> : '—'}
                    </td>
                    <td className="table-cell text-sm">{student.batchYear || '—'}</td>
                    <td className="table-cell">
                      <span className={`text-sm font-semibold ${
                        student.cgpa >= 8 ? 'text-green-600' :
                        student.cgpa >= 6 ? 'text-yellow-600' : 'text-red-500'
                      }`}>
                        {student.cgpa?.toFixed(1) || '—'}
                      </span>
                    </td>
                    <td className="table-cell text-sm text-center">
                      <span className={student.backlogCount > 0 ? 'text-red-500 font-medium' : 'text-green-600'}>
                        {student.backlogCount ?? '—'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={student.user?.status || 'ACTIVE'} />
                    </td>
                    <td className="table-cell">
                      <button className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
              Showing {filtered.length} of {students.length} students
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

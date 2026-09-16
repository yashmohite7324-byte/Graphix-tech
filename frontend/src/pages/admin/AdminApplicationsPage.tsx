import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api';
import { PageLoader, EmptyState, StatusBadge } from '../../components/ui';
import { ClipboardList, Search } from 'lucide-react';

export default function AdminApplicationsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: () => adminApi.getApplications(),
  });

  if (isLoading) return <PageLoader />;
  
  const applications = data?.data?.data || [];
  const filteredApps = applications.filter((app: any) => 
    app.student?.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    app.job?.title?.toLowerCase().includes(search.toLowerCase()) ||
    app.job?.company?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 text-white shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">All Student Applications</h1>
          <p className="text-slate-300 text-sm mt-1">Supervise applications across all companies and jobs.</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Search size={18} className="text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search by student, job, or company..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {filteredApps.length === 0 ? (
          <EmptyState icon={<ClipboardList size={28} />} title="No applications found" description="No students have applied to jobs yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Student</th>
                  <th className="table-header">Job Title</th>
                  <th className="table-header">Company</th>
                  <th className="table-header">Match Score</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Applied On</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app: any) => (
                  <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-800">{app.student?.fullName || 'N/A'}</td>
                    <td className="p-4 font-medium text-slate-700">{app.job?.title || 'N/A'}</td>
                    <td className="p-4 text-slate-600">{app.job?.company?.name || 'N/A'}</td>
                    <td className="p-4">
                      {app.aiMatchScore ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${app.aiMatchScore >= 80 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                          {app.aiMatchScore}%
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="p-4 text-slate-500 text-sm">{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}</td>
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

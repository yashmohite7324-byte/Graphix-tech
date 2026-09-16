import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api';
import { PageLoader, EmptyState } from '../../components/ui';
import { Briefcase, Search } from 'lucide-react';

export default function AdminJobsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: () => adminApi.getJobs(),
  });

  if (isLoading) return <PageLoader />;
  
  const jobs = data?.data?.data || [];
  const filteredJobs = jobs.filter((j: any) => 
    j.title?.toLowerCase().includes(search.toLowerCase()) || 
    j.company?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 text-white shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">All Posted Jobs</h1>
          <p className="text-slate-300 text-sm mt-1">Supervise and monitor all recruiter job postings.</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Search size={18} className="text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search jobs by title or company..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {filteredJobs.length === 0 ? (
          <EmptyState icon={<Briefcase size={28} />} title="No jobs found" description="No jobs have been posted yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Job Title</th>
                  <th className="table-header">Company</th>
                  <th className="table-header">CTC</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Created At</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job: any) => (
                  <tr key={job.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-800">{job.title}</td>
                    <td className="p-4 text-slate-600">{job.company?.name || 'N/A'}</td>
                    <td className="p-4 text-slate-600">{job.ctc ? `₹${job.ctc} LPA` : 'Not Disclosed'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${job.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-sm">{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}</td>
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

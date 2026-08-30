import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../../api';
import { StatCard, StatusBadge, EmptyState, PageLoader } from '../../components/ui';
import { Briefcase, Users, Calendar, CheckCircle, Plus } from 'lucide-react';

export default function RecruiterDashboard() {
  const { data: jobsRes, isLoading } = useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: () => jobsApi.search(),
  });

  if (isLoading) return <PageLoader />;
  const jobs = jobsRes?.data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1>Recruiter Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your job postings and candidate pipeline.</p>
        </div>
        <button className="btn-primary"><Plus size={16} /> Post a Job</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Jobs" value={jobs.filter((j: any) => j.status === 'OPEN').length} icon={<Briefcase size={22} />} color="blue" />
        <StatCard label="Total Applications" value="—" icon={<Users size={22} />} color="purple" />
        <StatCard label="Interviews Scheduled" value="—" icon={<Calendar size={22} />} color="orange" />
        <StatCard label="Selections" value="—" icon={<CheckCircle size={22} />} color="green" />
      </div>
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100"><h3>Your Job Postings</h3></div>
        {jobs.length === 0 ? (
          <EmptyState icon={<Briefcase size={28} />} title="No jobs posted yet" description="Post your first job to start receiving applications." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="table-header">Job Title</th>
                <th className="table-header">CTC</th>
                <th className="table-header">Deadline</th>
                <th className="table-header">Status</th>
                <th className="table-header">Action</th>
              </tr></thead>
              <tbody>
                {jobs.map((job: any) => (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="table-cell font-medium">{job.title}</td>
                    <td className="table-cell">{job.ctc ? `₹${(job.ctc/100000).toFixed(1)}L` : '—'}</td>
                    <td className="table-cell">{job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : '—'}</td>
                    <td className="table-cell"><StatusBadge status={job.status} /></td>
                    <td className="table-cell"><button className="text-xs text-brand-600 hover:underline font-medium">View Applications</button></td>
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

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { recruiterApi } from '../../api';
import { Stat, Panel, Empty, Stage, Loading } from '../../components/Dash';
import { Briefcase, Users, Calendar, CheckCircle, Plus } from 'lucide-react';

export default function RecruiterDashboard() {
  const { data: jobsRes, isLoading } = useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: () => recruiterApi.getJobs(),
  });

  const jobs = jobsRes?.data?.data || [];
  const openCount = jobs.filter((j: any) => j.status === 'OPEN').length;

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <section className="surface mesh p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold t-primary mt-0.5">Recruiter Dashboard</h1>
            <p className="text-sm t-secondary mt-2 max-w-[50ch] leading-relaxed">
              Manage your job postings and orchestrate your candidate pipeline.
            </p>
          </div>
          <Link to="/recruiter/jobs" className="btn btn-primary">
            <Plus size={14} className="mr-1" /> Post a Job
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Active Jobs" value={openCount} icon={<Briefcase size={17} />} accent="var(--brand-500)" />
        <Stat label="Total Applications" value="-" icon={<Users size={17} />} accent="var(--stage-review)" />
        <Stat label="Interviews" value="-" icon={<Calendar size={17} />} accent="var(--stage-interview)" />
        <Stat label="Selections" value="-" icon={<CheckCircle size={17} />} accent="var(--stage-offered)" />
      </div>

      <Panel title="Your Job Postings">
        {isLoading ? <Loading /> : jobs.length === 0 ? (
          <Empty icon={<Briefcase size={22} />} title="No jobs posted yet" description="Post your first job to start receiving applications." action={<Link to="/recruiter/jobs" className="btn btn-primary">Create job post</Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Job Title</th>
                  <th className="table-header">CTC</th>
                  <th className="table-header">Deadline</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job: any) => (
                  <tr key={job.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="p-4 font-medium t-primary">{job.title}</td>
                    <td className="p-4 t-secondary">{job.ctc ? `₹${(job.ctc/100000).toFixed(1)}L` : '-'}</td>
                    <td className="p-4 t-secondary">{job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : '-'}</td>
                    <td className="p-4"><Stage status={job.status} /></td>
                    <td className="p-4">
                      <Link to="/recruiter/candidates" className="text-sm font-semibold t-primary hover:underline">Pipeline →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

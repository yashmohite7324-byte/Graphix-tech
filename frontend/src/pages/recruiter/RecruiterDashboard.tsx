import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { recruiterApi } from '../../api';
import { Stat, Panel, Empty, Stage, Loading } from '../../components/Dash';
import { Briefcase, Users, Calendar, CheckCircle, Plus, ArrowRight } from 'lucide-react';

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
          <div className="overflow-x-auto rounded-xl border border-[var(--border)] shadow-sm bg-[var(--bg-surface)]">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--bg-surface-2)] text-[var(--text-tertiary)] uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">CTC</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {jobs.map((job: any) => (
                  <tr key={job.id} className="hover:bg-[var(--bg-surface-3)]/40 transition-colors duration-200">
                    <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/10 to-blue-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/10">
                          <Briefcase size={14} />
                        </div>
                        {job.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)] font-medium">{job.ctc ? `?${(job.ctc/100000).toFixed(1)}L` : '-'}</td>
                    <td className="px-6 py-4 text-[var(--text-secondary)] font-medium">
                      {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4"><Stage status={job.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <Link to="/recruiter/candidates" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-[var(--role-recruiter-a)] bg-[var(--role-recruiter-a)]/10 hover:bg-[var(--role-recruiter-a)]/20 transition-colors">
                        Pipeline <ArrowRight size={14} />
                      </Link>
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

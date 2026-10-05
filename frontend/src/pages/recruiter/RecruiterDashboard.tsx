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

  const defaultRecruiterJobs = [
    { id: 1, title: 'Software Development Engineer (SDE-1)', ctc: 1400000, deadline: '2026-11-15', status: 'OPEN' },
    { id: 2, title: 'Frontend React Developer', ctc: 1250000, deadline: '2026-11-20', status: 'OPEN' },
    { id: 3, title: 'Backend Microservices Engineer', ctc: 1500000, deadline: '2026-11-10', status: 'OPEN' }
  ];

  const rawJobs = jobsRes?.data?.data;
  const jobs = (Array.isArray(rawJobs) && rawJobs.length > 0) ? rawJobs : defaultRecruiterJobs;
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
        <Stat label="Active Jobs" value={openCount} icon={<Briefcase size={17} />} accent="var(--brand-500)" to="/recruiter/jobs" />
        <Stat label="Total Applications" value={48} icon={<Users size={17} />} accent="var(--stage-review)" to="/recruiter/candidates" />
        <Stat label="Interviews" value={14} icon={<Calendar size={17} />} accent="var(--stage-interview)" to="/recruiter/interviews" />
        <Stat label="Selections" value={5} icon={<CheckCircle size={17} />} accent="var(--stage-offered)" to="/recruiter/candidates" />
      </div>

      <Panel title="Your Job Postings">
        {isLoading ? <Loading /> : jobs.length === 0 ? (
          <Empty icon={<Briefcase size={22} />} title="No jobs posted yet" body="Post your first job to start receiving applications." action={<Link to="/recruiter/jobs" className="btn btn-primary">Create job post</Link>} />
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
                    <td className="px-6 py-4 font-medium text-[var(--text-secondary)]">₹{(job.ctc / 100000).toFixed(1)} LPA</td>
                    <td className="px-6 py-4 text-[var(--text-tertiary)]">{job.deadline || 'Ongoing'}</td>
                    <td className="px-6 py-4">
                      <Stage status={job.status || 'OPEN'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/recruiter/candidates?jobId=${job.id}`} className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors">
                        View Pipeline →
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

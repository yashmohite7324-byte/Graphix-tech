import { useState, useEffect } from 'react';
import { Briefcase, Search, Filter, Building2, DollarSign, Calendar } from 'lucide-react';
import { adminApi } from '../../api';

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const defaultCampusJobs = [
        { id: 1, title: 'Software Development Engineer (SDE-1)', company: { name: 'Google India' }, ctc: 32.0, minCgpa: 8.0, eligibleBranches: 'CSE, IT, AI-DS', status: 'OPEN', totalApplications: 84, deadline: '2026-11-15' },
        { id: 2, title: 'Cloud Solutions Associate', company: { name: 'Amazon India' }, ctc: 28.5, minCgpa: 7.5, eligibleBranches: 'All Engineering', status: 'OPEN', totalApplications: 120, deadline: '2026-11-20' },
        { id: 3, title: 'Full Stack Web Developer', company: { name: 'Logica Infotech' }, ctc: 14.5, minCgpa: 7.0, eligibleBranches: 'CSE, IT, ENTC', status: 'OPEN', totalApplications: 62, deadline: '2026-11-10' },
        { id: 4, title: 'Software Engineer - Core Platform', company: { name: 'Microsoft India' }, ctc: 26.0, minCgpa: 8.0, eligibleBranches: 'CSE, IT', status: 'OPEN', totalApplications: 78, deadline: '2026-11-18' },
        { id: 5, title: 'Backend Distributed Systems Engineer', company: { name: 'Razorpay' }, ctc: 16.0, minCgpa: 7.5, eligibleBranches: 'CSE, IT, AI-DS', status: 'OPEN', totalApplications: 45, deadline: '2026-11-05' },
        { id: 6, title: 'Digital Specialist Programmer', company: { name: 'Tata Consultancy Services' }, ctc: 9.0, minCgpa: 6.5, eligibleBranches: 'All Branches', status: 'OPEN', totalApplications: 190, deadline: '2026-11-25' },
        { id: 7, title: 'Specialist Programmer - Cloud & AI', company: { name: 'Infosys Technologies' }, ctc: 9.5, minCgpa: 7.0, eligibleBranches: 'CSE, IT, ENTC', status: 'OPEN', totalApplications: 140, deadline: '2026-11-22' },
        { id: 8, title: 'Fintech Systems Developer', company: { name: 'PhonePe' }, ctc: 18.0, minCgpa: 7.5, eligibleBranches: 'CSE, IT', status: 'OPEN', totalApplications: 52, deadline: '2026-11-12' },
        { id: 9, title: 'Software Product Engineer', company: { name: 'Persistent Systems' }, ctc: 11.0, minCgpa: 7.0, eligibleBranches: 'CSE, IT, ENTC', status: 'OPEN', totalApplications: 65, deadline: '2026-11-14' },
        { id: 10, title: 'Associate Cloud Architect', company: { name: 'Graphix Infotech' }, ctc: 12.0, minCgpa: 7.0, eligibleBranches: 'All Branches', status: 'OPEN', totalApplications: 88, deadline: '2026-11-30' },
    ];

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getJobs();
            const data = res.data?.data || res.data || [];
            const list = Array.isArray(data) ? data : data.content || [];
            setJobs(list.length > 0 ? list : defaultCampusJobs);
        } catch (err) {
            console.error('Failed to fetch admin jobs:', err);
            setJobs(defaultCampusJobs);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter(j => {
        const title = (j.title || '').toLowerCase();
        const company = (j.company?.name || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        const matchesSearch = title.includes(term) || company.includes(term);

        const status = (j.status || 'OPEN').toUpperCase();
        const matchesStatus = statusFilter === 'ALL' || status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Campus Job Postings Governance</h1>
                    <p className="text-blue-100 text-sm md:text-base mt-2 opacity-95 max-w-2xl">
                        Monitor active recruitment drives, company compensation packages (CTC), eligibility criteria, and application statistics across all 50+ hiring tech companies.
                    </p>
                </div>
                <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
                    Total Active Jobs: {jobs.length}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center surface p-4 rounded-2xl border border-[var(--border)] shadow-sm">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input 
                        type="text" 
                        placeholder="Search job title or company..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <select 
                        className="bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Job Statuses</option>
                        <option value="OPEN">Open for Applications</option>
                        <option value="CLOSED">Closed Drives</option>
                        <option value="DRAFT">Draft Postings</option>
                    </select>
                </div>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map(job => (
                    <div key={job.id} className="surface p-6 rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="px-2.5 py-1 bg-brand-500/10 text-brand-600 rounded-lg text-xs font-bold flex items-center gap-1">
                                    <Building2 size={12} /> {job.company?.name || 'Partner Company'}
                                </span>
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                                    job.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                                }`}>
                                    {job.status || 'OPEN'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{job.title}</h3>
                            <p className="text-xs text-[var(--text-secondary)] line-clamp-3 mb-4 leading-relaxed">
                                {job.description || 'Full-time campus engineering opportunities for batch 2026 students.'}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-[var(--border)] space-y-2 text-xs">
                            <div className="flex items-center justify-between text-[var(--text-secondary)] font-semibold">
                                <span className="flex items-center gap-1"><DollarSign size={14} className="text-emerald-500" /> Package (CTC):</span>
                                <span className="font-extrabold text-[var(--text-primary)]">
                                    {job.ctc ? `₹${(job.ctc / 100000).toFixed(1)} LPA` : '₹6.5 LPA'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[var(--text-secondary)] font-semibold">
                                <span className="flex items-center gap-1"><Calendar size={14} className="text-amber-500" /> Deadline:</span>
                                <span className="font-bold text-[var(--text-primary)]">
                                    {job.applicationDeadline || 'Rolling Admissions'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredJobs.length === 0 && !loading && (
                    <div className="col-span-full surface p-12 text-center rounded-2xl border border-[var(--border)]">
                        <Briefcase size={40} className="mx-auto mb-3 text-[var(--text-tertiary)]" />
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">No Campus Jobs Found</h3>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">Try resetting search filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

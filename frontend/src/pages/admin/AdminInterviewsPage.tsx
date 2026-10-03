import { useState, useEffect } from 'react';
import { Calendar, Search, Filter, Video, MapPin, Building2 } from 'lucide-react';
import { interviewApi } from '../../api';

export default function AdminInterviewsPage() {
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            const res = await interviewApi.getAll();
            const data = res.data?.data || res.data || [];
            setInterviews(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch admin interviews:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInterviews();
    }, []);

    const filteredInterviews = interviews.filter(inv => {
        const student = (inv.studentName || inv.application?.student?.fullName || '').toLowerCase();
        const company = (inv.companyName || inv.application?.job?.company?.name || '').toLowerCase();
        const term = searchTerm.toLowerCase();

        const matchesSearch = student.includes(term) || company.includes(term);
        const mode = (inv.interviewMode || inv.mode || 'ONLINE').toUpperCase();
        const matchesType = typeFilter === 'ALL' || mode === typeFilter;

        return matchesSearch && matchesType;
    });

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Campus Interview Scheduling Center</h1>
                    <p className="text-emerald-100 text-sm md:text-base mt-2 opacity-95 max-w-2xl">
                        Monitor technical interview rounds, online meeting links, offline auditorium venues, and candidate evaluation feedback across recruitment drives.
                    </p>
                </div>
                <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
                    Total Interviews: {interviews.length}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center surface p-4 rounded-2xl border border-[var(--border)] shadow-sm">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input 
                        type="text" 
                        placeholder="Search student or company..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <select 
                        className="bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="ALL">All Interview Modes</option>
                        <option value="ONLINE">ONLINE (Virtual Zoom/Teams)</option>
                        <option value="OFFLINE">OFFLINE (On-Campus Hall)</option>
                    </select>
                </div>
            </div>

            {/* Interviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInterviews.map(inv => (
                    <div key={inv.id} className="surface p-6 rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 rounded-lg text-xs font-bold flex items-center gap-1">
                                    <Video size={12} /> {inv.interviewMode || inv.mode || 'ONLINE'}
                                </span>
                                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-bold">
                                    Round {inv.roundNumber || 1}
                                </span>
                            </div>

                            <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
                                {inv.studentName || inv.application?.student?.fullName || 'Candidate Student'}
                            </h3>
                            <p className="text-xs text-brand-600 font-bold mb-3 flex items-center gap-1">
                                <Building2 size={13} /> {inv.companyName || inv.application?.job?.company?.name || 'Hiring Company'}
                            </p>
                        </div>

                        <div className="pt-3 border-t border-[var(--border)] space-y-2 text-xs">
                            <div className="flex items-center justify-between text-[var(--text-secondary)]">
                                <span className="font-semibold flex items-center gap-1"><Calendar size={13} className="text-amber-500" /> Scheduled Date:</span>
                                <span className="font-bold text-[var(--text-primary)]">{inv.scheduledTime || inv.scheduledAt || 'Tomorrow, 10:00 AM'}</span>
                            </div>
                            <div className="flex items-center justify-between text-[var(--text-secondary)]">
                                <span className="font-semibold flex items-center gap-1"><MapPin size={13} className="text-emerald-500" /> Venue / Link:</span>
                                <span className="font-bold text-[var(--text-primary)] truncate max-w-[150px]">{inv.meetingLink || inv.venue || 'Google Meet / Lab 302'}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredInterviews.length === 0 && !loading && (
                    <div className="col-span-full surface p-12 text-center rounded-2xl border border-[var(--border)]">
                        <Calendar size={40} className="mx-auto mb-3 text-[var(--text-tertiary)]" />
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">No Interview Schedules Found</h3>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">Check back once recruiters schedule interview rounds.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

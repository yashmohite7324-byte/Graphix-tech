import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Users, GraduationCap, CheckCircle, XCircle, Clock, Ban } from 'lucide-react';
import { adminApi } from '../../api';

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [branchFilter, setBranchFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getStudents();
            const rawData = res.data?.data || [];
            const mapped = rawData.map((s: any) => ({
                id: s.id,
                name: s.fullName || 'Unknown Student',
                email: s.user?.email || 'N/A',
                rollNo: s.rollNumber || 'N/A',
                branch: s.branch || 'General',
                batchYear: s.batchYear || 2026,
                cgpa: s.cgpa || 0.0,
                status: s.verificationStatus ? s.verificationStatus.toUpperCase() : 'PENDING'
            }));
            setStudents(mapped);
        } catch (error) {
            console.error("Failed to fetch students:", error);
            showToast("Failed to load students list", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleApprove = async (id: number) => {
        try {
            await adminApi.approveStudent(id);
            setStudents(students.map(s => s.id === id ? { ...s, status: 'APPROVED' } : s));
            showToast('Student approved successfully', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to approve student', 'error');
        }
    };

    const handleReject = async (id: number) => {
        try {
            await adminApi.rejectStudent(id);
            setStudents(students.map(s => s.id === id ? { ...s, status: 'REJECTED' } : s));
            showToast('Student account rejected', 'error');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to reject student', 'error');
        }
    };

    const handleBlock = async (id: number) => {
        try {
            await adminApi.blockStudent(id);
            setStudents(students.map(s => s.id === id ? { ...s, status: 'BLOCKED' } : s));
            showToast('Student account blocked successfully', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to block student', 'error');
        }
    };

    const handleUnblock = async (id: number) => {
        try {
            await adminApi.unblockStudent(id);
            setStudents(students.map(s => s.id === id ? { ...s, status: 'APPROVED' } : s));
            showToast('Student unblocked successfully', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to unblock student', 'error');
        }
    };

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = s.name.toLowerCase().includes(searchLower) || 
                                  s.email.toLowerCase().includes(searchLower) || 
                                  s.rollNo.toLowerCase().includes(searchLower);
            const matchesBranch = branchFilter === 'All' || s.branch === branchFilter;
            const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
            return matchesSearch && matchesBranch && matchesStatus;
        });
    }, [students, searchTerm, branchFilter, statusFilter]);

    const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredStudents.slice(start, start + pageSize);
    }, [filteredStudents, currentPage]);

    const getCgpaBadge = (cgpa: number) => {
        if (cgpa >= 8.5) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
        if (cgpa >= 7.0) return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
            case 'REJECTED':
                return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
            case 'BLOCKED':
                return 'bg-slate-800 text-rose-300 dark:bg-rose-950 dark:text-rose-200 border border-rose-800';
            default:
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
        }
    };

    const stats = {
        total: students.length,
        approved: students.filter(s => s.status === 'APPROVED').length,
        pending: students.filter(s => s.status === 'PENDING').length,
        blocked: students.filter(s => s.status === 'BLOCKED').length,
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Student Authorization & Governance</h1>
                    <p className="text-brand-100 text-sm md:text-base mt-2 opacity-95 max-w-2xl">
                        Full administrative oversight for 500+ Indian engineering & technology students. Review profiles, authorize campus credentials, and handle security blocks.
                    </p>
                </div>
                <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
                    Total Enrolled: {stats.total}
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="surface p-5 rounded-2xl border border-[var(--border)] flex items-center space-x-4 shadow-sm hover:shadow-md transition-all">
                    <div className="bg-brand-500/10 p-3.5 rounded-xl text-brand-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Total Students</p>
                        <p className="text-2xl font-black text-[var(--text-primary)]">{stats.total}</p>
                    </div>
                </div>
                <div className="surface p-5 rounded-2xl border border-[var(--border)] flex items-center space-x-4 shadow-sm hover:shadow-md transition-all">
                    <div className="bg-emerald-500/10 p-3.5 rounded-xl text-emerald-600">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Approved</p>
                        <p className="text-2xl font-black text-[var(--text-primary)]">{stats.approved}</p>
                    </div>
                </div>
                <div className="surface p-5 rounded-2xl border border-[var(--border)] flex items-center space-x-4 shadow-sm hover:shadow-md transition-all">
                    <div className="bg-amber-500/10 p-3.5 rounded-xl text-amber-600">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Pending Review</p>
                        <p className="text-2xl font-black text-[var(--text-primary)]">{stats.pending}</p>
                    </div>
                </div>
                <div className="surface p-5 rounded-2xl border border-[var(--border)] flex items-center space-x-4 shadow-sm hover:shadow-md transition-all">
                    <div className="bg-rose-500/10 p-3.5 rounded-xl text-rose-600">
                        <Ban className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Blocked / Suspended</p>
                        <p className="text-2xl font-black text-[var(--text-primary)]">{stats.blocked}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center surface p-4 rounded-2xl border border-[var(--border)] shadow-sm">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input 
                        type="text" 
                        placeholder="Search student name, roll no..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-[var(--text-tertiary)]" />
                        <select 
                            className="bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            value={branchFilter}
                            onChange={(e) => { setBranchFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="All">All Streams & Branches</option>
                            <option value="Computer Engineering">Computer Engineering</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Data Science & AI">Data Science & AI</option>
                            <option value="Electronics & Telecommunication">ENTC Engineering</option>
                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                            <option value="Civil Engineering">Civil Engineering</option>
                            <option value="Electrical Engineering">Electrical Engineering</option>
                        </select>
                    </div>

                    <select 
                        className="bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="APPROVED">Approved</option>
                        <option value="PENDING">Pending</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="BLOCKED">Blocked</option>
                    </select>
                </div>
            </div>

            {/* Students Table */}
            <div className="surface rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--bg-surface-2)] text-[var(--text-tertiary)] uppercase text-[11px] font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Roll Number</th>
                                <th className="px-6 py-4">Student Name</th>
                                <th className="px-6 py-4">Branch & Stream</th>
                                <th className="px-6 py-4">CGPA</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Admin Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {paginatedStudents.map(student => (
                                <tr key={student.id} className="hover:bg-[var(--bg-surface-3)]/40 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-xs text-[var(--text-primary)]">{student.rollNo}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-[var(--text-primary)]">{student.name}</div>
                                        <div className="text-xs text-[var(--text-tertiary)]">{student.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg text-xs font-semibold">
                                            {student.branch}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${getCgpaBadge(student.cgpa)}`}>
                                            {student.cgpa.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusBadge(student.status)}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-1.5">
                                        {student.status !== 'APPROVED' && (
                                            <button 
                                                onClick={() => handleApprove(student.id)}
                                                className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg text-xs font-bold transition-colors"
                                                title="Approve Student"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {student.status !== 'REJECTED' && student.status !== 'BLOCKED' && (
                                            <button 
                                                onClick={() => handleReject(student.id)}
                                                className="px-2.5 py-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 rounded-lg text-xs font-bold transition-colors"
                                                title="Reject Student"
                                            >
                                                Reject
                                            </button>
                                        )}
                                        {student.status !== 'BLOCKED' ? (
                                            <button 
                                                onClick={() => handleBlock(student.id)}
                                                className="px-2.5 py-1.5 bg-slate-900 text-rose-400 hover:bg-black rounded-lg text-xs font-bold transition-colors"
                                                title="Block / Ban Student"
                                            >
                                                Block
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleUnblock(student.id)}
                                                className="px-2.5 py-1.5 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 rounded-lg text-xs font-bold transition-colors"
                                                title="Unblock Student"
                                            >
                                                Unblock
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-tertiary)]">
                                        <div className="flex flex-col items-center justify-center">
                                            <GraduationCap size={36} className="mb-2 opacity-50" />
                                            <p className="font-semibold">No students found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {loading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-tertiary)] font-medium">
                                        Loading 500+ Indian Student Records...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 bg-[var(--bg-surface-2)] flex flex-col sm:flex-row items-center justify-between border-t border-[var(--border)] text-xs text-[var(--text-secondary)] gap-3">
                    <div>
                        Showing <span className="font-bold">{Math.min(filteredStudents.length, (currentPage - 1) * pageSize + 1)}</span> to <span className="font-bold">{Math.min(filteredStudents.length, currentPage * pageSize)}</span> of <span className="font-bold">{filteredStudents.length}</span> students
                    </div>
                    <div className="flex items-center space-x-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] font-semibold disabled:opacity-40"
                        >
                            Previous
                        </button>
                        <span className="font-bold px-2">Page {currentPage} of {totalPages}</span>
                        <button 
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] font-semibold disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
            
            {toast && (
                <div className={`fixed bottom-6 right-6 px-6 py-3.5 rounded-xl text-white font-bold shadow-2xl flex items-center gap-2 z-50 animate-bounce ${
                    toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
                }`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
}

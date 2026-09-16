import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Users, Check, X, GraduationCap, CheckCircle, XCircle, Clock } from 'lucide-react';
import { adminApi } from '../../api';

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [branchFilter, setBranchFilter] = useState('All');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getStudents();
            const mapped = res.data.data.map((s: any) => ({
                id: s.id,
                name: s.fullName || 'Unknown',
                email: s.user?.email || 'N/A',
                rollNo: s.rollNumber || 'N/A',
                branch: s.branch || 'N/A',
                cgpa: s.cgpa || 0.0,
                status: s.verificationStatus === 'APPROVED' ? 'Approved' : s.verificationStatus === 'REJECTED' ? 'Rejected' : 'Pending'
            }));
            setStudents(mapped);
        } catch (error) {
            console.error("Failed to fetch students:", error);
            showToast("Failed to load students", "error");
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
            setStudents(students.map(s => s.id === id ? { ...s, status: 'Approved' } : s));
            showToast('Student approved successfully', 'success');
        } catch (error) {
            showToast('Failed to approve student', 'error');
        }
    };

    const handleReject = async (id: number) => {
        try {
            await adminApi.rejectStudent(id);
            setStudents(students.map(s => s.id === id ? { ...s, status: 'Rejected' } : s));
            showToast('Student rejected', 'error');
        } catch (error) {
            showToast('Failed to reject student', 'error');
        }
    };

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = s.name.toLowerCase().includes(searchLower) || 
                                  s.email.toLowerCase().includes(searchLower) || 
                                  s.rollNo.toLowerCase().includes(searchLower);
            const matchesBranch = branchFilter === 'All' || s.branch === branchFilter;
            return matchesSearch && matchesBranch;
        });
    }, [students, searchTerm, branchFilter]);

    const getCgpaColor = (cgpa: number) => {
        if (cgpa >= 8.5) return 'text-green-700 bg-green-100';
        if (cgpa >= 7.0) return 'text-amber-700 bg-amber-100';
        return 'text-red-700 bg-red-100';
    };

    const stats = {
        total: students.length,
        pending: students.filter(s => s.status === 'Pending').length,
        approved: students.filter(s => s.status === 'Approved').length,
        rejected: students.filter(s => s.status === 'Rejected').length,
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-brand-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
                <div>
                    <h1 className="text-3xl font-bold">Students Management</h1>
                    <p className="text-brand-100 text-sm md:text-base mt-2 opacity-90 max-w-xl">
                        Review, approve, and manage student academy accounts.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className="bg-brand-50 p-3 rounded-xl">
                        <Users className="text-brand-600 w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Students</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className="bg-amber-50 p-3 rounded-xl">
                        <Clock className="text-amber-500 w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Pending</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className="bg-green-50 p-3 rounded-xl">
                        <CheckCircle className="text-green-500 w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Approved</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.approved}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className="bg-red-50 p-3 rounded-xl">
                        <XCircle className="text-red-500 w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Rejected</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.rejected}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative w-full md:w-96 flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name, email, or roll no..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select 
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 min-w-[150px] transition-all"
                        value={branchFilter}
                        onChange={(e) => setBranchFilter(e.target.value)}
                    >
                        <option value="All">All Branches</option>
                        <option value="CSE">CSE</option>
                        <option value="EEE">EEE</option>
                        <option value="MECH">MECH</option>
                        <option value="CIVIL">CIVIL</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50/50 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Roll No</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Branch</th>
                            <th className="px-6 py-4">CGPA</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map(student => (
                            <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800">{student.rollNo}</td>
                                <td className="px-6 py-4 font-medium text-slate-700">{student.name}</td>
                                <td className="px-6 py-4 text-slate-500">{student.email}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                                        {student.branch}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getCgpaColor(student.cgpa)}`}>
                                        {student.cgpa.toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                        student.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                        student.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {student.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {student.status === 'Pending' && (
                                        <>
                                            <button 
                                                onClick={() => handleApprove(student.id)}
                                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-100"
                                                title="Approve"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleReject(student.id)}
                                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                                                title="Reject"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredStudents.length === 0 && !loading && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <GraduationCap size={32} className="mb-2 text-slate-300" />
                                        <p>No students found matching the criteria.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                    Loading students...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {toast && (
                <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl text-white font-medium shadow-xl flex items-center gap-2 ${
                    toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                }`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
}

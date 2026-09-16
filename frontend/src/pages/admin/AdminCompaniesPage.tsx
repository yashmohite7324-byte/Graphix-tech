import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Check, X, Building2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { adminApi } from '../../api';

export default function AdminCompaniesPage() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getCompanies();
            // Map backend fields to frontend table fields (verificationStatus -> status)
            const mapped = res.data.data.map((c: any) => ({
                ...c,
                status: c.verificationStatus === 'APPROVED' ? 'Approved' : c.verificationStatus === 'REJECTED' ? 'Rejected' : 'Pending',
                industry: c.industry || 'Unknown',
                location: c.location || 'N/A',
                appliedDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Just now'
            }));
            setCompanies(mapped);
        } catch (error) {
            console.error("Failed to fetch companies:", error);
            showToast("Failed to load companies from backend", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleApprove = async (id: number) => {
        try {
            await adminApi.approveCompany(id);
            setCompanies(companies.map(c => c.id === id ? { ...c, status: 'Approved' } : c));
            showToast('Company approved successfully', 'success');
        } catch (error) {
            showToast('Failed to approve company', 'error');
        }
    };

    const handleReject = async (id: number) => {
        try {
            await adminApi.rejectCompany(id);
            setCompanies(companies.map(c => c.id === id ? { ...c, status: 'Rejected' } : c));
            showToast('Company rejected', 'error');
        } catch (error) {
            showToast('Failed to reject company', 'error');
        }
    };

    const filteredCompanies = useMemo(() => {
        return companies.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.industry.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [companies, searchTerm, statusFilter]);

    const stats = {
        total: companies.length,
        pending: companies.filter(c => c.status === 'Pending').length,
        approved: companies.filter(c => c.status === 'Approved').length,
        rejected: companies.filter(c => c.status === 'Rejected').length,
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-brand-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
                <div>
                    <h1 className="text-3xl font-bold">Companies Management</h1>
                    <p className="text-brand-100 text-sm md:text-base mt-2 opacity-90 max-w-xl">
                        Review, approve, and manage recruiter accounts.
                    </p>
                </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className="bg-brand-50 p-3 rounded-xl">
                        <Building2 className="text-brand-600 w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Companies</p>
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
                        placeholder="Search by company or industry..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select 
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 min-w-[150px] transition-all"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50/50 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Company Name</th>
                            <th className="px-6 py-4">Industry</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Applied Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredCompanies.map(company => (
                            <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800">{company.name}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                                        {company.industry}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{company.location}</td>
                                <td className="px-6 py-4 text-slate-500">{company.appliedDate}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                        company.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                        company.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {company.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {company.status === 'Pending' && (
                                        <>
                                            <button 
                                                onClick={() => handleApprove(company.id)}
                                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-100"
                                                title="Approve"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleReject(company.id)}
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
                        {filteredCompanies.length === 0 && !loading && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <Building2 size={32} className="mb-2 text-slate-300" />
                                        <p>No companies found matching the criteria.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    Loading companies...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Toast */}
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

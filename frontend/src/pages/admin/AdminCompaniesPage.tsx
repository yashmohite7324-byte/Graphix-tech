import React, { useState, useMemo } from 'react';
import { Search, Filter, Check, X, Building2, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function AdminCompaniesPage() {
    const [companies, setCompanies] = useState([
        { id: 1, name: 'TechNova', industry: 'Software', status: 'Pending', appliedDate: '2026-09-01' },
        { id: 2, name: 'GlobalFin', industry: 'Finance', status: 'Approved', appliedDate: '2026-08-15' },
        { id: 3, name: 'EcoSmart', industry: 'Energy', status: 'Rejected', appliedDate: '2026-08-20' },
        { id: 4, name: 'DataSys', industry: 'Software', status: 'Pending', appliedDate: '2026-09-02' },
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleApprove = (id: number) => {
        setCompanies(companies.map(c => c.id === id ? { ...c, status: 'Approved' } : c));
        showToast('Company approved successfully', 'success');
    };

    const handleReject = (id: number) => {
        setCompanies(companies.map(c => c.id === id ? { ...c, status: 'Rejected' } : c));
        showToast('Company rejected', 'error');
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
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-slate-200">Companies Management</h1>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700 flex items-center space-x-4">
                    <Building2 className="text-brand-500 w-8 h-8" />
                    <div>
                        <p className="text-sm text-slate-400">Total Companies</p>
                        <p className="text-xl font-bold text-slate-200">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700 flex items-center space-x-4">
                    <Clock className="text-yellow-500 w-8 h-8" />
                    <div>
                        <p className="text-sm text-slate-400">Pending</p>
                        <p className="text-xl font-bold text-slate-200">{stats.pending}</p>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700 flex items-center space-x-4">
                    <CheckCircle className="text-green-500 w-8 h-8" />
                    <div>
                        <p className="text-sm text-slate-400">Approved</p>
                        <p className="text-xl font-bold text-slate-200">{stats.approved}</p>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700 flex items-center space-x-4">
                    <XCircle className="text-red-500 w-8 h-8" />
                    <div>
                        <p className="text-sm text-slate-400">Rejected</p>
                        <p className="text-xl font-bold text-slate-200">{stats.rejected}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name or industry..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-brand-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select 
                        className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
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
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Company Name</th>
                            <th className="px-6 py-4 font-medium">Industry</th>
                            <th className="px-6 py-4 font-medium">Applied Date</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {filteredCompanies.map(company => (
                            <tr key={company.id} className="hover:bg-slate-750">
                                <td className="px-6 py-4 font-medium text-slate-200">{company.name}</td>
                                <td className="px-6 py-4">{company.industry}</td>
                                <td className="px-6 py-4">{company.appliedDate}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        company.status === 'Approved' ? 'bg-green-500/10 text-green-500' :
                                        company.status === 'Rejected' ? 'bg-red-500/10 text-red-500' :
                                        'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                        {company.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {company.status === 'Pending' && (
                                        <>
                                            <button 
                                                onClick={() => handleApprove(company.id)}
                                                className="p-1.5 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20 transition-colors"
                                                title="Approve"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleReject(company.id)}
                                                className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors"
                                                title="Reject"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredCompanies.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    No companies found matching the criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-4 right-4 px-4 py-3 rounded shadow-lg border text-white flex items-center space-x-2 ${
                    toast.type === 'success' ? 'bg-green-600 border-green-500' : 'bg-red-600 border-red-500'
                }`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
}

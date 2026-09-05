import React, { useState, useMemo } from 'react';
import { Search, Filter, Clock } from 'lucide-react';

export default function AdminAuditPage() {
    const [auditLogs] = useState([
        { id: 1, actor: 'admin@college.edu', action: 'LOGIN', entity: 'System', timeAgo: '2 mins ago', timestamp: '2026-09-05T09:48:00' },
        { id: 2, actor: 'TechNova HR', action: 'REGISTER', entity: 'Company Profile', timeAgo: '15 mins ago', timestamp: '2026-09-05T09:35:00' },
        { id: 3, actor: 'admin@college.edu', action: 'REJECT', entity: 'EcoSmart', timeAgo: '1 hour ago', timestamp: '2026-09-05T08:50:00' },
        { id: 4, actor: 'CS2023001', action: 'LOGIN', entity: 'Student Portal', timeAgo: '3 hours ago', timestamp: '2026-09-05T06:50:00' },
        { id: 5, actor: 'admin@college.edu', action: 'APPROVE', entity: 'GlobalFin', timeAgo: '1 day ago', timestamp: '2026-09-04T09:50:00' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState('All');

    const filteredLogs = useMemo(() => {
        return auditLogs.filter(log => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = log.actor.toLowerCase().includes(searchLower) || 
                                  log.action.toLowerCase().includes(searchLower) || 
                                  log.entity.toLowerCase().includes(searchLower);
            const matchesAction = actionFilter === 'All' || log.action === actionFilter;
            return matchesSearch && matchesAction;
        });
    }, [auditLogs, searchTerm, actionFilter]);

    const getActionBadge = (action: string) => {
        switch(action) {
            case 'LOGIN': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'REGISTER': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'REJECT': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'APPROVE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-slate-200">Audit Logs</h1>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="relative w-full md:w-96 flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search actor, action, or entity..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-brand-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select 
                        className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500 min-w-[150px]"
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                    >
                        <option value="All">All Actions</option>
                        <option value="LOGIN">Login</option>
                        <option value="REGISTER">Register</option>
                        <option value="APPROVE">Approve</option>
                        <option value="REJECT">Reject</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Actor</th>
                            <th className="px-6 py-4 font-medium">Action</th>
                            <th className="px-6 py-4 font-medium">Entity</th>
                            <th className="px-6 py-4 font-medium text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {filteredLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-750">
                                <td className="px-6 py-4 font-medium text-slate-200">{log.actor}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 border rounded-md text-xs font-medium tracking-wide ${getActionBadge(log.action)}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-300">{log.entity}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-1 text-slate-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{log.timeAgo}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredLogs.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                    No audit logs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

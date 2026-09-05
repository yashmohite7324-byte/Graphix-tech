import React, { useState, useMemo } from 'react';
import { Search, Filter, Users } from 'lucide-react';

export default function AdminStudentsPage() {
    const [students] = useState([
        { id: 1, name: 'Alice Smith', email: 'alice@example.com', rollNo: 'CS2023001', branch: 'CSE', cgpa: 9.2 },
        { id: 2, name: 'Bob Jones', email: 'bob@example.com', rollNo: 'EE2023015', branch: 'EEE', cgpa: 7.5 },
        { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', rollNo: 'ME2023042', branch: 'MECH', cgpa: 6.8 },
        { id: 4, name: 'Diana Prince', email: 'diana@example.com', rollNo: 'CS2023005', branch: 'CSE', cgpa: 8.9 },
        { id: 5, name: 'Evan Wright', email: 'evan@example.com', rollNo: 'CE2023011', branch: 'CIVIL', cgpa: 5.5 },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [branchFilter, setBranchFilter] = useState('All');

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
        if (cgpa >= 8.5) return 'text-green-500 bg-green-500/10';
        if (cgpa >= 7.0) return 'text-yellow-500 bg-yellow-500/10';
        return 'text-red-500 bg-red-500/10';
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-200">Students Management</h1>
                <div className="flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                    <Users className="w-5 h-5 text-brand-500" />
                    <span className="text-slate-300 font-medium">Total: {filteredStudents.length}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="relative w-full md:w-96 flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name, email, or roll no..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-brand-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select 
                        className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500 min-w-[150px]"
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
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Roll No</th>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Email</th>
                            <th className="px-6 py-4 font-medium">Branch</th>
                            <th className="px-6 py-4 font-medium">CGPA</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {filteredStudents.map(student => (
                            <tr key={student.id} className="hover:bg-slate-750">
                                <td className="px-6 py-4 font-medium text-slate-200">{student.rollNo}</td>
                                <td className="px-6 py-4">{student.name}</td>
                                <td className="px-6 py-4">{student.email}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-xs font-medium">
                                        {student.branch}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${getCgpaColor(student.cgpa)}`}>
                                        {student.cgpa.toFixed(2)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    No students found matching the criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

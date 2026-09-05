import React, { useState } from 'react';
import { Plus, IndianRupee, Trophy, Users, X } from 'lucide-react';

export default function AdminPlacementsPage() {
    const [placements, setPlacements] = useState([
        { id: 1, studentId: 'CS2023001', companyName: 'TechNova', ctc: 12.5, designation: 'SDE 1', location: 'Bangalore', joinDate: '2026-10-01' },
        { id: 2, studentId: 'CS2023005', companyName: 'GlobalFin', ctc: 18.0, designation: 'Quant Analyst', location: 'Mumbai', joinDate: '2026-11-15' },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPlacement, setNewPlacement] = useState({ studentId: '', companyId: '', ctc: '', designation: '', location: '', joinDate: '' });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setPlacements([...placements, { 
            id: Date.now(), 
            studentId: newPlacement.studentId, 
            companyName: newPlacement.companyId, // Simple mock
            ctc: parseFloat(newPlacement.ctc) || 0,
            designation: newPlacement.designation,
            location: newPlacement.location,
            joinDate: newPlacement.joinDate
        }]);
        setIsModalOpen(false);
        setNewPlacement({ studentId: '', companyId: '', ctc: '', designation: '', location: '', joinDate: '' });
    };

    const stats = {
        total: placements.length,
        highest: Math.max(...placements.map(p => p.ctc), 0),
        avg: placements.length ? (placements.reduce((a, b) => a + b.ctc, 0) / placements.length).toFixed(2) : 0
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-200">Placements</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Record Placement</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-center space-x-4">
                    <Users className="text-blue-500 w-8 h-8" />
                    <div>
                        <p className="text-sm text-slate-400">Total Placed</p>
                        <p className="text-xl font-bold text-slate-200">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-center space-x-4">
                    <Trophy className="text-yellow-500 w-8 h-8" />
                    <div>
                        <p className="text-sm text-slate-400">Highest CTC</p>
                        <p className="text-xl font-bold text-slate-200">₹{stats.highest} LPA</p>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-center space-x-4">
                    <IndianRupee className="text-green-500 w-8 h-8" />
                    <div>
                        <p className="text-sm text-slate-400">Average CTC</p>
                        <p className="text-xl font-bold text-slate-200">₹{stats.avg} LPA</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Student ID</th>
                            <th className="px-6 py-4 font-medium">Company</th>
                            <th className="px-6 py-4 font-medium">Designation</th>
                            <th className="px-6 py-4 font-medium">Location</th>
                            <th className="px-6 py-4 font-medium">CTC (LPA)</th>
                            <th className="px-6 py-4 font-medium">Join Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {placements.map(p => (
                            <tr key={p.id} className="hover:bg-slate-750">
                                <td className="px-6 py-4 font-medium text-slate-200">{p.studentId}</td>
                                <td className="px-6 py-4 font-medium text-brand-400">{p.companyName}</td>
                                <td className="px-6 py-4">{p.designation}</td>
                                <td className="px-6 py-4">{p.location}</td>
                                <td className="px-6 py-4 font-bold text-green-400">₹{p.ctc}</td>
                                <td className="px-6 py-4">{p.joinDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
                        <div className="flex justify-between items-center p-4 border-b border-slate-700">
                            <h2 className="text-lg font-bold text-slate-200">Record New Placement</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Student ID</label>
                                <input required type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200" value={newPlacement.studentId} onChange={e => setNewPlacement({...newPlacement, studentId: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Company / Company ID</label>
                                <input required type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200" value={newPlacement.companyId} onChange={e => setNewPlacement({...newPlacement, companyId: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">CTC (LPA)</label>
                                    <input required type="number" step="0.1" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200" value={newPlacement.ctc} onChange={e => setNewPlacement({...newPlacement, ctc: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Join Date</label>
                                    <input required type="date" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200" value={newPlacement.joinDate} onChange={e => setNewPlacement({...newPlacement, joinDate: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Designation</label>
                                <input required type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200" value={newPlacement.designation} onChange={e => setNewPlacement({...newPlacement, designation: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Location</label>
                                <input required type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200" value={newPlacement.location} onChange={e => setNewPlacement({...newPlacement, location: e.target.value})} />
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

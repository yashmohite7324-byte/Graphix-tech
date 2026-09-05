import React, { useState } from 'react';
import { Plus, Trash2, Megaphone, X } from 'lucide-react';

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState([
        { id: 1, title: 'Upcoming Placement Drive: TechNova', message: 'TechNova is visiting campus on Oct 1st. Eligible students must apply via the portal.', targetRole: 'Student', targetBranch: 'CSE, IT', targetBatch: '2027', date: '2026-09-05' },
        { id: 2, title: 'Company Registration Deadline Extended', message: 'The deadline for companies to register for Phase 1 has been extended to Sep 15th.', targetRole: 'Company', targetBranch: 'All', targetBatch: 'N/A', date: '2026-09-04' },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAnn, setNewAnn] = useState({ title: '', message: '', targetRole: 'All', targetBranch: 'All', targetBatch: 'All' });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setAnnouncements([{ 
            id: Date.now(), 
            title: newAnn.title, 
            message: newAnn.message,
            targetRole: newAnn.targetRole,
            targetBranch: newAnn.targetBranch,
            targetBatch: newAnn.targetBatch,
            date: new Date().toISOString().split('T')[0]
        }, ...announcements]);
        setIsModalOpen(false);
        setNewAnn({ title: '', message: '', targetRole: 'All', targetBranch: 'All', targetBatch: 'All' });
    };

    const handleDelete = (id: number) => {
        setAnnouncements(announcements.filter(a => a.id !== id));
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-200">Announcements</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Announcement</span>
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {announcements.map(ann => (
                    <div key={ann.id} className="bg-slate-800 p-5 rounded-lg border border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-start">
                        <div className="flex items-start space-x-4">
                            <div className="p-3 bg-slate-900 rounded-full text-brand-400 mt-1">
                                <Megaphone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-200">{ann.title}</h3>
                                <p className="text-slate-400 mt-1">{ann.message}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded">Target: {ann.targetRole}</span>
                                    {ann.targetBranch !== 'N/A' && <span className="px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded">Branch: {ann.targetBranch}</span>}
                                    {ann.targetBatch !== 'N/A' && <span className="px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded">Batch: {ann.targetBatch}</span>}
                                    <span className="px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded text-brand-300">{ann.date}</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDelete(ann.id)}
                            className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                            title="Delete Announcement"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
                {announcements.length === 0 && (
                    <div className="text-center p-8 bg-slate-800 border border-slate-700 rounded-lg text-slate-500">
                        No announcements found.
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg border border-slate-700">
                        <div className="flex justify-between items-center p-4 border-b border-slate-700">
                            <h2 className="text-lg font-bold text-slate-200">Create Announcement</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                                <input required type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200" value={newAnn.title} onChange={e => setNewAnn({...newAnn, title: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Message</label>
                                <textarea required rows={4} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200 resize-none" value={newAnn.message} onChange={e => setNewAnn({...newAnn, message: e.target.value})}></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Target Role</label>
                                    <select className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200" value={newAnn.targetRole} onChange={e => setNewAnn({...newAnn, targetRole: e.target.value})}>
                                        <option value="All">All</option>
                                        <option value="Student">Students</option>
                                        <option value="Company">Companies</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Target Branch</label>
                                    <input type="text" placeholder="e.g. CSE, IT" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200" value={newAnn.targetBranch} onChange={e => setNewAnn({...newAnn, targetBranch: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Target Batch</label>
                                    <input type="text" placeholder="e.g. 2027" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200" value={newAnn.targetBatch} onChange={e => setNewAnn({...newAnn, targetBatch: e.target.value})} />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600">Publish</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

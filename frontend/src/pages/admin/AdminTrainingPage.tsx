import { useState, useEffect } from 'react';
import { BookOpen, Plus, Calendar, User, CheckCircle, Sparkles } from 'lucide-react';
import { trainingApi } from '../../api';

export default function AdminTrainingPage() {
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newProgram, setNewProgram] = useState({
        name: '',
        description: '',
        trainerName: '',
        branch: 'Computer Engineering',
        batchYear: 2026,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        mode: 'ONLINE',
        syllabus: ''
    });

    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const res = await trainingApi.getPrograms();
            setPrograms(res.data?.data || []);
        } catch (err) {
            console.error('Failed to fetch training programs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await trainingApi.createProgram(newProgram);
            setShowModal(false);
            setNewProgram({
                name: '', description: '', trainerName: '', branch: 'Computer Engineering',
                batchYear: 2026, startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                mode: 'ONLINE', syllabus: ''
            });
            fetchPrograms();
        } catch (err) {
            console.error('Failed to create training session:', err);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Banner Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Corporate Training & Upskilling Sessions</h1>
                    <p className="text-amber-100 text-sm md:text-base mt-2 opacity-95 max-w-2xl">
                        Schedule bootcamp programs, technical workshops, DSA problem-solving sessions, and aptitude prep for enrolled students.
                    </p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="mt-4 md:mt-0 flex items-center gap-2 bg-white text-slate-900 font-extrabold px-5 py-3 rounded-xl shadow-lg hover:bg-amber-50 transition-all text-sm"
                >
                    <Plus size={18} /> Schedule New Training
                </button>
            </div>

            {/* Program Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((prog) => (
                    <div key={prog.id} className="surface p-6 rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                    prog.mode === 'ONLINE' ? 'bg-indigo-500/10 text-indigo-600' :
                                    prog.mode === 'OFFLINE' ? 'bg-emerald-500/10 text-emerald-600' :
                                    'bg-amber-500/10 text-amber-600'
                                }`}>
                                    {prog.mode || 'ONLINE'}
                                </span>
                                <span className="text-xs font-semibold text-[var(--text-tertiary)] flex items-center gap-1">
                                    <Calendar size={13} /> {prog.startDate || 'Active'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{prog.name}</h3>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-3">
                                {prog.description}
                            </p>

                            <div className="space-y-2 pt-3 border-t border-[var(--border)] text-xs">
                                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <User size={14} className="text-brand-500" /> Instructor:
                                    </span>
                                    <span className="font-bold text-[var(--text-primary)]">{prog.trainerName || 'Lead Placement Mentor'}</span>
                                </div>
                                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <BookOpen size={14} className="text-amber-500" /> Targeted Stream:
                                    </span>
                                    <span className="font-bold text-[var(--text-primary)]">{prog.branch || 'All Branches'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                                <CheckCircle size={14} /> Active Program
                            </span>
                            <span className="text-[var(--text-tertiary)] font-mono">Batch {prog.batchYear || 2026}</span>
                        </div>
                    </div>
                ))}

                {programs.length === 0 && !loading && (
                    <div className="col-span-full surface p-12 text-center rounded-2xl border border-[var(--border)]">
                        <BookOpen size={40} className="mx-auto mb-3 text-[var(--text-tertiary)]" />
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">No Training Sessions Scheduled</h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">Create your first corporate placement training program to upskill students.</p>
                        <button 
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm"
                        >
                            <Plus size={16} /> Schedule Training
                        </button>
                    </div>
                )}
            </div>

            {/* Create Program Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="surface p-6 rounded-2xl max-w-lg w-full border border-[var(--border)] shadow-2xl space-y-4 animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                            <h3 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                                <Sparkles size={18} className="text-amber-500" /> Schedule Corporate Training Program
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-[var(--text-tertiary)] hover:text-rose-500">✕</button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
                            <div>
                                <label className="font-bold text-[var(--text-primary)] block mb-1">Program Title</label>
                                <input 
                                    required
                                    type="text"
                                    placeholder="e.g. AWS & Cloud DevOps Bootcamp"
                                    className="w-full p-2.5 bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] font-medium"
                                    value={newProgram.name}
                                    onChange={(e) => setNewProgram({...newProgram, name: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-[var(--text-primary)] block mb-1">Trainer / Instructor Name</label>
                                    <input 
                                        required
                                        type="text"
                                        placeholder="e.g. Prof. Amruta Mankwade"
                                        className="w-full p-2.5 bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] font-medium"
                                        value={newProgram.trainerName}
                                        onChange={(e) => setNewProgram({...newProgram, trainerName: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-[var(--text-primary)] block mb-1">Target Stream / Branch</label>
                                    <select 
                                        className="w-full p-2.5 bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] font-medium"
                                        value={newProgram.branch}
                                        onChange={(e) => setNewProgram({...newProgram, branch: e.target.value})}
                                    >
                                        <option value="Computer Engineering">Computer Engineering</option>
                                        <option value="Information Technology">Information Technology</option>
                                        <option value="Data Science & AI">Data Science & AI</option>
                                        <option value="Electronics & Telecommunication">ENTC Engineering</option>
                                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                                        <option value="All Branches">All Engineering Streams</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-[var(--text-primary)] block mb-1">Mode of Delivery</label>
                                    <select 
                                        className="w-full p-2.5 bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] font-medium"
                                        value={newProgram.mode}
                                        onChange={(e) => setNewProgram({...newProgram, mode: e.target.value})}
                                    >
                                        <option value="ONLINE">ONLINE (Virtual Zoom/Teams)</option>
                                        <option value="OFFLINE">OFFLINE (Auditorium / Lab)</option>
                                        <option value="HYBRID">HYBRID</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="font-bold text-[var(--text-primary)] block mb-1">Target Batch Year</label>
                                    <input 
                                        type="number"
                                        className="w-full p-2.5 bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] font-medium"
                                        value={newProgram.batchYear}
                                        onChange={(e) => setNewProgram({...newProgram, batchYear: parseInt(e.target.value) || 2026})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-[var(--text-primary)] block mb-1">Program Description</label>
                                <textarea 
                                    rows={3}
                                    placeholder="Brief summary of skills, goals, and prerequisites..."
                                    className="w-full p-2.5 bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] font-medium"
                                    value={newProgram.description}
                                    onChange={(e) => setNewProgram({...newProgram, description: e.target.value})}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-[var(--border)] rounded-xl font-bold">
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-extrabold shadow-lg">
                                    Schedule Session
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

import React, { useState } from 'react';
import { Users, MoreVertical, GraduationCap, ChevronRight } from 'lucide-react';

const MOCK_JOBS = ['Frontend Engineer', 'Backend Developer', 'UX Designer'];

const STAGES = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected'];

const MOCK_CANDIDATES = [
  { id: 1, name: 'Alice Smith', branch: 'CSE', cgpa: 8.5, stage: 'Applied' },
  { id: 2, name: 'Bob Johnson', branch: 'IT', cgpa: 7.9, stage: 'Under Review' },
  { id: 3, name: 'Charlie Brown', branch: 'ECE', cgpa: 8.2, stage: 'Shortlisted' },
  { id: 4, name: 'Diana Prince', branch: 'CSE', cgpa: 9.1, stage: 'Interview' },
  { id: 5, name: 'Evan Wright', branch: 'MECH', cgpa: 7.5, stage: 'Selected' },
  { id: 6, name: 'Fiona Gallagher', branch: 'EEE', cgpa: 8.8, stage: 'Applied' },
];

export default function RecruiterCandidatePipelinePage() {
  const [selectedJob, setSelectedJob] = useState(MOCK_JOBS[0]);
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const moveCandidate = (id: number, newStage: string) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, stage: newStage } : c));
    setActiveMenu(null);
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-brand-600" /> Candidate Pipeline</h1>
      </div>

      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
        {MOCK_JOBS.map(job => (
          <button
            key={job}
            onClick={() => setSelectedJob(job)}
            className={`px-4 py-2 font-medium whitespace-nowrap transition-colors border-b-2 ${
              selectedJob === job ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {job}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-w-max h-full pb-4">
          {STAGES.map(stage => {
            const stageCandidates = candidates.filter(c => c.stage === stage);
            
            return (
              <div key={stage} className="bg-slate-50 w-80 rounded-lg flex flex-col border border-slate-200">
                <div className="p-3 border-b border-slate-200 font-semibold text-slate-700 flex justify-between items-center bg-slate-100 rounded-t-lg">
                  {stage}
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">{stageCandidates.length}</span>
                </div>
                
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {stageCandidates.map(candidate => (
                    <div key={candidate.id} className="bg-white p-3 rounded shadow-sm border border-slate-200 relative">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-slate-800">{candidate.name}</div>
                        <button 
                          onClick={() => setActiveMenu(activeMenu === candidate.id ? null : candidate.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><GraduationCap size={14} /> {candidate.branch}</span>
                        <span>CGPA: {candidate.cgpa}</span>
                      </div>

                      {activeMenu === candidate.id && (
                        <div className="absolute right-2 top-8 w-40 bg-white border border-slate-200 shadow-lg rounded-md z-10 py-1">
                          <div className="px-3 py-1 text-xs font-semibold text-slate-500 bg-slate-50">Move to...</div>
                          {STAGES.filter(s => s !== stage).map(s => (
                            <button
                              key={s}
                              onClick={() => moveCandidate(candidate.id, s)}
                              className="w-full text-left px-3 py-1.5 text-sm hover:bg-brand-50 hover:text-brand-700 flex items-center justify-between"
                            >
                              {s} <ChevronRight size={14} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {stageCandidates.length === 0 && (
                    <div className="text-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-200 rounded">
                      No candidates
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

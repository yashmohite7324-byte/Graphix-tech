import { useState, useEffect } from 'react';
import { Users, MoreVertical, GraduationCap, Briefcase } from 'lucide-react';
import { recruiterApi } from '../../api';
import { Link } from 'react-router-dom';

const STAGES = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED'];
const STAGE_LABELS: Record<string, string> = {
  APPLIED: 'Applied',
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW_SCHEDULED: 'Interviewing',
  SELECTED: 'Selected',
  REJECTED: 'Rejected'
};

export default function RecruiterCandidatePipelinePage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await recruiterApi.getJobs();
        const fetchedJobs = res.data.data;
        setJobs(fetchedJobs);
        if (fetchedJobs.length > 0) {
          setSelectedJobId(fetchedJobs[0].id);
        } else {
            setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch jobs", error);
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      const fetchApplications = async () => {
        setLoading(true);
        try {
          const res = await recruiterApi.getApplicationsForJob(selectedJobId);
          setCandidates(res.data.data);
        } catch (error) {
          console.error("Failed to fetch applications", error);
        } finally {
          setLoading(false);
        }
      };
      fetchApplications();
    }
  }, [selectedJobId]);

  const moveCandidate = async (appId: number, newStage: string) => {
    try {
      await recruiterApi.updateApplicationStatus(appId, newStage);
      setCandidates(prev => prev.map(c => c.id === appId ? { ...c, status: newStage } : c));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update candidate status");
    } finally {
        setActiveMenu(null);
    }
  };

  if (jobs.length === 0 && !loading) {
      return (
          <div className="p-6 h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center">
              <Briefcase className="w-16 h-16 text-slate-300 mb-4" />
              <h2 className="text-2xl font-bold text-slate-700 mb-2">No Jobs Posted Yet</h2>
              <p className="text-slate-500 mb-6">Create a job posting to start receiving applications and managing candidates.</p>
              <Link to="/recruiter/jobs/new" className="px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors">
                  Post Your First Job
              </Link>
          </div>
      );
  }

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-brand-600" /> Candidate Pipeline</h1>
      </div>

      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
        {jobs.map(job => (
          <button
            key={job.id}
            onClick={() => setSelectedJobId(job.id)}
            className={`px-4 py-2 font-medium whitespace-nowrap transition-colors border-b-2 ${
              selectedJobId === job.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {job.title}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-w-max h-full pb-4">
          {STAGES.map(stage => {
            const stageCandidates = candidates.filter(c => c.status === stage);
            
            return (
              <div key={stage} className="bg-slate-50 w-80 rounded-lg flex flex-col border border-slate-200 shadow-sm">
                <div className="p-3 border-b border-slate-200 font-semibold text-slate-700 flex justify-between items-center bg-slate-100 rounded-t-lg">
                  {STAGE_LABELS[stage]}
                  <span className="bg-white border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full text-xs shadow-sm">{stageCandidates.length}</span>
                </div>
                
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {loading ? (
                      <div className="text-center text-slate-400 text-sm py-4">Loading...</div>
                  ) : stageCandidates.length === 0 ? (
                      <div className="text-center text-slate-400 text-sm py-4 italic border-2 border-dashed border-slate-200 rounded-lg">No candidates</div>
                  ) : stageCandidates.map(candidate => (
                    <div key={candidate.id} className="bg-white p-3 rounded-md shadow-sm border border-slate-200 relative group hover:border-brand-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-slate-800">{candidate.student?.fullName || 'Unknown Student'}</div>
                        <button 
                          onClick={() => setActiveMenu(activeMenu === candidate.id ? null : candidate.id)}
                          className="text-slate-400 hover:text-brand-600 p-1"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                          <GraduationCap size={12} /> {candidate.student?.branch || 'N/A'}
                        </span>
                        <span className="font-medium text-slate-600">CGPA: {candidate.student?.cgpa?.toFixed(2) || 'N/A'}</span>
                      </div>
                      
                      {candidate.aiMatchScore && (
                        <div className={`mt-3 pt-3 border-t flex justify-between items-center ${candidate.aiMatchScore >= 80 ? 'border-brand-100 bg-brand-50/50 -mx-3 -mb-3 p-3 rounded-b-md' : 'border-slate-100'}`}>
                          <span className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${candidate.aiMatchScore >= 80 ? 'text-brand-600' : 'text-slate-400'}`}>
                            {candidate.aiMatchScore >= 80 && <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>}
                            AI Resume Detector
                          </span>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                            candidate.aiMatchScore >= 80 ? 'bg-green-500 text-white shadow-sm shadow-green-500/30' :
                            candidate.aiMatchScore >= 60 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {candidate.aiMatchScore >= 80 && '🔥 High: '}
                            {candidate.aiMatchScore}% Match
                          </span>
                        </div>
                      )}

                      {activeMenu === candidate.id && (
                        <div className="absolute right-2 top-8 w-40 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-10 text-sm">
                          {STAGES.map(s => (
                            s !== stage && (
                              <button
                                key={s}
                                onClick={() => moveCandidate(candidate.id, s)}
                                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700"
                              >
                                Move to {STAGE_LABELS[s]}
                              </button>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

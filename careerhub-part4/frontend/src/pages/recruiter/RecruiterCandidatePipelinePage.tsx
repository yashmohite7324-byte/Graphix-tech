import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruiterApi, jobsApi } from '../../api';
import { StatusBadge, PageLoader, EmptyState } from '../../components/ui';
import {
  Users, ChevronRight, GraduationCap,
  CheckCircle, XCircle, Calendar, Eye, Loader2
} from 'lucide-react';

const PIPELINE_STAGES = [
  { key: 'APPLIED', label: 'Applied', color: 'border-blue-200 bg-blue-50' },
  { key: 'UNDER_REVIEW', label: 'Under Review', color: 'border-yellow-200 bg-yellow-50' },
  { key: 'SHORTLISTED', label: 'Shortlisted', color: 'border-purple-200 bg-purple-50' },
  { key: 'INTERVIEW_SCHEDULED', label: 'Interview', color: 'border-orange-200 bg-orange-50' },
  { key: 'SELECTED', label: 'Selected', color: 'border-green-200 bg-green-50' },
];

function CandidateCard({ app, onUpdate }: { app: any; onUpdate: (id: number, status: string) => void }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setShowActions(!showActions)}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm flex-shrink-0">
          {app.student?.fullName?.[0] || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {app.student?.fullName || `Student #${app.student?.id}`}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {app.student?.user?.email}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {app.student?.branch && <span className="badge-blue text-xs">{app.student.branch}</span>}
        {app.student?.cgpa && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            app.student.cgpa >= 8 ? 'bg-green-100 text-green-700' :
            app.student.cgpa >= 6 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'
          }`}>
            CGPA: {app.student.cgpa.toFixed(1)}
          </span>
        )}
        {app.student?.backlogCount === 0 && (
          <span className="badge-green text-xs">No Backlogs</span>
        )}
      </div>

      <div className="text-xs text-slate-400">
        Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}
      </div>

      {showActions && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
          <p className="text-xs font-semibold text-slate-500 mb-2">Move to:</p>
          {['UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED'].map(s => (
            <button
              key={s}
              onClick={(e) => { e.stopPropagation(); onUpdate(app.id, s); setShowActions(false); }}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                s === 'REJECTED'
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {s === 'SELECTED' && '✅ '}
              {s === 'REJECTED' && '❌ '}
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RecruiterCandidatePipelinePage() {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  const { data: jobsRes, isLoading: jobsLoading } = useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: () => jobsApi.search(),
  });

  const { data: appsRes, isLoading: appsLoading } = useQuery({
    queryKey: ['job-applications', selectedJob],
    queryFn: () => selectedJob
      ? recruiterApi.getApplicationsForJob(selectedJob)
      : Promise.resolve({ data: { data: [] } }),
    enabled: !!selectedJob,
  });

  const updateMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: number; status: string }) =>
      recruiterApi.updateApplicationStatus(appId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', selectedJob] });
    },
  });

  if (jobsLoading) return <PageLoader />;

  const jobs = jobsRes?.data?.data || [];
  const applications = appsRes?.data?.data || [];

  const appsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.key] = applications.filter((a: any) => a.status === stage.key);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1>Candidate Pipeline</h1>
        <p className="text-slate-500 text-sm mt-1">
          View and manage candidates across all hiring stages.
        </p>
      </div>

      {/* Job selector */}
      <div className="card p-4">
        <label className="label mb-2">Select a job to view candidates:</label>
        <div className="flex flex-wrap gap-2">
          {jobs.length === 0 ? (
            <p className="text-sm text-slate-400">No jobs posted yet. Post a job first.</p>
          ) : (
            jobs.map((job: any) => (
              <button
                key={job.id}
                onClick={() => setSelectedJob(job.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  selectedJob === job.id
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300'
                }`}
              >
                {job.title}
                {job.ctc && (
                  <span className={`ml-2 text-xs ${selectedJob === job.id ? 'text-white/70' : 'text-slate-400'}`}>
                    ₹{(job.ctc / 100000).toFixed(1)}L
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {!selectedJob ? (
        <EmptyState
          icon={<Users size={28} />}
          title="Select a job to view candidates"
          description="Choose one of your job postings above to see the application pipeline."
        />
      ) : appsLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={24} className="animate-spin text-brand-500" />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={<GraduationCap size={28} />}
          title="No applications yet"
          description="Students will appear here once they apply to this job."
        />
      ) : (
        <>
          {/* Summary bar */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {PIPELINE_STAGES.map(stage => (
              <div key={stage.key} className="flex-shrink-0 bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
                <span className="text-xl font-bold text-slate-900">
                  {appsByStage[stage.key]?.length || 0}
                </span>
                <span className="text-sm text-slate-500">{stage.label}</span>
              </div>
            ))}
          </div>

          {/* Kanban board */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto">
            {PIPELINE_STAGES.map(stage => (
              <div key={stage.key} className="min-w-52">
                <div className={`rounded-xl border-2 p-3 ${stage.color}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      {stage.label}
                    </p>
                    <span className="w-5 h-5 rounded-full bg-white text-slate-600 text-xs font-bold flex items-center justify-center">
                      {appsByStage[stage.key]?.length || 0}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {(appsByStage[stage.key] || []).map((app: any) => (
                      <CandidateCard
                        key={app.id}
                        app={app}
                        onUpdate={(appId, status) =>
                          updateMutation.mutate({ appId, status })
                        }
                      />
                    ))}
                    {(appsByStage[stage.key] || []).length === 0 && (
                      <div className="text-center py-4 text-xs text-slate-400">
                        No candidates
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

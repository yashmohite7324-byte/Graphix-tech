import { useQuery } from '@tanstack/react-query';
import { trainingApi } from '../../api';
import { PageLoader, EmptyState, StatusBadge } from '../../components/ui';
import { BookOpen, CheckSquare, ClipboardList, Calendar, User } from 'lucide-react';

export default function StudentTrainingPage() {
  const { data: programsRes, isLoading } = useQuery({
    queryKey: ['training-programs'],
    queryFn: () => trainingApi.getPrograms(),
  });

  if (isLoading) return <PageLoader />;
  const programs = programsRes?.data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1>Training Programs</h1>
        <p className="text-slate-500 text-sm mt-1">
          Track your enrolled training programs, attendance, and assessment scores.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{programs.length}</p>
            <p className="text-xs text-slate-500">Programs</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <CheckSquare size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">—</p>
            <p className="text-xs text-slate-500">Avg Attendance</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <ClipboardList size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">—</p>
            <p className="text-xs text-slate-500">Assessments</p>
          </div>
        </div>
      </div>

      {/* Programs list */}
      {programs.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={28} />}
          title="No training programs yet"
          description="Your trainer will enroll you in training programs. Check back soon."
        />
      ) : (
        <div className="space-y-4">
          {programs.map((program: any) => (
            <div key={program.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 flex-shrink-0">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{program.name}</h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                      {program.trainerName && (
                        <span className="flex items-center gap-1">
                          <User size={12} /> {program.trainerName}
                        </span>
                      )}
                      {program.mode && (
                        <span className="flex items-center gap-1">
                          📍 {program.mode}
                        </span>
                      )}
                      {program.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(program.startDate).toLocaleDateString()} —{' '}
                          {program.endDate
                            ? new Date(program.endDate).toLocaleDateString()
                            : 'Ongoing'}
                        </span>
                      )}
                    </div>

                    {program.description && (
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                        {program.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {program.branch && <span className="badge-blue">{program.branch}</span>}
                  {program.batchYear && <span className="badge-slate">Batch {program.batchYear}</span>}
                </div>
              </div>

              {/* Attendance bar placeholder */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>Attendance</span>
                  <span className="font-medium text-slate-700">— / — sessions</span>
                </div>
                <div className="bg-slate-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Attendance data loads after sessions are marked by your trainer.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

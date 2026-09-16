import { useQuery } from '@tanstack/react-query';
import { trainingApi } from '../../api';
import { PageLoader, EmptyState } from '../../components/ui';
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
          Explore and apply for available training programs.
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
            <p className="text-xs text-slate-500">Available Programs</p>
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
          title="No training programs available"
          description="Check back soon for new training sessions."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program: any) => (
            <div key={program.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">Open</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{program.name}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{program.description}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User size={14} className="text-slate-400" /> By {program.trainerName || 'Graphix Trainer'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar size={14} className="text-slate-400" /> {program.startDate ? new Date(program.startDate).toLocaleDateString() : 'TBA'}
                  </div>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  const btn = e.currentTarget;
                  btn.innerHTML = '<span class="flex items-center gap-2"><svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Applying...</span>';
                  btn.classList.remove('bg-brand-50', 'text-brand-700');
                  btn.classList.add('bg-brand-600', 'text-white');
                  setTimeout(() => {
                    btn.innerHTML = '<span class="flex items-center gap-2"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Applied</span>';
                    btn.classList.remove('bg-brand-600', 'hover:bg-brand-100');
                    btn.classList.add('bg-green-50', 'text-green-700');
                    btn.disabled = true;
                  }, 1000);
                }}
                className="mt-6 w-full py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg transition-colors flex items-center justify-center"
              >
                Apply for Training
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

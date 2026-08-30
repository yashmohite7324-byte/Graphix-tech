import { useQuery } from '@tanstack/react-query';
import { trainingApi } from '../../api';
import { StatCard, PageLoader, EmptyState } from '../../components/ui';
import { BookOpen, Users, CheckSquare, ClipboardList } from 'lucide-react';

export default function TrainerDashboard() {
  const { data: programsRes, isLoading } = useQuery({
    queryKey: ['training-programs'],
    queryFn: () => trainingApi.getPrograms(),
  });

  if (isLoading) return <PageLoader />;
  const programs = programsRes?.data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1>Trainer Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Manage training programs, attendance, and assessments.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Programs" value={programs.length} icon={<BookOpen size={22} />} color="blue" />
        <StatCard label="Active Students" value="—" icon={<Users size={22} />} color="purple" />
        <StatCard label="Avg Attendance" value="—%" icon={<CheckSquare size={22} />} color="green" />
        <StatCard label="Assessments" value="—" icon={<ClipboardList size={22} />} color="orange" />
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3>Training Programs</h3>
          <button className="btn-primary text-xs px-3 py-1.5">+ New Program</button>
        </div>
        {programs.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={28} />}
            title="No training programs yet"
            description="Create your first training program to get started."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Program</th>
                  <th className="table-header">Branch</th>
                  <th className="table-header">Batch Year</th>
                  <th className="table-header">Mode</th>
                  <th className="table-header">Dates</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="table-cell">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.trainerName}</p>
                    </td>
                    <td className="table-cell">{p.branch || '—'}</td>
                    <td className="table-cell">{p.batchYear || '—'}</td>
                    <td className="table-cell">{p.mode || '—'}</td>
                    <td className="table-cell">
                      <p className="text-xs">{p.startDate ? new Date(p.startDate).toLocaleDateString() : '—'}</p>
                      <p className="text-xs text-slate-400">{p.endDate ? `to ${new Date(p.endDate).toLocaleDateString()}` : ''}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

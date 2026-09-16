import { useQuery } from '@tanstack/react-query';
import { trainingApi } from '../../api';
import { Stat, Panel, Empty, Loading } from '../../components/Dash';
import { BookOpen, Users, CheckSquare, ClipboardList, Plus } from 'lucide-react';

export default function TrainerDashboard() {
  const { data: programsRes, isLoading } = useQuery({
    queryKey: ['training-programs'],
    queryFn: () => trainingApi.getPrograms(),
  });

  const programs = programsRes?.data?.data || [];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <section className="surface mesh p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold t-primary mt-0.5">Trainer Dashboard</h1>
            <p className="text-sm t-secondary mt-2 max-w-[50ch] leading-relaxed">
              Manage training programs, attendance, and assessments.
            </p>
          </div>
          <button className="btn btn-primary">
            <Plus size={14} className="mr-1" /> New Program
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Programs" value={programs.length} icon={<BookOpen size={17} />} accent="var(--brand-500)" />
        <Stat label="Active Students" value="-" icon={<Users size={17} />} accent="var(--stage-review)" />
        <Stat label="Avg Attendance" value="-%" icon={<CheckSquare size={17} />} accent="var(--stage-shortlisted)" />
        <Stat label="Assessments" value="-" icon={<ClipboardList size={17} />} accent="var(--stage-offered)" />
      </div>

      <Panel title="Training Programs">
        {isLoading ? <Loading /> : programs.length === 0 ? (
          <Empty
            icon={<BookOpen size={22} />}
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
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="p-4">
                      <p className="font-medium t-primary">{p.name}</p>
                      <p className="text-xs t-tertiary">{p.trainerName}</p>
                    </td>
                    <td className="p-4 t-secondary">{p.branch || '-'}</td>
                    <td className="p-4 t-secondary">{p.batchYear || '-'}</td>
                    <td className="p-4 t-secondary">{p.mode || '-'}</td>
                    <td className="p-4 t-secondary">
                      <p className="text-xs">{p.startDate ? new Date(p.startDate).toLocaleDateString() : '-'}</p>
                      <p className="text-xs t-tertiary mt-0.5">{p.endDate ? `to ${new Date(p.endDate).toLocaleDateString()}` : ''}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

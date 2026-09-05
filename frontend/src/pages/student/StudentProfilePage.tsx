import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '../../api';
import { PageLoader } from '../../components/ui';
import {
  User, BookOpen, Award, Briefcase,
  CheckCircle, Loader2, Upload, Star
} from 'lucide-react';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CHEM', 'MBA', 'MCA'];
const SKILLS = [
  'Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Spring Boot',
  'Node.js', 'MySQL', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Git',
  'C', 'C++', 'Data Structures', 'Machine Learning', 'Deep Learning', 'SQL'
];

export default function StudentProfilePage() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const [form, setForm] = useState({
    fullName: '', rollNumber: '', branch: '', batchYear: '',
    cgpa: '', backlogCount: '0', resumeUrl: '', photoUrl: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');

  const { data: profileRes, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => studentApi.getProfile(),
  });

  useEffect(() => {
    const p = profileRes?.data?.data;
    if (p) {
      setForm({
        fullName: p.fullName || '',
        rollNumber: p.rollNumber || '',
        branch: p.branch || '',
        batchYear: p.batchYear?.toString() || '',
        cgpa: p.cgpa?.toString() || '',
        backlogCount: p.backlogCount?.toString() || '0',
        resumeUrl: p.resumeUrl || '',
        photoUrl: p.photoUrl || '',
      });
    }
  }, [profileRes]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => studentApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (isLoading) return <PageLoader />;

  const completionFields = [
    form.fullName, form.branch, form.cgpa,
    form.resumeUrl, form.batchYear, form.rollNumber
  ];
  const completion = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  const handleSave = () => {
    updateMutation.mutate({
      ...form,
      batchYear: parseInt(form.batchYear),
      cgpa: parseFloat(form.cgpa),
      backlogCount: parseInt(form.backlogCount),
    });
  };

  const toggleSkill = (skill: string) => {
    setSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <User size={15} /> },
    { id: 'academic', label: 'Academic', icon: <BookOpen size={15} /> },
    { id: 'skills', label: 'Skills', icon: <Star size={15} /> },
    { id: 'resume', label: 'Resume', icon: <Upload size={15} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1>My Profile</h1>
          <p className="text-slate-500 text-sm mt-1">
            Keep your profile updated to improve job recommendations.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="btn-primary"
        >
          {updateMutation.isPending
            ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
            : saved
            ? <><CheckCircle size={15} /> Saved!</>
            : 'Save Profile'
          }
        </button>
      </div>

      {/* Profile completion */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700">Profile Completion</p>
          <p className={`text-sm font-bold ${
            completion === 100 ? 'text-green-600' :
            completion >= 60 ? 'text-yellow-600' : 'text-red-500'
          }`}>{completion}%</p>
        </div>
        <div className="bg-slate-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              completion === 100 ? 'bg-green-500' :
              completion >= 60 ? 'bg-yellow-500' : 'bg-red-400'
            }`}
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {completion === 100
            ? '✅ Your profile is complete!'
            : 'Fill in all fields to maximize your visibility to recruiters.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card p-6">
        {activeTab === 'personal' && (
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Personal Information</h3>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-3xl">
                {form.fullName?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{form.fullName || 'Your Name'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{form.branch || 'Branch'} • {form.batchYear || 'Year'}</p>
                <button className="text-xs text-brand-600 hover:underline mt-1">Upload photo</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input className="input" placeholder="e.g. Aditya Sharma"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <label className="label">Roll Number *</label>
                <input className="input" placeholder="e.g. 2024CSE001"
                  value={form.rollNumber}
                  onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Academic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Branch / Department *</label>
                <select className="input"
                  value={form.branch}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}>
                  <option value="">Select Branch</option>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Graduation Year *</label>
                <select className="input"
                  value={form.batchYear}
                  onChange={(e) => setForm({ ...form, batchYear: e.target.value })}>
                  <option value="">Select Year</option>
                  {[2024, 2025, 2026, 2027, 2028].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">CGPA *</label>
                <input className="input" type="number" step="0.01" min="0" max="10"
                  placeholder="e.g. 8.5"
                  value={form.cgpa}
                  onChange={(e) => setForm({ ...form, cgpa: e.target.value })} />
                <p className="text-xs text-slate-400 mt-1">Out of 10</p>
              </div>
              <div>
                <label className="label">Number of Backlogs</label>
                <input className="input" type="number" min="0"
                  placeholder="0"
                  value={form.backlogCount}
                  onChange={(e) => setForm({ ...form, backlogCount: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Skills</h3>
            <p className="text-sm text-slate-500">Select all skills that apply to you:</p>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    skills.includes(skill)
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                  }`}
                >
                  {skills.includes(skill) && '✓ '}{skill}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <input
                className="input max-w-xs"
                placeholder="Add custom skill..."
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customSkill.trim()) {
                    toggleSkill(customSkill.trim());
                    setCustomSkill('');
                  }
                }}
              />
              <button
                onClick={() => { if (customSkill.trim()) { toggleSkill(customSkill.trim()); setCustomSkill(''); } }}
                className="btn-secondary"
              >
                Add
              </button>
            </div>
            {skills.length > 0 && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-2">Selected skills ({skills.length}):</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map(s => (
                    <span key={s} className="badge-blue">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'resume' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Resume & Documents</h3>
            <div>
              <label className="label">Resume URL</label>
              <input className="input" placeholder="Paste Google Drive / OneDrive link to your resume PDF"
                value={form.resumeUrl}
                onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })} />
              <p className="text-xs text-slate-400 mt-1">
                Upload your resume to Google Drive, set sharing to "Anyone with link", then paste the link here.
                S3 direct upload coming soon.
              </p>
            </div>

            {form.resumeUrl && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle size={18} className="text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Resume linked</p>
                  <a href={form.resumeUrl} target="_blank" rel="noreferrer"
                    className="text-xs text-green-600 hover:underline">
                    View resume →
                  </a>
                </div>
              </div>
            )}

            <div className="mt-4 p-4 border-2 border-dashed border-slate-200 rounded-xl text-center">
              <Upload size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Direct resume upload (PDF)</p>
              <p className="text-xs text-slate-400 mt-1">Coming soon — S3 upload integration</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '../../api';
import { PageLoader } from '../../components/ui';
import {
  User, BookOpen,
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

  const [presignedUrls, setPresignedUrls] = useState({ photo: '', resume: '' });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

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
      setPresignedUrls({
        photo: p.presignedPhotoUrl || p.photoUrl || '',
        resume: p.presignedResumeUrl || p.resumeUrl || '',
      });
    }
  }, [profileRes]);

  const photoUploadMutation = useMutation({
    mutationFn: (file: File) => studentApi.uploadPhoto(file),
    onMutate: () => setUploadingPhoto(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      setUploadingPhoto(false);
    },
    onError: (err: any) => {
      setUploadingPhoto(false);
      const serverMsg = err.response?.data?.message || err.message;
      alert('Failed to upload photo to S3. Error: ' + serverMsg + '\n\nDid you STOP and RESTART the backend in IntelliJ to apply the new AWS keys?');
    },
  });

  const resumeUploadMutation = useMutation({
    mutationFn: (file: File) => studentApi.uploadResume(file),
    onMutate: () => setUploadingResume(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      setUploadingResume(false);
    },
    onError: (err: any) => {
      setUploadingResume(false);
      const serverMsg = err.response?.data?.message || err.message;
      alert('Failed to upload resume to S3. Error: ' + serverMsg + '\n\nDid you STOP and RESTART the backend in IntelliJ to apply the new AWS keys?');
    },
  });

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
      batchYear: form.batchYear ? parseInt(form.batchYear) : null,
      cgpa: form.cgpa ? parseFloat(form.cgpa) : null,
      backlogCount: form.backlogCount ? parseInt(form.backlogCount) : null,
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
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Header with attractive gradient */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-brand-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-brand-100 text-sm md:text-base mt-2 opacity-90 max-w-xl">
            Keep your profile updated to improve job recommendations.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="mt-4 md:mt-0 bg-white text-brand-600 px-6 py-2.5 rounded-xl font-bold hover:bg-brand-50 transition-colors flex items-center gap-2 shadow-sm"
        >
          {updateMutation.isPending
            ? <><Loader2 size={18} className="animate-spin" /> Saving...</>
            : saved
            ? <><CheckCircle size={18} /> Saved!</>
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
              {presignedUrls.photo ? (
                <img src={presignedUrls.photo} alt="Profile" className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-3xl shadow-sm">
                  {form.fullName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900">{form.fullName || 'Your Name'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{form.branch || 'Branch'} • {form.batchYear || 'Year'}</p>
                
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-brand-600 hover:text-brand-700 mt-2 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200 transition-colors">
                  {uploadingPhoto ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {uploadingPhoto ? 'Uploading to S3...' : 'Upload Profile Photo'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) photoUploadMutation.mutate(e.target.files[0]);
                    }} 
                  />
                </label>
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
            
            {/* S3 File Upload Dropzone */}
            <div className="p-6 border-2 border-dashed border-brand-200 hover:border-brand-400 bg-brand-50/30 rounded-2xl text-center transition-colors">
              <Upload size={32} className="text-brand-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">Upload Resume (PDF, DOCX)</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Files are uploaded directly to S3 bucket <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">graphix-techhire-2026</code></p>
              
              <label className="inline-flex items-center gap-2 cursor-pointer btn-primary shadow-md hover:shadow-lg transition-all">
                {uploadingResume ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploadingResume ? 'Uploading to AWS S3...' : 'Select Resume File'}
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files?.[0]) resumeUploadMutation.mutate(e.target.files[0]);
                  }} 
                />
              </label>
            </div>

            {(presignedUrls.resume || form.resumeUrl) && (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">Resume uploaded & stored in S3</p>
                    <p className="text-xs text-green-700 font-mono mt-0.5 truncate max-w-md">Key: {form.resumeUrl}</p>
                  </div>
                </div>
                <a 
                  href={presignedUrls.resume || form.resumeUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-secondary text-xs flex items-center gap-1 bg-white text-green-700 border-green-300 hover:bg-green-100 shadow-sm"
                >
                  View Presigned Resume →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

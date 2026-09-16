import { useState } from 'react';
import { Briefcase, MapPin, IndianRupee, CheckCircle, Plus } from 'lucide-react';
import { recruiterApi } from '../../api';
import { useNavigate } from 'react-router-dom';

export default function RecruiterPostJobPage() {
  const [branches, setBranches] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Full-time', // For UI mapping to description later
    location: '',      // For UI mapping
    ctc: '',
    minCgpa: '',
    maxBacklogs: '',
    batchYear: new Date().getFullYear(),
    skills: '',
    deadline: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  const toggleBranch = (branch: string) => {
    setBranches(prev => prev.includes(branch) ? prev.filter(b => b !== branch) : [...prev, branch]);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const payload = {
            title: formData.title,
            description: `${formData.type} | ${formData.location} \n\n${formData.description}`,
            ctc: formData.ctc ? parseFloat(formData.ctc) : 0,
            applicationDeadline: formData.deadline,
            minCgpa: formData.minCgpa ? parseFloat(formData.minCgpa) : 0,
            maxBacklogs: formData.maxBacklogs ? parseInt(formData.maxBacklogs) : 0,
            eligibleBranches: branches.join(','),
            eligibleBatchYear: formData.batchYear,
            requiredSkills: formData.skills
        };
        await recruiterApi.createJob(payload);
        showToast('Job posted successfully!', 'success');
        setTimeout(() => navigate('/recruiter/dashboard'), 1500);
    } catch (error) {
        showToast('Failed to post job. Please try again.', 'error');
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
        <Briefcase className="w-8 h-8 text-brand-600" /> Post a New Job
      </h1>
      
      <form onSubmit={handlePostJob} className="bg-white rounded-xl shadow-md border border-slate-200 p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border-slate-300 rounded-md p-2.5 border focus:ring-brand-500 focus:border-brand-500" placeholder="Software Engineer" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Job Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full border-slate-300 rounded-md p-2.5 border focus:ring-brand-500 focus:border-brand-500" required>
              <option>Full-time</option>
              <option>Internship</option>
              <option>Contract</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
            <div className="flex relative">
              <span className="absolute left-3 top-3 text-slate-400"><MapPin size={18} /></span>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full border-slate-300 rounded-md p-2.5 pl-10 border focus:ring-brand-500 focus:border-brand-500" placeholder="e.g. Remote, NY" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">CTC / Package (LPA)</label>
            <div className="flex relative">
              <span className="absolute left-3 top-3 text-slate-400"><IndianRupee size={18} /></span>
              <input type="number" step="0.1" name="ctc" value={formData.ctc} onChange={handleChange} className="w-full border-slate-300 rounded-md p-2.5 pl-10 border focus:ring-brand-500 focus:border-brand-500" placeholder="e.g. 12.5" required />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Application Deadline</label>
            <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full border-slate-300 rounded-md p-2.5 border focus:ring-brand-500 focus:border-brand-500" required />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Eligibility & Requirements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Minimum CGPA</label>
              <input type="number" step="0.1" name="minCgpa" value={formData.minCgpa} onChange={handleChange} className="w-full border-slate-300 rounded-md p-2.5 border focus:ring-brand-500 focus:border-brand-500" placeholder="e.g. 7.5" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Maximum Allowed Backlogs</label>
              <input type="number" name="maxBacklogs" value={formData.maxBacklogs} onChange={handleChange} className="w-full border-slate-300 rounded-md p-2.5 border focus:ring-brand-500 focus:border-brand-500" placeholder="e.g. 0" required />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Eligible Branches</label>
            <div className="flex flex-wrap gap-3">
              {['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'].map(branch => (
                <button
                  type="button"
                  key={branch}
                  onClick={() => toggleBranch(branch)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    branches.includes(branch) 
                      ? 'bg-brand-50 border-brand-500 text-brand-700'
                      : 'bg-white border-slate-300 text-slate-600 hover:border-brand-300'
                  }`}
                >
                  {branches.includes(branch) && <CheckCircle className="w-4 h-4 inline-block mr-1 -mt-0.5" />}
                  {branch}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Job Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full border-slate-300 rounded-md p-3 border focus:ring-brand-500 focus:border-brand-500" placeholder="Provide details about the role..."></textarea>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading || branches.length === 0} className="px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {loading ? 'Posting...' : <><Plus size={18} /> Post Job</>}
          </button>
        </div>
      </form>
      
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.message}
        </div>
      )}
    </div>
  );
}

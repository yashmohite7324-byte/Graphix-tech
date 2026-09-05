import React, { useState } from 'react';
import { Briefcase, MapPin, DollarSign, Calendar, CheckCircle, Plus } from 'lucide-react';

export default function RecruiterPostJobPage() {
  const [branches, setBranches] = useState<string[]>([]);
  
  const toggleBranch = (branch: string) => {
    setBranches(prev => prev.includes(branch) ? prev.filter(b => b !== branch) : [...prev, branch]);
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Job posted (mock API call to /recruiter/jobs)');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Briefcase className="w-6 h-6 text-brand-600" /> Post a New Job</h1>
      
      <form onSubmit={handlePostJob} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
            <input type="text" className="w-full border-slate-300 rounded-md p-2 border" placeholder="Software Engineer" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
            <select className="w-full border-slate-300 rounded-md p-2 border" required>
              <option>Full-time</option>
              <option>Internship</option>
              <option>Contract</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <div className="flex relative">
              <span className="absolute left-3 top-2.5 text-slate-400"><MapPin size={18} /></span>
              <input type="text" className="w-full border-slate-300 rounded-md p-2 pl-10 border" placeholder="e.g. Remote, NY" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Package (LPA)</label>
            <div className="flex relative">
              <span className="absolute left-3 top-2.5 text-slate-400"><DollarSign size={18} /></span>
              <input type="number" className="w-full border-slate-300 rounded-md p-2 pl-10 border" placeholder="e.g. 12" required />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea rows={4} className="w-full border-slate-300 rounded-md p-2 border" placeholder="Job responsibilities..." required></textarea>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold mb-4">Eligibility Criteria</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Eligible Branches</label>
            <div className="flex flex-wrap gap-2">
              {['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'].map(branch => (
                <button
                  key={branch}
                  type="button"
                  onClick={() => toggleBranch(branch)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    branches.includes(branch) 
                      ? 'bg-brand-100 text-brand-700 border-brand-200 border'
                      : 'bg-slate-100 text-slate-600 border-slate-200 border hover:bg-slate-200'
                  }`}
                >
                  {branch}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Minimum CGPA</label>
              <input type="number" step="0.1" className="w-full border-slate-300 rounded-md p-2 border" placeholder="e.g. 7.5" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Maximum Active Backlogs</label>
              <input type="number" className="w-full border-slate-300 rounded-md p-2 border" placeholder="e.g. 0" required />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-md border border-slate-200 flex flex-wrap gap-3 items-center text-sm text-slate-600">
          <span className="font-semibold text-slate-800 mr-2">Preview Eligibility:</span>
          {branches.length > 0 ? (
            branches.map(b => <span key={b} className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded text-xs">{b}</span>)
          ) : (
            <span className="italic">No branches selected</span>
          )}
          <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500" /> Min CGPA: 7.5</span>
          <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500" /> Max Backlogs: 0</span>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 font-medium flex items-center gap-2">
            <Plus size={18} /> Post Job
          </button>
        </div>
      </form>
    </div>
  );
}

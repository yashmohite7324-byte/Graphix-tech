import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api';
import { GraduationCap, Eye, EyeOff, Loader2, Briefcase, ShieldCheck, Mail, Lock, Sun, Moon, Info } from 'lucide-react';
import BackgroundStorm from '../../components/BackgroundStorm';

type RoleTab = 'STUDENT' | 'RECRUITER' | 'ADMIN';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RoleTab>('STUDENT');
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');

  // Toggle Global Dark Mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(form);
      const { accessToken, refreshToken, role, email } = res.data.data;
      login(accessToken, refreshToken, role, email);
      const routes: Record<string, string> = {
        STUDENT: '/student/dashboard',
        RECRUITER: '/recruiter/dashboard',
        PLACEMENT_ADMIN: '/admin/dashboard',
        SUPER_ADMIN: '/admin/dashboard',
        TRAINER: '/trainer/dashboard',
      };
      navigate(routes[role] || '/student/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const colorThemeMap: Record<RoleTab, 'blue' | 'orange' | 'purple'> = {
    STUDENT: 'blue',
    RECRUITER: 'orange',
    ADMIN: 'purple'
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#080503] transition-colors duration-1000 relative">
      
      {/* Immersive WebGL Particle Storm Background */}
      <BackgroundStorm colorTheme={colorThemeMap[activeTab]} />

      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md shadow-lg border border-white/20 text-white hover:scale-110 hover:bg-white/20 transition-all"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Left branding panel (Half screen) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white relative z-10 transition-all duration-1000">
        <div className="relative flex flex-col items-center animate-fadeIn">
          {/* 2D Moving Polish Logo Animation (Floating) */}
          <div className="relative w-96 h-64 mb-8 animate-float cursor-pointer group">
             {/* Glowing Aura */}
             <div className={`absolute -inset-4 rounded-[2rem] bg-gradient-to-tr blur-3xl opacity-50 group-hover:opacity-80 transition-all duration-1000 ${activeTab === 'STUDENT' ? 'from-blue-600 to-indigo-500' : activeTab === 'RECRUITER' ? 'from-orange-500 to-amber-500' : 'from-purple-600 to-pink-500'}`}></div>
             {/* 2D Floating Logo Container */}
             <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 p-2 shadow-2xl">
               <img src="/graphix-logo-final.jpg" alt="Graphix Infotech Logo" className="w-full h-full object-contain rounded-xl" />
             </div>
          </div>
          
          <div className="text-center max-w-md mt-2">
            <h1 className="text-3xl font-extrabold leading-tight mb-3 text-[#fff6ec] drop-shadow-lg transition-all duration-500 font-display">
              Compute scaled in the void.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed font-light transition-all duration-500">
              Welcome to Graphix TechHire. Orchestrating hyperscale infrastructure for your career.
            </p>
          </div>
        </div>

        <div className="absolute bottom-12 left-12 right-12 flex justify-between text-sm text-slate-500 font-medium">
          <span>© 2026 Graphix Infotech Pvt Ltd.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#fff1e2] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#fff1e2] transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* Right login form (Half screen) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10 transition-colors duration-500 overflow-hidden">
        
        {/* Shrunk to max-w-sm (small form) */}
        <div className="w-full max-w-sm animate-fadeIn relative z-10" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[1.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.4)] border border-white/50 dark:border-slate-700/50 p-6 sm:p-8 transition-colors duration-500">
            
            <div className="mb-6 text-center">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold mb-3 transition-colors ${
                activeTab === 'STUDENT' ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' :
                activeTab === 'RECRUITER' ? 'bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400' :
                'bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-400'
              }`}>
                {activeTab === 'STUDENT' && <GraduationCap size={12} />}
                {activeTab === 'RECRUITER' && <Briefcase size={12} />}
                {activeTab === 'ADMIN' && <ShieldCheck size={12} />}
                {activeTab}
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {activeTab === 'STUDENT' ? 'Welcome back' : activeTab === 'RECRUITER' ? 'Welcome, Partner' : 'Welcome, Admin'}
              </h2>
            </div>

            {/* Role Tabs */}
            <div className="flex p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl mb-6 shadow-inner transition-colors duration-500">
              <button onClick={() => setActiveTab('STUDENT')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'STUDENT' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                <GraduationCap size={14} /> Student
              </button>
              <button onClick={() => setActiveTab('RECRUITER')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'RECRUITER' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                <Briefcase size={14} /> Recruiter
              </button>
              <button onClick={() => setActiveTab('ADMIN')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'ADMIN' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                <ShieldCheck size={14} /> Admin
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 animate-fadeIn transition-colors duration-500">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail size={16} className={`transition-colors ${activeTab === 'STUDENT' ? 'group-focus-within:text-blue-500' : activeTab === 'RECRUITER' ? 'group-focus-within:text-orange-500' : 'group-focus-within:text-purple-500'} text-slate-400 dark:text-slate-500`} />
                  </div>
                  <input
                    type="email"
                    className={`w-full pl-10 pr-4 py-3 text-sm font-medium bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:border-transparent transition-all duration-300 placeholder:font-normal ${activeTab === 'STUDENT' ? 'focus:ring-blue-500/20 border-blue-100 dark:border-blue-900/30 focus:border-blue-500' : activeTab === 'RECRUITER' ? 'focus:ring-orange-500/20 border-orange-100 dark:border-orange-900/30 focus:border-orange-500' : 'focus:ring-purple-500/20 border-purple-100 dark:border-purple-900/30 focus:border-purple-500'}`}
                    placeholder="Email Address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock size={16} className={`transition-colors ${activeTab === 'STUDENT' ? 'group-focus-within:text-blue-500' : activeTab === 'RECRUITER' ? 'group-focus-within:text-orange-500' : 'group-focus-within:text-purple-500'} text-slate-400 dark:text-slate-500`} />
                  </div>
                  <input
                    type={show ? 'text' : 'password'}
                    className={`w-full pl-10 pr-10 py-3 text-sm font-medium bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:border-transparent transition-all duration-300 placeholder:font-normal ${activeTab === 'STUDENT' ? 'focus:ring-blue-500/20 border-blue-100 dark:border-blue-900/30 focus:border-blue-500' : activeTab === 'RECRUITER' ? 'focus:ring-orange-500/20 border-orange-100 dark:border-orange-900/30 focus:border-orange-500' : 'focus:ring-purple-500/20 border-purple-100 dark:border-purple-900/30 focus:border-purple-500'}`}
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <a href="#" className={`text-[11px] font-semibold transition-colors hover:underline ${activeTab === 'STUDENT' ? 'text-blue-600 dark:text-blue-400' : activeTab === 'RECRUITER' ? 'text-orange-600 dark:text-orange-400' : 'text-purple-600 dark:text-purple-400'}`}>Forgot password?</a>
                </div>
              </div>

              {activeTab === 'STUDENT' && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40">
                  <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-800 dark:text-blue-300 font-medium leading-tight">
                    Services of this portal are free for institute candidates only.
                  </p>
                </div>
              )}
              {activeTab === 'RECRUITER' && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-50/80 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/40">
                  <Info size={16} className="text-orange-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-orange-800 dark:text-orange-300 font-medium leading-tight">
                    Recruiter services are paid. Please refer to our pricing structure for access.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full relative overflow-hidden group flex items-center justify-center gap-2 py-3 text-sm font-bold text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98] mt-3 ${
                  activeTab === 'STUDENT' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30 hover:shadow-blue-500/40' :
                  activeTab === 'RECRUITER' ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/30 hover:shadow-orange-500/40' :
                  'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/30 hover:shadow-purple-500/40'
                }`}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <span className="relative flex items-center gap-2">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {loading ? 'Authenticating...' : `Sign in`}
                </span>
              </button>
            </form>

            {activeTab === 'STUDENT' && (
              <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                  Register
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

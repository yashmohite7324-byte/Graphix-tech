import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';
import { GraduationCap, Briefcase, ShieldCheck, Loader2, Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle, KeyRound, Phone } from 'lucide-react';
import './SlidingAuthCard.css';

type RoleTab = 'STUDENT' | 'RECRUITER' | 'ADMIN';

export const SlidingAuthCard = () => {
  // Start default view on LOGIN so users immediately see Sign In
  const [activeView, setActiveView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<RoleTab>('STUDENT');
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', mobile: '', password: '', role: 'STUDENT' });
  
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otpTarget, setOtpTarget] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const toggleView = () => {
    setError('');
    setSuccessMsg('');
    setRequiresOtp(false);
    setActiveView(activeView === 'login' ? 'register' : 'login');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await authApi.login(loginForm);
      const { accessToken, refreshToken, role, email, name, designation, companyName } = res.data.data;
      
      if (accessToken && accessToken.startsWith('REQUIRES_OTP:')) {
        const target = accessToken.replace('REQUIRES_OTP:', '');
        setRequiresOtp(true);
        setOtpTarget(target);
        setSuccessMsg(`Twilio SMS OTP code sent to ${target}. Please enter the 6-digit code.`);
        return;
      }

      login(accessToken, refreshToken, role, email, name, designation, companyName);
      
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

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await authApi.verifyOtp({ email: loginForm.email, otp: otpCode });
      const { accessToken, refreshToken, role, email, name, designation, companyName } = res.data.data;
      login(accessToken, refreshToken, role, email, name, designation, companyName);
      
      const routes: Record<string, string> = {
        STUDENT: '/student/dashboard',
        RECRUITER: '/recruiter/dashboard',
        PLACEMENT_ADMIN: '/admin/dashboard',
        SUPER_ADMIN: '/admin/dashboard',
        TRAINER: '/trainer/dashboard',
      };
      navigate(routes[role] || '/student/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await authApi.register(registerForm);
      setSuccessMsg(res.data.data || 'Registration successful. Twilio SMS OTP code sent to your mobile phone!');
      setLoginForm({ email: registerForm.email, password: registerForm.password });
      setRequiresOtp(true);
      setOtpTarget(registerForm.mobile || registerForm.email);
      setActiveTab(registerForm.role as RoleTab);
      setActiveView('login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const themeClass = activeTab === 'STUDENT' ? 'theme-student' : activeTab === 'RECRUITER' ? 'theme-recruiter' : 'theme-admin';
  const roleColor = activeTab === 'STUDENT' ? 'from-blue-600 to-indigo-600' : activeTab === 'RECRUITER' ? 'from-amber-500 to-orange-600' : 'from-purple-600 to-violet-600';
  const focusBorderColor = activeTab === 'STUDENT' ? 'focus:border-blue-500 focus:ring-blue-500/20' : activeTab === 'RECRUITER' ? 'focus:border-orange-500 focus:ring-orange-500/20' : 'focus:border-purple-500 focus:ring-purple-500/20';

  return (
    <div className="sliding-card-container bg-white/95 dark:bg-slate-900/90 border-white/60 dark:border-slate-700/60 transition-colors duration-500">
      
      {/* Sliding Hero Cover Panel */}
      <div className={`sliding-card-bg ${activeView === 'login' ? 'is-login' : ''} ${themeClass}`}>
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 opacity-80">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/90">
            <Sparkles size={14} /> Graphix Infotech
          </div>
        </div>
      </div>

      {/* Hero Panel 1 (Shown when activeView === 'register') -> Prompts SIGN IN */}
      <div className={`sliding-hero register ${activeView === 'register' ? 'active' : ''}`}>
        <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-1 shadow-inner">
          <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
        </div>
        <h2>Already Registered?</h2>
        <p>Sign in with your credentials or OTP to access your personalized placement dashboard.</p>
        <button type="button" className="sliding-hero-btn group flex items-center gap-2" onClick={toggleView}>
          SIGN IN <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Form Panel 1: Register Form */}
      <div className={`sliding-form register ${activeView === 'register' ? 'active' : ''}`}>
        
        {/* Graphix Infotech Official Logo Header */}
        <div className="w-full text-center mb-1">
          <div className="inline-block p-1 rounded-xl bg-white shadow-sm border border-slate-200/80 mb-0.5">
            <img 
              src="/graphix-form-logo.png" 
              onError={(e) => { (e.target as HTMLImageElement).src = '/graphix-logo-final.jpg'; }}
              alt="Graphix Infotech Logo" 
              className="h-7 sm:h-8 w-auto object-contain mx-auto" 
            />
          </div>
          <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">Create Account</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Join the enterprise placement platform</p>
        </div>

        {error && (
          <div className="w-full mb-1.5 p-1.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-xl text-[11px] font-medium text-red-600 dark:text-red-400 text-center animate-fadeIn">
            {error}
          </div>
        )}
        
        <form onSubmit={handleRegisterSubmit} className="w-full space-y-2">
          {/* Role selector for registration */}
          <div className="flex w-full p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => setRegisterForm({ ...registerForm, role: 'STUDENT' })}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${registerForm.role === 'STUDENT' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400'}`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRegisterForm({ ...registerForm, role: 'RECRUITER' })}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${registerForm.role === 'RECRUITER' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-400'}`}
            >
              Recruiter
            </button>
          </div>

          <div className="glass-input-wrapper">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User size={14} />
            </div>
            <input 
              type="text" 
              placeholder="Full Name" 
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              className={`glass-input text-xs py-1.5 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 text-slate-900 dark:text-white focus:ring-4 ${focusBorderColor}`} 
              required 
            />
          </div>

          <div className="glass-input-wrapper">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail size={14} />
            </div>
            <input 
              type="email" 
              placeholder="Email Address" 
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              autoComplete="off"
              className={`glass-input text-xs py-1.5 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 text-slate-900 dark:text-white focus:ring-4 ${focusBorderColor}`} 
              required 
            />
          </div>

          <div className="glass-input-wrapper">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone size={14} />
            </div>
            <input 
              type="tel" 
              placeholder="Mobile Number (Optional)" 
              value={registerForm.mobile}
              onChange={(e) => setRegisterForm({ ...registerForm, mobile: e.target.value })}
              autoComplete="off"
              className={`glass-input text-xs py-1.5 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 text-slate-900 dark:text-white focus:ring-4 ${focusBorderColor}`} 
            />
          </div>

          <div className="glass-input-wrapper">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={14} />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              autoComplete="new-password"
              className={`glass-input text-xs py-1.5 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 text-slate-900 dark:text-white focus:ring-4 ${focusBorderColor}`} 
              required 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-2 mt-0.5 text-xs font-extrabold text-white rounded-xl bg-gradient-to-r ${roleColor} shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2`}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {loading ? 'REGISTERING...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p className="mt-2 text-center text-[10px] text-slate-400 dark:text-slate-500">
          By signing up, you agree to our Terms & Privacy Policy
        </p>
      </div>

      {/* Hero Panel 2 (Shown when activeView === 'login') -> Prompts SIGN UP */}
      <div className={`sliding-hero login ${activeView === 'login' ? 'active' : ''}`}>
        <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-1 shadow-inner">
          <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
        </div>
        <h2>New Here?</h2>
        <p>Discover opportunities, orchestrate your career, and connect with top recruiters seamlessly.</p>
        <button type="button" className="sliding-hero-btn group flex items-center gap-2" onClick={toggleView}>
          SIGN UP <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Form Panel 2: Login Form (Default view on load) */}
      <div className={`sliding-form login ${activeView === 'login' ? 'active' : ''}`}>
        
        {/* Graphix Infotech Official Logo Header */}
        <div className="w-full text-center mb-1.5">
          <div className="inline-block p-1 rounded-xl bg-white shadow-sm border border-slate-200/80 mb-1">
            <img 
              src="/graphix-form-logo.png" 
              onError={(e) => { (e.target as HTMLImageElement).src = '/graphix-logo-final.jpg'; }}
              alt="Graphix Infotech Logo" 
              className="h-6 sm:h-8 w-auto object-contain mx-auto" 
            />
          </div>
          <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider text-center block">
            Innovate | Build | Grow Together
          </div>
          <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-1">Welcome Back</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Select your role to access your portal</p>
        </div>

        {/* Role Tabs Selector */}
        <div className="flex w-full p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-3 border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
          <button 
            type="button" 
            onClick={() => setActiveTab('STUDENT')} 
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-xl transition-all duration-300 ${
              activeTab === 'STUDENT' 
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md scale-[1.02]' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap size={14} className="shrink-0" /> <span>Student</span>
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('RECRUITER')} 
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-xl transition-all duration-300 ${
              activeTab === 'RECRUITER' 
                ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-md scale-[1.02]' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Briefcase size={14} className="shrink-0" /> <span>Recruiter</span>
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('ADMIN')} 
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-xl transition-all duration-300 ${
              activeTab === 'ADMIN' 
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-md scale-[1.02]' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck size={14} className="shrink-0" /> <span>Admin</span>
          </button>
        </div>

        {error && (
          <div className="w-full mb-2 p-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 text-center animate-fadeIn">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="w-full mb-2 p-2 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/80 rounded-xl text-xs font-medium text-green-700 dark:text-green-300 text-center animate-fadeIn flex items-center justify-center gap-1.5">
            <CheckCircle size={14} className="text-green-500 shrink-0" /> {successMsg}
          </div>
        )}

        {!requiresOtp ? (
          /* Clean Standard Email / Password Login Form */
          <form onSubmit={handleLoginSubmit} className="w-full space-y-2.5">
            <div className="glass-input-wrapper">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                autoComplete="off"
                className={`glass-input bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 text-slate-900 dark:text-white focus:ring-4 ${focusBorderColor}`}
                required
              />
            </div>

            <div className="glass-input-wrapper">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                autoComplete="new-password"
                className={`glass-input bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 text-slate-900 dark:text-white focus:ring-4 ${focusBorderColor}`}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex justify-end pt-0.5">
              <a href="#" className={`text-xs font-semibold hover:underline transition-colors ${
                activeTab === 'STUDENT' ? 'text-blue-600 dark:text-blue-400' :
                activeTab === 'RECRUITER' ? 'text-orange-600 dark:text-orange-400' :
                'text-purple-600 dark:text-purple-400'
              }`}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 mt-1 flex items-center justify-center gap-2 text-xs font-extrabold text-white rounded-xl bg-gradient-to-r ${roleColor} shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 disabled:opacity-70`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'SENDING TWILIO OTP...' : 'SIGN IN'}
            </button>
          </form>
        ) : (
          /* Twilio SMS OTP Code Verification Form */
          <form onSubmit={handleVerifyOtpSubmit} className="w-full space-y-3 animate-fadeIn">
            <div className="text-center text-xs font-semibold text-slate-300 dark:text-slate-300 mb-1">
              Twilio SMS OTP sent to <span className="text-indigo-400 font-bold">{otpTarget}</span>
            </div>
            <div className="glass-input-wrapper">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound size={16} />
              </div>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-Digit OTP Code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className={`glass-input bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 text-slate-900 dark:text-white tracking-widest text-center font-mono focus:ring-4 ${focusBorderColor}`}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 4}
              className={`w-full py-2.5 mt-1 flex items-center justify-center gap-2 text-xs font-extrabold text-white rounded-xl bg-gradient-to-r ${roleColor} shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 disabled:opacity-50`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'VERIFYING OTP...' : 'VERIFY TWILIO SMS OTP & SIGN IN'}
            </button>

            <button
              type="button"
              onClick={() => setRequiresOtp(false)}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 pt-1"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

      </div>

    </div>
  );
};

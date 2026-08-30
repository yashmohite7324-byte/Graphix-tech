import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api';
import { GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative">
        <div className="absolute inset-0">
          <img src="/login-bg.jpg" alt="Login Illustration" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-brand-900/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-lg leading-none">Graphix CareerHub</p>
            <p className="text-sm text-slate-300 mt-0.5">Placement Management Platform</p>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Your career journey<br />starts here.
          </h1>
          <p className="text-slate-200 text-lg leading-relaxed max-w-md">
            Connect students with top companies. Manage placements, training, and recruitment — all in one platform.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
          {[
            { label: 'Students', value: '2,400+' },
            { label: 'Companies', value: '180+' },
            { label: 'Placements', value: '1,200+' },
            { label: 'Avg Package', value: '₹8.2L' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-slate-200 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-8">
              <div className="lg:hidden flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                  <GraduationCap size={16} className="text-white" />
                </div>
                <span className="font-bold text-slate-900">CareerHub</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@graphix.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5 text-base"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-600 font-medium hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

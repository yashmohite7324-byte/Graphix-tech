import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api';
import { GraduationCap, Loader2, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [form, setForm] = useState({ email: '', mobile: '', password: '', role: 'STUDENT' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authApi.register(form);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authApi.verifyOtp({ email: form.email, otp });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative">
        <div className="absolute inset-0">
          <img src="/signup-bg.jpg" alt="Signup Illustration" className="w-full h-full object-cover" />
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
            Accelerate your career<br />growth today.
          </h1>
          <p className="text-slate-200 text-lg leading-relaxed max-w-md">
            Join thousands of students and top recruiters. Discover opportunities and build your professional future.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
          {[
            { label: 'Top Companies', value: 'Google, Microsoft' },
            { label: 'Highest Package', value: '₹24L' },
            { label: 'Success Rate', value: '94%' },
            { label: 'Active Jobs', value: '300+' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-sm text-slate-200 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right register form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-8">
              <div className="lg:hidden flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                  <GraduationCap size={16} className="text-white" />
                </div>
                <span className="font-bold text-slate-900">CareerHub</span>
              </div>
            </div>

            {step === 'register' ? (
              <>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Create account</h2>
                <p className="text-sm text-slate-500 mb-6">Join Graphix Technologies Institute's placement platform</p>

                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="label">I am a</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['STUDENT', 'RECRUITER'].map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setForm({ ...form, role })}
                          className={`py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                            form.role === role
                              ? 'bg-brand-500 text-white border-brand-500'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {role === 'STUDENT' ? '🎓 Student' : '🏢 Recruiter'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label">Email address</label>
                    <input className="input" type="email" placeholder="you@graphix.edu"
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Mobile number</label>
                    <input className="input" type="tel" placeholder="9876543210"
                      value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <input className="input" type="password" placeholder="Choose a strong password"
                      value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 text-base">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                    {loading ? 'Registering…' : 'Create account'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle size={28} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Check your inbox</h2>
                  <p className="text-sm text-slate-500">
                    We sent a 6-digit OTP to <span className="font-medium text-slate-700">{form.email}</span>.<br/>
                  </p>
                </div>

                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

                <form onSubmit={handleOtp} className="space-y-4">
                  <div>
                    <label className="label">Enter OTP</label>
                    <input className="input text-center text-2xl tracking-widest font-bold" type="text"
                      placeholder="000000" maxLength={6}
                      value={otp} onChange={(e) => setOtp(e.target.value)} required />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 text-base">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                    {loading ? 'Verifying…' : 'Verify OTP'}
                  </button>
                </form>
              </>
            )}

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

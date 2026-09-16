import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Loader2, CheckCircle, Lock, Zap, Star, Shield } from 'lucide-react';

export default function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const { data: accessRes, isLoading, refetch } = useQuery({
    queryKey: ['my-access'],
    queryFn: () => api.get('/subscription/my-access'),
  });

  const initiateMutation = useMutation({
    mutationFn: () => api.post('/subscription/initiate-payment', { paymentMethod: 'RAZORPAY' }),
    onSuccess: async (res) => {
      const order = res.data.data;
      // In production load Razorpay checkout script and open modal here.
      // For now simulate a success payment:
      const confirm = await api.post('/subscription/confirm-payment', {
        gatewayPaymentId: 'pay_mock_' + Date.now(),
        gatewayOrderId: order.orderId,
        transactionId: order.transactionId?.toString(),
      });
      await refetch();
      setPaying(false);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
      setPaying(false);
    },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-indigo-500" />
    </div>
  );

  const access = accessRes?.data?.data;

  // Has active access — show the portal
  if (access?.hasAccess) return <>{children}</>;

  // Graphix student but access not yet granted — show pending state
  if (access?.tier === 'GRAPHIX_STUDENT') return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-amber-500" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Access Pending</h2>
        <p className="text-slate-500 text-sm">
          Your Graphix Institute enrollment is being verified. The admin will grant you free access shortly.
        </p>
      </div>
    </div>
  );

  // External student — show paywall
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Lock banner */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
            <Lock size={36} />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Portal Access Required</h1>
          <p className="text-slate-400">
            You're not enrolled at Graphix Technologies Institute.<br />
            Purchase a plan to access the placement portal.
          </p>
        </div>

        {/* Plan card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Plan header */}
          <div className="p-6 text-center"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
            <p className="text-indigo-200 text-sm font-semibold mb-1">External Student Plan</p>
            <div className="flex items-end justify-center gap-2">
              <span className="text-5xl font-black text-white">₹1,099</span>
              <span className="text-indigo-200 text-sm mb-2">/ year</span>
            </div>
            <p className="text-indigo-100 text-sm mt-2">Full access for 1 year</p>
          </div>

          {/* Features */}
          <div className="p-6">
            <div className="space-y-3 mb-6">
              {[
                'Access to all job postings from 10+ companies',
                'Apply directly to recruiters',
                'AI Resume Scoring & Analysis',
                'Application status tracking',
                'Interview schedule notifications',
                'Job recommendations based on your profile',
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{f}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={() => { setPaying(true); initiateMutation.mutate(); }}
              disabled={paying || initiateMutation.isPending}
              className="w-full py-4 rounded-2xl text-white font-black text-lg transition-all disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
              }}>
              {paying || initiateMutation.isPending
                ? <span className="flex items-center justify-center gap-2"><Loader2 size={20} className="animate-spin" /> Processing...</span>
                : '🔓 Pay ₹1,099 & Get Access'
              }
            </button>

            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Shield size={12} /> Secure Payment</span>
              <span className="flex items-center gap-1"><Zap size={12} /> Instant Access</span>
              <span className="flex items-center gap-1"><Star size={12} /> 1 Year Valid</span>
            </div>

            <p className="text-xs text-slate-400 text-center mt-4">
              Already a Graphix Institute student?{' '}
              <a href="mailto:admin@graphixtechnologies.com" className="text-indigo-500 hover:underline">
                Contact admin for free access
              </a>
            </p>
          </div>
        </div>

        {/* Institute branding */}
        <p className="text-center text-slate-500 text-xs mt-4">
          Powered by Graphix Technologies Institute CareerHub
        </p>
      </div>
    </div>
  );
}

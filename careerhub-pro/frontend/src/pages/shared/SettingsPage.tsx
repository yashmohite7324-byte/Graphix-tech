import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import {
  User, Lock, Bell, Shield, Trash2, Save, Loader2,
  CheckCircle, AlertCircle, Eye, EyeOff, Mail, Phone, Smartphone
} from 'lucide-react';

type Tab = 'profile' | 'security' | 'notifications' | 'danger';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('profile');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const show = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ─── Profile form ───────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api.patch('/users/me', data),
    onSuccess: () => { show('Profile updated successfully'); queryClient.invalidateQueries(); },
    onError: (e: any) => show(e.response?.data?.error || 'Update failed', 'error'),
  });

  // ─── Password form ──────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => api.post('/auth/change-password', data),
    onSuccess: () => {
      show('Password changed successfully');
      setPwForm({ current: '', next: '', confirm: '' });
    },
    onError: (e: any) => show(e.response?.data?.error || 'Password change failed', 'error'),
  });

  const handlePasswordChange = () => {
    if (pwForm.next !== pwForm.confirm) {
      show('New passwords do not match', 'error');
      return;
    }
    if (pwForm.next.length < 8) {
      show('Password must be at least 8 characters', 'error');
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: pwForm.current,
      newPassword: pwForm.next,
    });
  };

  // ─── Notification prefs ─────────────────────────────────────
  const [notifPrefs, setNotifPrefs] = useState({
    emailApplications: true,
    emailInterviews: true,
    emailJobAlerts: true,
    smsInterviews: true,
    smsUrgent: true,
    inAppAll: true,
  });

  const saveNotifMutation = useMutation({
    mutationFn: (data: any) => api.patch('/users/notification-preferences', data),
    onSuccess: () => show('Notification preferences saved'),
    onError: () => show('Could not save preferences', 'error'),
  });

  const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: 'profile',       label: 'Profile',       icon: User },
    { key: 'security',      label: 'Security',      icon: Lock },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'danger',        label: 'Account',       icon: Shield },
  ];

  const ROLE_LABELS: Record<string, string> = {
    STUDENT: 'Student',
    RECRUITER: 'Recruiter',
    PLACEMENT_ADMIN: 'Placement Admin',
    SUPER_ADMIN: 'Super Admin',
    TRAINER: 'Trainer',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">

      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold text-white ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Manage your account, security, and notification preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* Tab sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 space-y-0.5">
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}>
                  <Icon size={16} className={active ? 'text-indigo-600' : 'text-slate-400'} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="lg:col-span-3 space-y-5">

          {/* ─── Profile Tab ─── */}
          {tab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-50">
                <h2 className="font-bold text-slate-900 text-sm">Profile Information</h2>
                <p className="text-xs text-slate-400 mt-0.5">Your basic account details</p>
              </div>
              <div className="p-5 space-y-4">

                {/* Read-only info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1 truncate">{user?.email}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Role</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {ROLE_LABELS[user?.role || ''] || user?.role}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Your full name" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      value={profileForm.mobile}
                      onChange={e => setProfileForm({ ...profileForm, mobile: e.target.value })}
                      placeholder="9876543210" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Used for OTP verification and SMS alerts</p>
                </div>

                <button onClick={() => updateProfileMutation.mutate(profileForm)}
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg transition-all disabled:opacity-60">
                  {updateProfileMutation.isPending
                    ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
                    : <><Save size={15} /> Save Changes</>}
                </button>
              </div>
            </div>
          )}

          {/* ─── Security Tab ─── */}
          {tab === 'security' && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-50">
                  <h2 className="font-bold text-slate-900 text-sm">Change Password</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Use a strong password with 8+ characters</p>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { key: 'current', label: 'Current Password' },
                    { key: 'next',    label: 'New Password' },
                    { key: 'confirm', label: 'Confirm New Password' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        {f.label}
                      </label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showPw ? 'text' : 'password'}
                          className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          value={(pwForm as any)[f.key]}
                          onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                          placeholder="••••••••" />
                        {f.key === 'current' && (
                          <button type="button" onClick={() => setShowPw(s => !s)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Password strength hint */}
                  {pwForm.next && (
                    <div className="flex gap-1.5">
                      {[
                        pwForm.next.length >= 8,
                        /[A-Z]/.test(pwForm.next),
                        /[0-9]/.test(pwForm.next),
                        /[^A-Za-z0-9]/.test(pwForm.next),
                      ].map((ok, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${ok ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                  )}

                  <button onClick={handlePasswordChange}
                    disabled={!pwForm.current || !pwForm.next || changePasswordMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg transition-all disabled:opacity-50">
                    {changePasswordMutation.isPending
                      ? <><Loader2 size={15} className="animate-spin" /> Updating...</>
                      : <><Lock size={15} /> Change Password</>}
                  </button>
                </div>
              </div>

              {/* Session info */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 text-sm mb-3">Active Session</h3>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Smartphone size={17} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-800">This device</p>
                    <p className="text-xs text-emerald-600">Signed in now • Session active</p>
                  </div>
                  <button onClick={logout}
                    className="text-xs font-bold text-red-600 bg-white hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition-colors">
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Notifications Tab ─── */}
          {tab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-50">
                <h2 className="font-bold text-slate-900 text-sm">Notification Preferences</h2>
                <p className="text-xs text-slate-400 mt-0.5">Choose how you want to be notified</p>
              </div>
              <div className="p-5 space-y-5">

                {/* Email */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Mail size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email</span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { key: 'emailApplications', label: 'Application status updates', desc: 'When your application moves to a new stage' },
                      { key: 'emailInterviews',   label: 'Interview invitations',      desc: 'When an interview is scheduled for you' },
                      { key: 'emailJobAlerts',    label: 'New job alerts',             desc: 'When a matching job is posted' },
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                        <input type="checkbox"
                          checked={(notifPrefs as any)[item.key]}
                          onChange={e => setNotifPrefs({ ...notifPrefs, [item.key]: e.target.checked })}
                          className="w-4 h-4 rounded accent-indigo-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{item.label}</p>
                          <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* SMS */}
                <div className="pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Phone size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">SMS</span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { key: 'smsInterviews', label: 'Interview reminders', desc: 'SMS 1 day before your interview' },
                      { key: 'smsUrgent',     label: 'Urgent alerts',       desc: 'Deadline warnings and offers' },
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                        <input type="checkbox"
                          checked={(notifPrefs as any)[item.key]}
                          onChange={e => setNotifPrefs({ ...notifPrefs, [item.key]: e.target.checked })}
                          className="w-4 h-4 rounded accent-indigo-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{item.label}</p>
                          <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button onClick={() => saveNotifMutation.mutate(notifPrefs)}
                  disabled={saveNotifMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg transition-all disabled:opacity-60">
                  {saveNotifMutation.isPending
                    ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
                    : <><Save size={15} /> Save Preferences</>}
                </button>
              </div>
            </div>
          )}

          {/* ─── Danger Tab ─── */}
          {tab === 'danger' && (
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-red-50 bg-red-50/40">
                <h2 className="font-bold text-red-700 text-sm">Account Actions</h2>
                <p className="text-xs text-red-500 mt-0.5">These actions affect your account access</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Shield size={17} className="text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">Sign out of all devices</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Revokes all refresh tokens. You will need to log in again everywhere.
                    </p>
                  </div>
                  <button onClick={() => { api.post('/auth/logout-all').then(() => logout()); }}
                    className="flex-shrink-0 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors">
                    Sign out all
                  </button>
                </div>

                <div className="flex items-start gap-3 p-4 border border-red-200 rounded-xl bg-red-50/30">
                  <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Trash2 size={17} className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-700">Deactivate account</p>
                    <p className="text-xs text-red-500 mt-0.5">
                      Contact the placement office to deactivate your account. Your data will be retained per institute policy.
                    </p>
                  </div>
                  <a href="mailto:tpo@graphixtechnologies.com"
                    className="flex-shrink-0 text-xs font-bold text-red-600 bg-white hover:bg-red-50 px-3 py-2 rounded-lg border border-red-200 transition-colors">
                    Contact TPO
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

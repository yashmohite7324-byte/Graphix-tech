import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  LayoutDashboard, Briefcase, Users, Building2, ClipboardList,
  BarChart3, Bell, Settings, LogOut, ChevronRight, BookOpen,
  CheckSquare, FileText, MessageSquare, Award, TrendingUp,
  UserCircle, Search, X, Menu, Brain, Star, Megaphone,
  ShieldCheck, GraduationCap, Wallet, ChevronDown
} from 'lucide-react';

// ─── Nav config per role ──────────────────────────────────────
const NAV_CONFIG: Record<string, { label: string; icon: any; to: string; badge?: string }[]> = {
  STUDENT: [
    { label: 'Dashboard',       icon: LayoutDashboard, to: '/student/dashboard' },
    { label: 'Browse Jobs',     icon: Briefcase,       to: '/student/jobs' },
    { label: 'My Applications', icon: ClipboardList,   to: '/student/applications' },
    { label: 'Interviews',      icon: Users,           to: '/student/interviews' },
    { label: 'Training',        icon: BookOpen,        to: '/student/training' },
    { label: 'AI Resume Score', icon: Brain,           to: '/student/ai-score', badge: 'AI' },
    { label: 'Notifications',   icon: Bell,            to: '/student/notifications' },
    { label: 'My Profile',      icon: UserCircle,      to: '/student/profile' },
  ],
  RECRUITER: [
    { label: 'Dashboard',       icon: LayoutDashboard, to: '/recruiter/dashboard' },
    { label: 'Post a Job',      icon: Briefcase,       to: '/recruiter/post-job' },
    { label: 'Candidates',      icon: Users,           to: '/recruiter/candidates' },
    { label: 'Interviews',      icon: CheckSquare,     to: '/recruiter/interviews' },
    { label: 'Messages',        icon: MessageSquare,   to: '/recruiter/messages' },
  ],
  PLACEMENT_ADMIN: [
    { label: 'Dashboard',       icon: LayoutDashboard, to: '/admin/dashboard' },
    { label: 'Companies',       icon: Building2,       to: '/admin/companies' },
    { label: 'Students',        icon: GraduationCap,   to: '/admin/students' },
    { label: 'Jobs',            icon: Briefcase,       to: '/admin/jobs' },
    { label: 'Interviews',      icon: Users,           to: '/admin/interviews' },
    { label: 'Placements',      icon: Award,           to: '/admin/placements' },
    { label: 'Analytics',       icon: BarChart3,       to: '/admin/analytics' },
    { label: 'Announcements',   icon: Megaphone,       to: '/admin/announcements' },
    { label: 'Audit Log',       icon: ShieldCheck,     to: '/admin/audit' },
  ],
  SUPER_ADMIN: [
    { label: 'Dashboard',       icon: LayoutDashboard, to: '/admin/dashboard' },
    { label: 'Companies',       icon: Building2,       to: '/admin/companies' },
    { label: 'Students',        icon: GraduationCap,   to: '/admin/students' },
    { label: 'Jobs',            icon: Briefcase,       to: '/admin/jobs' },
    { label: 'Interviews',      icon: Users,           to: '/admin/interviews' },
    { label: 'Placements',      icon: Award,           to: '/admin/placements' },
    { label: 'Analytics',       icon: BarChart3,       to: '/admin/analytics' },
    { label: 'Announcements',   icon: Megaphone,       to: '/admin/announcements' },
    { label: 'Subscriptions',   icon: Wallet,          to: '/admin/subscriptions' },
    { label: 'Audit Log',       icon: ShieldCheck,     to: '/admin/audit' },
    { label: 'Settings',        icon: Settings,        to: '/admin/settings' },
  ],
  TRAINER: [
    { label: 'Dashboard',       icon: LayoutDashboard, to: '/trainer/dashboard' },
    { label: 'Attendance',      icon: CheckSquare,     to: '/trainer/attendance' },
    { label: 'Assessments',     icon: ClipboardList,   to: '/trainer/assessments' },
    { label: 'Students',        icon: Users,           to: '/trainer/students' },
  ],
};

const ROLE_COLORS: Record<string, { gradient: string; light: string; text: string }> = {
  STUDENT:          { gradient: 'from-indigo-600 to-violet-600',  light: 'bg-indigo-50',  text: 'text-indigo-700' },
  RECRUITER:        { gradient: 'from-blue-600 to-cyan-600',      light: 'bg-blue-50',    text: 'text-blue-700' },
  PLACEMENT_ADMIN:  { gradient: 'from-emerald-600 to-teal-600',   light: 'bg-emerald-50', text: 'text-emerald-700' },
  SUPER_ADMIN:      { gradient: 'from-slate-700 to-slate-900',    light: 'bg-slate-100',  text: 'text-slate-700' },
  TRAINER:          { gradient: 'from-amber-500 to-orange-600',   light: 'bg-amber-50',   text: 'text-amber-700' },
};

const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Student',
  RECRUITER: 'Recruiter',
  PLACEMENT_ADMIN: 'Placement Admin',
  SUPER_ADMIN: 'Super Admin',
  TRAINER: 'Trainer',
};

// ─── Notification Bell ────────────────────────────────────────
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => api.get('/notifications/unread-count'),
    refetchInterval: 30000,
  });

  const { data: notifData } = useQuery({
    queryKey: ['notifications-recent'],
    queryFn: () => api.get('/notifications?page=0&size=6'),
    enabled: open,
  });

  const markReadMutation = useMutation({
    mutationFn: () => api.post('/notifications/mark-all-read'),
    onSuccess: () => { /* refetch silently */ },
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const count = data?.data?.data ?? 0;
  const notifications = notifData?.data?.data?.content || [];

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
        <Bell size={17} className="text-slate-600" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-900">Notifications</span>
            {count > 0 && (
              <button onClick={() => markReadMutation.mutate()}
                className="text-xs text-indigo-600 hover:underline font-medium">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">No notifications yet</div>
            ) : notifications.map((n: any) => (
              <div key={n.id}
                className={`px-4 py-3 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-indigo-50/40' : ''}`}>
                <div className="flex gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.isRead ? 'bg-slate-200' : 'bg-indigo-500'}`} />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link to={`/student/notifications`}
            className="block text-center text-xs text-indigo-600 hover:underline font-semibold py-3 border-t border-slate-100">
            View all notifications →
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Main Layout ──────────────────────────────────────────────
export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const role = user?.role || 'STUDENT';
  const navItems = NAV_CONFIG[role] || [];
  const color = ROLE_COLORS[role] || ROLE_COLORS.STUDENT;

  // Get initials for avatar
  const initials = (user?.name || user?.email || 'U')
    .split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`p-5 bg-gradient-to-br ${color.gradient}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-black text-sm truncate">Graphix CareerHub</p>
            <p className="text-white/60 text-[10px] uppercase tracking-widest">
              {ROLE_LABELS[role]}
            </p>
          </div>
        </div>

        {/* User card in sidebar */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/25 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {user?.name || user?.email?.split('@')[0]}
            </p>
            <p className="text-white/60 text-[10px] truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = location.pathname === item.to ||
            (item.to !== '/' && location.pathname.startsWith(item.to));
          return (
            <Link key={item.to} to={item.to}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? `bg-gradient-to-r ${color.gradient} text-white shadow-lg`
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}>
              <Icon size={17} className={active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-white/25 text-white' : 'bg-indigo-100 text-indigo-700'
                }`}>{item.badge}</span>
              )}
              {active && <ChevronRight size={14} className="text-white/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Settings + Logout */}
      <div className="p-3 border-t border-slate-100 space-y-0.5">
        <Link to={`/${role.toLowerCase().replace('_', '-')}/settings`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <Settings size={16} className="text-slate-400" />
          Settings
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-100 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white flex flex-col lg:hidden shadow-2xl">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top navbar */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center px-4 gap-3 flex-shrink-0 z-30">
          {/* Mobile menu button */}
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
            <Menu size={18} className="text-slate-600" />
          </button>

          {/* Page breadcrumb */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 font-medium truncate">
              {navItems.find(n => location.pathname.startsWith(n.to))?.label || 'Home'}
            </p>
          </div>

          {/* Right: search, bell, avatar */}
          <div className="flex items-center gap-2">
            <NotificationBell />

            {/* User avatar + dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setUserMenuOpen(o => !o)}
                className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl ${color.light} hover:opacity-90 transition-opacity`}>
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color.gradient} flex items-center justify-center text-white text-xs font-black`}>
                  {initials}
                </div>
                <span className={`text-xs font-semibold ${color.text} hidden sm:block`}>
                  {user?.name || user?.email?.split('@')[0]}
                </span>
                <ChevronDown size={13} className={color.text} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-11 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden py-1">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <Link to={`/${role.toLowerCase().replace('_', '-')}/profile`}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                    <UserCircle size={15} className="text-slate-400" /> My Profile
                  </Link>
                  <Link to={`/${role.toLowerCase().replace('_', '-')}/settings`}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                    <Settings size={15} className="text-slate-400" /> Settings
                  </Link>
                  <div className="border-t border-slate-100 mt-1" />
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

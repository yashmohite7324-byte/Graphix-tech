import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Briefcase, Users, Bell, LogOut,
  GraduationCap, Building2, ClipboardList, BookOpen,
  ChevronLeft, ChevronRight, FileText, BarChart2,
  Calendar, CheckSquare, Settings, Menu
} from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  to: string;
}

const navByRole: Record<string, NavItem[]> = {
  STUDENT: [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', to: '/student/dashboard' },
    { icon: <Briefcase size={18} />, label: 'Browse Jobs', to: '/student/jobs' },
    { icon: <ClipboardList size={18} />, label: 'My Applications', to: '/student/applications' },
    { icon: <Calendar size={18} />, label: 'Interviews', to: '/student/interviews' },
    { icon: <BookOpen size={18} />, label: 'Training', to: '/student/training' },
    { icon: <CheckSquare size={18} />, label: 'Attendance', to: '/student/attendance' },
    { icon: <Users size={18} />, label: 'My Profile', to: '/student/profile' },
    { icon: <Bell size={18} />, label: 'Notifications', to: '/student/notifications' },
  ],
  RECRUITER: [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', to: '/recruiter/dashboard' },
    { icon: <Briefcase size={18} />, label: 'My Jobs', to: '/recruiter/jobs' },
    { icon: <ClipboardList size={18} />, label: 'Applications', to: '/recruiter/applications' },
    { icon: <Calendar size={18} />, label: 'Interviews', to: '/recruiter/interviews' },
    { icon: <Users size={18} />, label: 'Candidates', to: '/recruiter/candidates' },
    { icon: <Bell size={18} />, label: 'Notifications', to: '/recruiter/notifications' },
  ],
  PLACEMENT_ADMIN: [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', to: '/admin/dashboard' },
    { icon: <Users size={18} />, label: 'Students', to: '/admin/students' },
    { icon: <Building2 size={18} />, label: 'Companies', to: '/admin/companies' },
    { icon: <Briefcase size={18} />, label: 'Jobs', to: '/admin/jobs' },
    { icon: <ClipboardList size={18} />, label: 'Applications', to: '/admin/applications' },
    { icon: <Calendar size={18} />, label: 'Interviews', to: '/admin/interviews' },
    { icon: <GraduationCap size={18} />, label: 'Placements', to: '/admin/placements' },
    { icon: <BookOpen size={18} />, label: 'Training', to: '/admin/training' },
    { icon: <BarChart2 size={18} />, label: 'Analytics', to: '/admin/analytics' },
    { icon: <FileText size={18} />, label: 'Audit Log', to: '/admin/audit' },
    { icon: <Bell size={18} />, label: 'Announcements', to: '/admin/announcements' },
  ],
  SUPER_ADMIN: [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', to: '/admin/dashboard' },
    { icon: <Users size={18} />, label: 'Students', to: '/admin/students' },
    { icon: <Building2 size={18} />, label: 'Companies', to: '/admin/companies' },
    { icon: <Briefcase size={18} />, label: 'Jobs', to: '/admin/jobs' },
    { icon: <ClipboardList size={18} />, label: 'Applications', to: '/admin/applications' },
    { icon: <Calendar size={18} />, label: 'Interviews', to: '/admin/interviews' },
    { icon: <GraduationCap size={18} />, label: 'Placements', to: '/admin/placements' },
    { icon: <BookOpen size={18} />, label: 'Training', to: '/admin/training' },
    { icon: <BarChart2 size={18} />, label: 'Analytics', to: '/admin/analytics' },
    { icon: <FileText size={18} />, label: 'Audit Log', to: '/admin/audit' },
    { icon: <Settings size={18} />, label: 'Settings', to: '/admin/settings' },
  ],
  TRAINER: [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', to: '/trainer/dashboard' },
    { icon: <BookOpen size={18} />, label: 'Programs', to: '/trainer/programs' },
    { icon: <Users size={18} />, label: 'Batches', to: '/trainer/batches' },
    { icon: <CheckSquare size={18} />, label: 'Attendance', to: '/trainer/attendance' },
    { icon: <ClipboardList size={18} />, label: 'Assessments', to: '/trainer/assessments' },
    { icon: <Bell size={18} />, label: 'Announcements', to: '/trainer/announcements' },
  ],
};

const roleLabel: Record<string, string> = {
  STUDENT: 'Student Portal',
  RECRUITER: 'Recruiter Portal',
  PLACEMENT_ADMIN: 'T&P Office',
  SUPER_ADMIN: 'Super Admin',
  TRAINER: 'Trainer Portal',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = navByRole[user?.role || 'STUDENT'] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Sidebar = () => (
    <div className={`flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo */}
      {/* Animated 360 Rotating Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 ${collapsed ? 'justify-center' : ''}`}>
        <div className="relative w-11 h-11 flex-shrink-0 group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-500 via-indigo-500 to-purple-500 rounded-xl blur-md opacity-60 group-hover:opacity-100 animate-spin-slow transition-all duration-500"></div>
          <div className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center bg-white border border-white/50 p-1 z-10 shadow-lg animate-spin-slow">
            <img src="/graphix-logo-final.jpg" alt="Graphix Logo" className="w-full h-full object-cover rounded-lg scale-110" />
          </div>
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-extrabold text-slate-900 leading-none">Graphix Infotech</p>
            <p className="text-[10px] text-brand-600 mt-1 uppercase tracking-wider font-semibold">{roleLabel[user?.role || 'STUDENT']}</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={active ? 'sidebar-link-active relative overflow-hidden' : 'sidebar-link hover:translate-x-1 transition-transform'}
              title={collapsed ? item.label : undefined}
            >
              {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-r-full" />}
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom - User + Logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        {!collapsed && (
          <div className="px-3 mb-3">
            <p className="text-xs font-semibold text-slate-900 truncate">{user?.email}</p>
            <p className="text-xs text-slate-500 mt-0.5">{user?.role?.replace('_', ' ')}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-link w-full hover:text-red-600 hover:bg-red-50 transition-colors"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col relative z-20 shadow-xl shadow-slate-200/50">
        <Sidebar />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm z-10 hover:bg-slate-50 hover:scale-110 transition-transform text-slate-400 hover:text-slate-600"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="flex flex-col w-60 animate-[slideIn_0.3s_ease-out]">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top bar */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-3 flex items-center gap-3 z-10 sticky top-0">
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} className="text-slate-600" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
              {user?.email?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Page content with fade-in transition per route */}
        <main key={location.pathname} className="flex-1 overflow-y-auto p-4 md:p-6 animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
}

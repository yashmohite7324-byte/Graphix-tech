import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';
import {
  LayoutDashboard, Users, Building2, Briefcase, ClipboardList,
  CalendarDays, GraduationCap, BarChart3, FileText, Settings,
  LogOut, ChevronLeft, Menu, Bell, BookOpen, CheckSquare,
  UserCircle, Brain, Megaphone, Wallet, Zap, X,
} from 'lucide-react';

/* ── Navigation per role ──────────────────────────────────────
   Grouped, because a flat list of eleven items is hard to scan. */
type NavItem = { label: string; icon: any; to: string; tag?: string };
type NavGroup = { heading?: string; items: NavItem[] };

const NAV: Record<string, NavGroup[]> = {
  SUPER_ADMIN: [
    { items: [{ label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' }] },
    { heading: 'Placement', items: [
      { label: 'Students',     icon: GraduationCap, to: '/admin/students' },
      { label: 'Companies',    icon: Building2,     to: '/admin/companies' },
      { label: 'Jobs',         icon: Briefcase,     to: '/admin/jobs' },
      { label: 'Applications', icon: ClipboardList, to: '/admin/applications' },
      { label: 'Interviews',   icon: CalendarDays,  to: '/admin/interviews' },
      { label: 'Placements',   icon: GraduationCap, to: '/admin/placements' },
    ]},
    { heading: 'Institute', items: [
      { label: 'Training',      icon: BookOpen,  to: '/admin/training' },
      { label: 'Announcements', icon: Megaphone, to: '/admin/announcements' },
      { label: 'Analytics',     icon: BarChart3, to: '/admin/analytics' },
    ]},
    { heading: 'System', items: [
      { label: 'Subscriptions', icon: Wallet,   to: '/admin/subscriptions' },
      { label: 'Audit Log',     icon: FileText, to: '/admin/audit' },
      { label: 'Settings',      icon: Settings, to: '/admin/settings' },
    ]},
  ],
  PLACEMENT_ADMIN: [
    { items: [{ label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' }] },
    { heading: 'Placement', items: [
      { label: 'Students',     icon: GraduationCap, to: '/admin/students' },
      { label: 'Companies',    icon: Building2,     to: '/admin/companies' },
      { label: 'Jobs',         icon: Briefcase,     to: '/admin/jobs' },
      { label: 'Applications', icon: ClipboardList, to: '/admin/applications' },
      { label: 'Interviews',   icon: CalendarDays,  to: '/admin/interviews' },
      { label: 'Placements',   icon: GraduationCap, to: '/admin/placements' },
    ]},
    { heading: 'Institute', items: [
      { label: 'Training',      icon: BookOpen,  to: '/admin/training' },
      { label: 'Announcements', icon: Megaphone, to: '/admin/announcements' },
      { label: 'Analytics',     icon: BarChart3, to: '/admin/analytics' },
      { label: 'Audit Log',     icon: FileText,  to: '/admin/audit' },
      { label: 'Settings',      icon: Settings,  to: '/admin/settings' },
    ]},
  ],
  STUDENT: [
    { items: [{ label: 'Dashboard', icon: LayoutDashboard, to: '/student/dashboard' }] },
    { heading: 'Find work', items: [
      { label: 'Browse jobs',   icon: Briefcase,     to: '/student/jobs' },
      { label: 'Applications',  icon: ClipboardList, to: '/student/applications' },
      { label: 'Interviews',    icon: CalendarDays,  to: '/student/interviews' },
    ]},
    { heading: 'Grow', items: [
      { label: 'Training',      icon: BookOpen, to: '/student/training' },
      { label: 'Resume score',  icon: Brain,    to: '/student/ai-score', tag: 'AI' },
    ]},
    { heading: 'Account', items: [
      { label: 'My profile', icon: UserCircle, to: '/student/profile' },
      { label: 'Settings',   icon: Settings,   to: '/student/settings' },
    ]},
  ],
  RECRUITER: [
    { items: [{ label: 'Dashboard', icon: LayoutDashboard, to: '/recruiter/dashboard' }] },
    { heading: 'Hiring', items: [
      { label: 'Post a job',  icon: Briefcase,    to: '/recruiter/post-job' },
      { label: 'Candidates',  icon: Users,        to: '/recruiter/candidates' },
      { label: 'Interviews',  icon: CalendarDays, to: '/recruiter/interviews' },
    ]},
    { heading: 'Account', items: [
      { label: 'Company profile', icon: Building2, to: '/recruiter/company' },
      { label: 'Settings',        icon: Settings,  to: '/recruiter/settings' },
    ]},
  ],
  TRAINER: [
    { items: [{ label: 'Dashboard', icon: LayoutDashboard, to: '/trainer/dashboard' }] },
    { heading: 'Teaching', items: [
      { label: 'Attendance',  icon: CheckSquare,   to: '/trainer/attendance' },
      { label: 'Assessments', icon: ClipboardList, to: '/trainer/assessments' },
      { label: 'Students',    icon: Users,         to: '/trainer/students' },
    ]},
    { heading: 'Account', items: [
      { label: 'Settings', icon: Settings, to: '/trainer/settings' },
    ]},
  ],
};

const ROLE_META: Record<string, { label: string; grad: string; a: string }> = {
  STUDENT:         { label: 'Student',         grad: 'grad-student',   a: 'var(--role-student-a)' },
  RECRUITER:       { label: 'Recruiter',       grad: 'grad-recruiter', a: 'var(--role-recruiter-a)' },
  PLACEMENT_ADMIN: { label: 'Placement Admin', grad: 'grad-admin',     a: 'var(--role-admin-a)' },
  SUPER_ADMIN:     { label: 'Super Admin',     grad: 'grad-super',     a: 'var(--role-super-a)' },
  TRAINER:         { label: 'Trainer',         grad: 'grad-trainer',   a: 'var(--role-trainer-a)' },
};

/* ── Notification bell ─────────────────────────────────────── */
function Bell_({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: countRes } = useQuery({
    queryKey: ['notif-count'],
    queryFn: () => api.get('/notifications/unread-count'),
    refetchInterval: 30_000,
    retry: false,
  });
  const { data: listRes } = useQuery({
    queryKey: ['notif-list'],
    queryFn: () => api.get('/notifications?size=6'),
    enabled: open,
    retry: false,
  });

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const count = countRes?.data?.data ?? 0;
  const items = listRes?.data?.data?.content ?? [];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={count > 0 ? `${count} unread notifications` : 'Notifications'}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
        style={{ background: 'var(--bg-surface-2)' }}
      >
        <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
        {count > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center text-[9px] font-bold text-white tnum"
            style={{ background: 'var(--stage-rejected)', border: '2px solid var(--bg-surface)' }}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-11 w-80 rounded-2xl overflow-hidden z-50 surface"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span className="text-sm font-semibold t-primary font-display">Notifications</span>
            <button onClick={() => setOpen(false)} className="t-tertiary hover:opacity-70">
              <X size={14} />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <p className="text-sm font-medium t-primary">Nothing new</p>
                <p className="text-xs t-tertiary mt-1">
                  Updates about your applications land here.
                </p>
              </div>
            ) : items.map((n: any) => (
              <div
                key={n.id}
                className="px-4 py-3 flex gap-2.5"
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: n.isRead ? 'transparent' : 'var(--brand-50)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ background: n.isRead ? 'var(--text-tertiary)' : 'var(--brand-500)' }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold t-primary">{n.title}</p>
                  <p className="text-xs t-secondary mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] t-tertiary mt-1 tnum">
                    {new Date(n.createdAt).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Link
            to={`/${role.toLowerCase().replace('_', '-')}/notifications`}
            onClick={() => setOpen(false)}
            className="block text-center text-xs font-semibold py-3"
            style={{ color: 'var(--brand-600)', borderTop: '1px solid var(--border)' }}
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

/* ── Layout ────────────────────────────────────────────────── */
export default function AppLayout() {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();

  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('gx-nav') === '1');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const role = user?.role ?? 'STUDENT';
  const meta = ROLE_META[role] ?? ROLE_META.STUDENT;
  const groups = NAV[role] ?? NAV.STUDENT;

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(/[\s.@_]+/).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  useEffect(() => { localStorage.setItem('gx-nav', collapsed ? '1' : '0'); }, [collapsed]);
  useEffect(() => { setMobileOpen(false); }, [loc.pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);

  const currentLabel = groups
    .flatMap(g => g.items)
    .find(i => loc.pathname.startsWith(i.to))?.label ?? 'Dashboard';

  const Rail = () => (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-surface)' }}>

      {/* Brand */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{ height: 64, borderBottom: '1px solid var(--border)' }}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.grad}`}>
          <Zap size={17} className="text-white" fill="currentColor" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display font-bold text-sm t-primary leading-tight truncate">
              Graphix TechHire
            </p>
            <p className="text-[10px] font-semibold truncate" style={{ color: meta.a }}>
              {meta.label}
            </p>
          </div>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.heading && !collapsed && (
              <p className="text-[10px] font-semibold t-tertiary px-3 mb-1.5">
                {group.heading}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const active = loc.pathname === item.to || loc.pathname.startsWith(item.to + '/');
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    className={`nav-item ${active ? `nav-item-active ${meta.grad}` : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon size={17} className="shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.tag && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                            style={{
                              background: active ? 'rgba(255,255,255,.22)' : 'var(--brand-100)',
                              color: active ? '#fff' : 'var(--brand-600)',
                            }}
                          >
                            {item.tag}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + sign out */}
      <div className="p-3 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5 p-2 rounded-xl" style={{ background: 'var(--bg-surface-2)' }}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${meta.grad}`}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold t-primary truncate">{displayName}</p>
              <p className="text-[10px] t-tertiary truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => { logout(); nav('/login'); }}
              title="Sign out"
              className="p-1.5 rounded-lg shrink-0 transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { logout(); nav('/login'); }}
            title="Sign out"
            className="w-full flex justify-center py-2.5 rounded-xl"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-canvas)' }}>

      {/* Desktop rail */}
      <aside
        className="hidden lg:flex flex-col shrink-0 relative transition-[width] duration-200"
        style={{ width: collapsed ? 72 : 248, borderRight: '1px solid var(--border)' }}
      >
        <Rail />
        <button
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center z-20 transition-transform"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--text-tertiary)',
            transform: collapsed ? 'rotate(180deg)' : 'none',
          }}
        >
          <ChevronLeft size={13} />
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(3,6,15,.6)' }}
               onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden" style={{ boxShadow: 'var(--shadow-lg)' }}>
            <Rail />
          </aside>
        </>
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">

        <header
          className="flex items-center gap-3 px-4 lg:px-6 shrink-0 z-30"
          style={{
            height: 64,
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--bg-surface-2)', color: 'var(--text-secondary)' }}
          >
            <Menu size={17} />
          </button>

          <h1 className="font-display font-semibold text-base t-primary truncate flex-1">
            {currentLabel}
          </h1>

          <ThemeToggle />
          <Bell_ role={role} />

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold ${meta.grad}`}
            >
              {initials}
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-11 w-52 rounded-2xl overflow-hidden z-50 surface py-1"
                style={{ boxShadow: 'var(--shadow-lg)' }}
              >
                <div className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-xs font-semibold t-primary truncate">{displayName}</p>
                  <p className="text-[10px] t-tertiary truncate">{user?.email}</p>
                </div>
                <Link
                  to={`/${role.toLowerCase().replace('_', '-')}/settings`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm t-secondary"
                >
                  <Settings size={15} /> Settings
                </Link>
                <button
                  onClick={() => { logout(); nav('/login'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm"
                  style={{ color: 'var(--err-fg)', borderTop: '1px solid var(--border)' }}
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-7 page-enter" key={loc.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

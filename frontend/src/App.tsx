import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentJobsPage from './pages/student/StudentJobsPage';
import StudentApplicationsPage from './pages/student/StudentApplicationsPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentTrainingPage from './pages/student/StudentTrainingPage';
import StudentInterviewsPage from './pages/student/StudentInterviewsPage';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCompaniesPage from './pages/admin/AdminCompaniesPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminPlacementsPage from './pages/admin/AdminPlacementsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminAuditPage from './pages/admin/AdminAuditPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterPostJobPage from './pages/recruiter/RecruiterPostJobPage';
import RecruiterCandidatePipelinePage from './pages/recruiter/RecruiterCandidatePipelinePage';
import RecruiterInterviewsPage from './pages/recruiter/RecruiterInterviewsPage';
import TrainerDashboard from './pages/trainer/TrainerDashboard';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function PrivateRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function RoleRedirect() {
  const { user } = useAuth();
  const routes: Record<string, string> = {
    STUDENT: '/student/dashboard', RECRUITER: '/recruiter/dashboard',
    PLACEMENT_ADMIN: '/admin/dashboard', SUPER_ADMIN: '/admin/dashboard', TRAINER: '/trainer/dashboard',
  };
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={routes[user.role] || '/login'} replace />;
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 text-4xl">🚧</div>
      <h2 className="text-lg font-semibold text-slate-900 mb-1">{title}</h2>
      <p className="text-sm text-slate-500">This section is under active development.</p>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<RoleRedirect />} />
            {/* Student Routes */}
            <Route path="/student/dashboard" element={<PrivateRoute allowedRoles={['STUDENT']}><StudentDashboard /></PrivateRoute>} />
            <Route path="/student/jobs" element={<PrivateRoute allowedRoles={['STUDENT']}><StudentJobsPage /></PrivateRoute>} />
            <Route path="/student/applications" element={<PrivateRoute allowedRoles={['STUDENT']}><StudentApplicationsPage /></PrivateRoute>} />
            <Route path="/student/interviews" element={<PrivateRoute allowedRoles={['STUDENT']}><StudentInterviewsPage /></PrivateRoute>} />
            <Route path="/student/training" element={<PrivateRoute allowedRoles={['STUDENT']}><StudentTrainingPage /></PrivateRoute>} />
            <Route path="/student/attendance" element={<PrivateRoute allowedRoles={['STUDENT']}><ComingSoon title="Attendance" /></PrivateRoute>} />
            <Route path="/student/profile" element={<PrivateRoute allowedRoles={['STUDENT']}><StudentProfilePage /></PrivateRoute>} />
            <Route path="/student/notifications" element={<PrivateRoute allowedRoles={['STUDENT']}><StudentNotificationsPage /></PrivateRoute>} />
            {/* Recruiter Routes */}
            <Route path="/recruiter/dashboard" element={<PrivateRoute allowedRoles={['RECRUITER']}><RecruiterDashboard /></PrivateRoute>} />
            <Route path="/recruiter/jobs" element={<PrivateRoute allowedRoles={['RECRUITER']}><RecruiterPostJobPage /></PrivateRoute>} />
            <Route path="/recruiter/applications" element={<PrivateRoute allowedRoles={['RECRUITER']}><ComingSoon title="Applications" /></PrivateRoute>} />
            <Route path="/recruiter/interviews" element={<PrivateRoute allowedRoles={['RECRUITER']}><RecruiterInterviewsPage /></PrivateRoute>} />
            <Route path="/recruiter/candidates" element={<PrivateRoute allowedRoles={['RECRUITER']}><RecruiterCandidatePipelinePage /></PrivateRoute>} />
            <Route path="/recruiter/notifications" element={<PrivateRoute allowedRoles={['RECRUITER']}><ComingSoon title="Notifications" /></PrivateRoute>} />
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/companies" element={<PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}><AdminCompaniesPage /></PrivateRoute>} />
            <Route path="/admin/students" element={<PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}><AdminStudentsPage /></PrivateRoute>} />
            <Route path="/admin/jobs" element={<PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}><ComingSoon title="Jobs" /></PrivateRoute>} />
            <Route path="/admin/applications" element={<PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}><ComingSoon title="Applications" /></PrivateRoute>} />
            <Route path="/admin/interviews" element={<PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}><ComingSoon title="Interviews" /></PrivateRoute>} />
            <Route path="/admin/placements" element={<PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}><AdminPlacementsPage /></PrivateRoute>} />
            <Route path="/admin/training" element={<PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}><ComingSoon title="Training" /></PrivateRoute>} />
            <Route path="/admin/analytics" element={<PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}><AdminAnalyticsPage /></PrivateRoute>} />
            <Route path="/admin/audit" element={<PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}><AdminAuditPage /></PrivateRoute>} />
            <Route path="/admin/announcements" element={<PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}><AdminAnnouncementsPage /></PrivateRoute>} />
            <Route path="/admin/settings" element={<PrivateRoute allowedRoles={['SUPER_ADMIN']}><ComingSoon title="Settings" /></PrivateRoute>} />
            {/* Trainer Routes */}
            <Route path="/trainer/dashboard" element={<PrivateRoute allowedRoles={['TRAINER']}><TrainerDashboard /></PrivateRoute>} />
            <Route path="/trainer/programs" element={<PrivateRoute allowedRoles={['TRAINER']}><ComingSoon title="Programs" /></PrivateRoute>} />
            <Route path="/trainer/batches" element={<PrivateRoute allowedRoles={['TRAINER']}><ComingSoon title="Batches" /></PrivateRoute>} />
            <Route path="/trainer/attendance" element={<PrivateRoute allowedRoles={['TRAINER']}><ComingSoon title="Attendance" /></PrivateRoute>} />
            <Route path="/trainer/assessments" element={<PrivateRoute allowedRoles={['TRAINER']}><ComingSoon title="Assessments" /></PrivateRoute>} />
            <Route path="/trainer/announcements" element={<PrivateRoute allowedRoles={['TRAINER']}><ComingSoon title="Announcements" /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

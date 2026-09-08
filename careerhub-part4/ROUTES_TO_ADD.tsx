// ============================================================
// ADD THESE IMPORTS at the top of your App.tsx
// ============================================================

// Admin pages
import AdminCompaniesPage from './pages/admin/AdminCompaniesPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminPlacementsPage from './pages/admin/AdminPlacementsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminAuditPage from './pages/admin/AdminAuditPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';

// Recruiter pages
import RecruiterPostJobPage from './pages/recruiter/RecruiterPostJobPage';
import RecruiterCandidatePipelinePage from './pages/recruiter/RecruiterCandidatePipelinePage';
import RecruiterInterviewsPage from './pages/recruiter/RecruiterInterviewsPage';

// ============================================================
// REPLACE these ComingSoon routes in your App.tsx
// ============================================================

// --- ADMIN ROUTES ---

// REPLACE: <Route path="/admin/companies" ... ComingSoon ...
<Route path="/admin/companies" element={<PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}><AdminCompaniesPage /></PrivateRoute>} />

// REPLACE: <Route path="/admin/students" ... ComingSoon ...
<Route path="/admin/students" element={<PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}><AdminStudentsPage /></PrivateRoute>} />

// REPLACE: <Route path="/admin/placements" ... ComingSoon ...
<Route path="/admin/placements" element={<PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}><AdminPlacementsPage /></PrivateRoute>} />

// REPLACE: <Route path="/admin/analytics" ... ComingSoon ...
<Route path="/admin/analytics" element={<PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}><AdminAnalyticsPage /></PrivateRoute>} />

// REPLACE: <Route path="/admin/audit" ... ComingSoon ...
<Route path="/admin/audit" element={<PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}><AdminAuditPage /></PrivateRoute>} />

// REPLACE: <Route path="/admin/announcements" ... ComingSoon ...
<Route path="/admin/announcements" element={<PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}><AdminAnnouncementsPage /></PrivateRoute>} />

// --- RECRUITER ROUTES ---

// REPLACE: <Route path="/recruiter/jobs" ... ComingSoon ...
<Route path="/recruiter/jobs" element={<PrivateRoute allowedRoles={['RECRUITER']}><RecruiterPostJobPage /></PrivateRoute>} />

// REPLACE: <Route path="/recruiter/candidates" ... ComingSoon ...
<Route path="/recruiter/candidates" element={<PrivateRoute allowedRoles={['RECRUITER']}><RecruiterCandidatePipelinePage /></PrivateRoute>} />

// REPLACE: <Route path="/recruiter/interviews" ... ComingSoon ...
<Route path="/recruiter/interviews" element={<PrivateRoute allowedRoles={['RECRUITER']}><RecruiterInterviewsPage /></PrivateRoute>} />

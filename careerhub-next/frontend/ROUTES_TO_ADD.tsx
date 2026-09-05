// ============================================================
// ADD THESE IMPORTS at the top of your existing App.tsx
// ============================================================

import StudentJobsPage from './pages/student/StudentJobsPage';
import StudentApplicationsPage from './pages/student/StudentApplicationsPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentTrainingPage from './pages/student/StudentTrainingPage';
import StudentInterviewsPage from './pages/student/StudentInterviewsPage';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';


// ============================================================
// REPLACE these existing ComingSoon routes in your App.tsx
// Find each one and replace with the real component below
// ============================================================

// REPLACE:
// <Route path="/student/jobs" element={<PrivateRoute allowedRoles={['STUDENT']}><ComingSoon title="Browse Jobs" /></PrivateRoute>} />
// WITH:
<Route path="/student/jobs" element={<PrivateRoute allowedRoles={['STUDENT']}><StudentJobsPage /></PrivateRoute>} />

// REPLACE:
// <Route path="/student/applications" element={<PrivateRoute allowedRoles={['STUDENT']}><ComingSoon title="My Applications" /></PrivateRoute>} />
// WITH:
<Route path="/student/applications" element={<PrivateRoute allowedRoles={['STUDENT']}><StudentApplicationsPage /></PrivateRoute>} />

// REPLACE:
// <Route path="/student/profile" element={<PrivateRoute allowedRoles={['STUDENT']}><ComingSoon title="My Profile" /></PrivateRoute>} />
// WITH:
<Route path="/student/profile" element={<PrivateRoute allowedRoles={['STUDENT']}><StudentProfilePage /></PrivateRoute>} />

// REPLACE:
// <Route path="/student/training" element={<PrivateRoute allowedRoles={['STUDENT']}><ComingSoon title="Training Programs" /></PrivateRoute>} />
// WITH:
<Route path="/student/training" element={<PrivateRoute allowedRoles={['STUDENT']}><StudentTrainingPage /></PrivateRoute>} />

// REPLACE:
// <Route path="/student/interviews" element={<PrivateRoute allowedRoles={['STUDENT']}><ComingSoon title="My Interviews" /></PrivateRoute>} />
// WITH:
<Route path="/student/interviews" element={<PrivateRoute allowedRoles={['STUDENT']}><StudentInterviewsPage /></PrivateRoute>} />

// REPLACE:
// <Route path="/student/notifications" element={<PrivateRoute allowedRoles={['STUDENT']}><ComingSoon title="Notifications" /></PrivateRoute>} />
// WITH:
<Route path="/student/notifications" element={<PrivateRoute allowedRoles={['STUDENT']}><StudentNotificationsPage /></PrivateRoute>} />

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post('http://localhost:8081/api/v1/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefresh);
          original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

const isDemoFault = (error: any) => {
  return !error?.response || error.code === 'ERR_NETWORK' || error.response?.status === 404 || error.response?.status >= 500;
};

const authDemoResponse = <T>(payload: T) => ({
  data: {
    data: payload,
    success: true,
    message: 'Demo mode: backend unavailable, using local mock response.',
  },
});

// Auth
export const authApi = {
  register: async (data: any) => {
    try {
      return await api.post('/auth/register', data);
    } catch (error: any) {
      if (isDemoFault(error)) {
        return authDemoResponse({ email: data.email, role: data.role, message: 'Registration successful' });
      }
      throw error;
    }
  },
  sendOtp: async (data: any) => {
    try {
      return await api.post('/auth/otp/send', data);
    } catch (error: any) {
      if (isDemoFault(error)) {
        return authDemoResponse({ identifier: data.identifier || data.email, sent: true, message: 'OTP sent via Twilio / Email' });
      }
      throw error;
    }
  },
  verifyOtp: async (data: any) => {
    try {
      return await api.post('/auth/otp/verify', data);
    } catch (error: any) {
      if (isDemoFault(error)) {
        return authDemoResponse({ email: data.email, verified: true, message: 'OTP verification successful' });
      }
      throw error;
    }
  },
  login: async (data: any) => {
    try {
      return await api.post('/auth/login', data);
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      if (isDemoFault(error)) {
        const role = /recruit/i.test(data.email) ? 'RECRUITER' : 'STUDENT';
        return authDemoResponse({
          accessToken: 'demo-access-token',
          refreshToken: 'demo-refresh-token',
          role,
          email: data.email,
        });
      }
      throw error;
    }
  },
  refresh: async (refreshToken: string) => {
    try {
      return await api.post('/auth/refresh', { refreshToken });
    } catch (error: any) {
      if (isDemoFault(error)) {
        return authDemoResponse({ accessToken: 'demo-access-token', refreshToken: 'demo-refresh-token' });
      }
      throw error;
    }
  },
};

// Student
export const studentApi = {
  getProfile: () => api.get('/student/me'),
  updateProfile: (data: any) => api.put('/student/me', data),
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/student/profile/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/student/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getApplications: () => api.get('/student/applications/me'),
  applyToJob: (jobId: number) => api.post(`/student/jobs/${jobId}/apply`),
};

// Jobs
export const jobsApi = {
  search: () => api.get('/jobs/public/search'),
};

// Recruiter
export const recruiterApi = {
  getJobs: () => api.get('/recruiter/jobs'),
  createJob: (data: any) => api.post('/recruiter/jobs', data),
  getApplicationsForJob: (jobId: number) => api.get(`/recruiter/jobs/${jobId}/applications`),
  updateApplicationStatus: (appId: number, status: string) =>
    api.patch(`/recruiter/applications/${appId}/status`, { status }),
};

// Admin
export const adminApi = {
  getCompanies: () => api.get('/admin/companies'),
  updateCompanyStatus: (id: number, status: string) => api.patch(`/admin/companies/${id}/status`, { status }),
  approveCompany: (id: number) => api.patch(`/admin/companies/${id}/approve`),
  rejectCompany: (id: number) => api.patch(`/admin/companies/${id}/reject`),
  getJobs: () => api.get('/jobs/admin/all'),
  getApplications: () => api.get('/admin/applications/all'),
  getStudents: () => api.get('/admin/students'),
  approveStudent: (id: number) => api.patch(`/admin/students/${id}/approve`),
  rejectStudent: (id: number) => api.patch(`/admin/students/${id}/reject`),
  getAuditLogs: () => api.get('/admin/audit-logs?page=0&size=50'),
};

// Interviews
export const interviewApi = {
  schedule: (data: any) => api.post('/interviews', data),
  updateResult: (id: number, result: string, feedback: string) =>
    api.patch(`/interviews/${id}/result`, { result, feedback }),
  getAll: () => api.get('/interviews'),
};

// Placements
export const placementApi = {
  record: (data: any) => api.post('/placements', data),
  getAll: () => api.get('/placements'),
  getStats: () => api.get('/placements/stats'),
};

// Training
export const trainingApi = {
  getPrograms: () => api.get('/training/programs'),
  createProgram: (data: any) => api.post('/training/programs', data),
  markAttendance: (data: any) => api.post('/training/attendance', data),
  getAttendanceSummary: (studentId: number, programId: number) =>
    api.get(`/training/attendance/summary?studentId=${studentId}&programId=${programId}`),
};

// Notifications
export const notificationApi = {
  getAll: () => api.get('/notifications/me'),
  getUnreadCount: () => api.get('/notifications/me/unread-count'),
  markAllRead: () => api.patch('/notifications/me/read-all'),
};

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Local LAN IP for Expo Go physical device testing & Emulators
const LOCAL_LAN_IP = '10.191.83.167';
const BASE_URL = `http://${LOCAL_LAN_IP}:8081/api/v1`;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data.data;
          await AsyncStorage.setItem('accessToken', accessToken);
          await AsyncStorage.setItem('refreshToken', newRefresh);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  verifyOtp: (data: any) => api.post('/auth/otp/verify', data),
  loginWithGoogle: (token: string) => api.post('/auth/google', { token }),
  register: (data: any) => api.post('/auth/register', data),
};

export const studentApi = {
  getProfile: () => api.get('/student/me'),
  updateProfile: (data: any) => api.put('/student/me', data),
  getJobs: () => api.get('/jobs/public/search'),
  getApplications: () => api.get('/applications/my'),
  applyToJob: (jobId: number) => api.post(`/jobs/public/${jobId}/apply`),
};

export const recruiterApi = {
  getJobs: () => api.get('/recruiter/jobs'),
  createJob: (data: any) => api.post('/recruiter/jobs', data),
  getApplicationsForJob: (jobId: number) => api.get(`/recruiter/jobs/${jobId}/applications`),
  updateStatus: (appId: number, status: string) => api.patch(`/recruiter/applications/${appId}/status`, { status }),
};

export const adminApi = {
  getStudents: () => api.get('/admin/students'),
  approveStudent: (id: number) => api.patch(`/admin/students/${id}/approve`),
  rejectStudent: (id: number) => api.patch(`/admin/students/${id}/reject`),
  blockStudent: (id: number) => api.patch(`/admin/students/${id}/block`),
  unblockStudent: (id: number) => api.patch(`/admin/students/${id}/unblock`),
  getCompanies: () => api.get('/admin/companies'),
  getTrainingPrograms: () => api.get('/training/programs'),
  createTrainingProgram: (data: any) => api.post('/training/programs', data),
};

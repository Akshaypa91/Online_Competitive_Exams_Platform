import api from './api';

export const authApi = {
  loginStudent: async (credentials) => {
    const response = await api.post('/auth/student/login', credentials);
    return response.data;
  },
  registerStudent: async (userData) => {
    const response = await api.post('/auth/student/register', userData);
    return response.data;
  },
  requestStudentPasswordReset: async (email) => {
    const response = await api.post('/auth/student/forgot-password', { email });
    return response.data;
  },
  resetStudentPassword: async (token, password) => {
    const response = await api.post('/auth/student/reset-password', { token, password });
    return response.data;
  },
  loginAdmin: async (credentials) => {
    const response = await api.post('/auth/admin/login', credentials);
    return response.data;
  }
};

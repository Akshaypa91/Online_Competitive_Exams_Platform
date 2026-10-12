import api from './api';

export const adminApi = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  
  // Topics
  getTopics: async () => {
    const response = await api.get('/admin/topics');
    return response.data;
  },
  createTopic: async (data) => {
    const response = await api.post('/admin/topics', data);
    return response.data;
  },
  updateTopic: async (id, data) => {
    const response = await api.put(`/admin/topics/${id}`, data);
    return response.data;
  },
  deleteTopic: async (id) => {
    const response = await api.delete(`/admin/topics/${id}`);
    return response.data;
  },

  // Exams
  getExams: async () => {
    const response = await api.get('/admin/exams');
    return response.data;
  },
  createExam: async (data) => {
    const response = await api.post('/admin/exams', data);
    return response.data;
  },
  updateExam: async (id, data) => {
    const response = await api.put(`/admin/exams/${id}`, data);
    return response.data;
  },
  deleteExam: async (id) => {
    const response = await api.delete(`/admin/exams/${id}`);
    return response.data;
  },

  // Students
  getStudents: async () => {
    const response = await api.get('/admin/students');
    return response.data;
  },

  // Attempts
  getAttempts: async () => {
    const response = await api.get('/admin/attempts');
    return response.data;
  },

  // Results
  getResults: async () => {
    const response = await api.get('/admin/results');
    return response.data;
  }
};

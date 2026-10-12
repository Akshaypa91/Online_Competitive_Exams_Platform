import api from './api';

export const questionApi = {
  getExamQuestions: async (examId) => {
    const response = await api.get(`/admin/exams/${examId}/questions`);
    return response.data;
  },
  createQuestion: async (examId, data) => {
    const response = await api.post(`/admin/exams/${examId}/questions`, data);
    return response.data;
  },
  updateQuestion: async (examId, questionId, data) => {
    const response = await api.put(`/admin/exams/${examId}/questions/${questionId}`, data);
    return response.data;
  },
  deleteQuestion: async (examId, questionId) => {
    const response = await api.delete(`/admin/exams/${examId}/questions/${questionId}`);
    return response.data;
  }
};

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const initialFormState = {
    id: null,
    title: '',
    description: '',
    topic_id: '',
    duration: 60,
    total_marks: 100,
    start_time: '',
    end_time: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsData, topicsData] = await Promise.all([
        adminApi.getExams(),
        adminApi.getTopics()
      ]);
      setExams(examsData || []);
      setTopics(topicsData || []);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (exam = null) => {
    if (exam) {
      // Format dates for datetime-local input
      const formatForInput = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().slice(0, 16);
      };
      
      setFormData({
        ...exam,
        topic_id: exam.topic_id || exam.topic?.id || '',
        start_time: formatForInput(exam.start_time),
        end_time: formatForInput(exam.end_time)
      });
    } else {
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Transform data
    const dataToSubmit = {
      ...formData,
      topic_id: parseInt(formData.topic_id),
      duration: parseInt(formData.duration),
      total_marks: parseInt(formData.total_marks),
      start_time: formData.start_time ? new Date(formData.start_time).toISOString() : null,
      end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
    };

    try {
      if (formData.id) {
        await adminApi.updateExam(formData.id, dataToSubmit);
      } else {
        await adminApi.createExam(dataToSubmit);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await adminApi.deleteExam(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete exam');
      }
    }
  };

  return (
    <div className="app-layout">
      <Sidebar isAdmin={true} />
      <div className="main-content">
        <Navbar title="Manage Exams" />
        
        <div className="page-content">
          <div className="page-header">
            <h2>Exams</h2>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              + Create Exam
            </button>
          </div>
          
          <ErrorMessage message={error} />
          
          {loading ? (
            <Loading text="Loading exams..." />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Exam Title</th>
                    <th>Topic</th>
                    <th>Duration</th>
                    <th>Marks</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.length > 0 ? (
                    exams.map(exam => (
                      <tr key={exam.id}>
                        <td style={{ fontWeight: 500 }}>{exam.title}</td>
                        <td>{exam.topic?.name || 'N/A'}</td>
                        <td>{exam.duration} mins</td>
                        <td>{exam.total_marks}</td>
                        <td>
                          <span className={`badge ${exam.status === 'AVAILABLE' ? 'badge-success' : 'badge-neutral'}`}>
                            {exam.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleOpenModal(exam)}>Edit</button>
                            <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => navigate('/admin/questions', { state: { examId: exam.id } })}>Questions</button>
                            <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleDelete(exam.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                        No exams found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} title={formData.id ? 'Edit Exam' : 'Create Exam'} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Exam Title</label>
            <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>
          
          <div className="form-group">
            <label className="form-label">Topic</label>
            <select className="form-control" value={formData.topic_id} onChange={e => setFormData({...formData, topic_id: e.target.value})} required>
              <option value="">Select Topic</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input type="number" min="1" className="form-control" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Total Marks</label>
              <input type="number" min="1" className="form-control" value={formData.total_marks} onChange={e => setFormData({...formData, total_marks: e.target.value})} required />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Start Time (Optional)</label>
              <input type="datetime-local" className="form-control" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">End Time (Optional)</label>
              <input type="datetime-local" className="form-control" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Exam'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageExams;

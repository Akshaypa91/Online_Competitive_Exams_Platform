import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const ManageTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getTopics();
      setTopics(data || []);
    } catch (err) {
      setError('Failed to fetch topics');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (topic = null) => {
    if (topic) {
      setFormData(topic);
    } else {
      setFormData({ id: null, name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (formData.id) {
        await adminApi.updateTopic(formData.id, formData);
      } else {
        await adminApi.createTopic(formData);
      }
      setIsModalOpen(false);
      fetchTopics();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save topic');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        await adminApi.deleteTopic(id);
        fetchTopics();
      } catch (err) {
        setError('Failed to delete topic');
      }
    }
  };

  return (
    <div className="app-layout">
      <Sidebar isAdmin={true} />
      <div className="main-content">
        <Navbar title="Manage Topics" />
        
        <div className="page-content">
          <div className="page-header">
            <h2>Topics</h2>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              + Add Topic
            </button>
          </div>
          
          <ErrorMessage message={error} />
          
          {loading ? (
            <Loading text="Loading topics..." />
          ) : (
            <div className="grid grid-cols-3">
              {topics.map(topic => (
                <div key={topic.id} className="card">
                  <h3 style={{ marginBottom: '0.5rem' }}>{topic.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', minHeight: '40px' }}>
                    {topic.description}
                  </p>
                  <div className="flex gap-2">
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => handleOpenModal(topic)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(topic.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {topics.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No topics found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} title={formData.id ? 'Edit Topic' : 'Add Topic'} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Topic Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-control" 
              rows="3"
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Topic'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageTopics;

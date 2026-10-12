import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const ManageAttempts = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const data = await adminApi.getAttempts();
        setAttempts(data || []);
      } catch (err) {
        setError('Failed to fetch attempts');
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  const filteredAttempts = attempts.filter(a => {
    const searchLower = searchTerm.toLowerCase();
    const studentName = (a.student?.name || a.student_name || '').toLowerCase();
    const examTitle = (a.exam?.title || a.exam_name || '').toLowerCase();
    return studentName.includes(searchLower) || examTitle.includes(searchLower);
  });

  return (
    <div className="app-layout">
      <Sidebar isAdmin={true} />
      <div className="main-content">
        <Navbar title="Manage Attempts" />
        
        <div className="page-content">
          <div className="page-header">
            <h2>Attempts</h2>
          </div>
          
          <ErrorMessage message={error} />
          
          <div className="card mb-6">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by student or exam..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ maxWidth: '400px' }}
            />
          </div>
          
          {loading ? (
            <Loading text="Loading attempts..." />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student</th>
                    <th>Exam</th>
                    <th>Started At</th>
                    <th>Status</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttempts.length > 0 ? (
                    filteredAttempts.map(attempt => (
                      <tr key={attempt.id}>
                        <td style={{ color: 'var(--text-muted)' }}>#{attempt.id}</td>
                        <td style={{ fontWeight: 500 }}>{attempt.student?.name || attempt.student_name}</td>
                        <td>{attempt.exam?.title || attempt.exam_name}</td>
                        <td>{new Date(attempt.started_at || attempt.start_time).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${attempt.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                            {attempt.status}
                          </span>
                        </td>
                        <td>
                          {attempt.submitted_at 
                            ? new Date(attempt.submitted_at).toLocaleString() 
                            : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                        No attempts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAttempts;

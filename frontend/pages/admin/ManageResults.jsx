import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const ManageResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await adminApi.getResults();
        setResults(data || []);
      } catch (err) {
        setError('Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const filteredResults = results.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    const studentName = (r.student?.name || r.student_name || '').toLowerCase();
    const examTitle = (r.exam?.title || r.exam_name || '').toLowerCase();
    return studentName.includes(searchLower) || examTitle.includes(searchLower);
  });

  return (
    <div className="app-layout">
      <Sidebar isAdmin={true} />
      <div className="main-content">
        <Navbar title="Manage Results" />
        
        <div className="page-content">
          <div className="page-header">
            <h2>Results</h2>
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
            <Loading text="Loading results..." />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Exam</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.length > 0 ? (
                    filteredResults.map(result => (
                      <tr key={result.id}>
                        <td style={{ fontWeight: 500 }}>{result.student?.name || result.student_name}</td>
                        <td>{result.exam?.title || result.exam_name}</td>
                        <td>{result.score} / {result.exam?.total_marks || result.total_marks || '-'}</td>
                        <td style={{ fontWeight: 600 }}>{result.percentage}%</td>
                        <td>
                          <span className={`badge ${result.status === 'PASS' ? 'badge-success' : 'badge-error'}`}>
                            {result.status}
                          </span>
                        </td>
                        <td>{new Date(result.submitted_at || result.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                        No results found
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

export default ManageResults;

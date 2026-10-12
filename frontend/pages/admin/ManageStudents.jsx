import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await adminApi.getStudents();
        setStudents(data || []);
      } catch (err) {
        setError('Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar isAdmin={true} />
      <div className="main-content">
        <Navbar title="Manage Students" />
        
        <div className="page-content">
          <div className="page-header">
            <h2>Students</h2>
          </div>
          
          <ErrorMessage message={error} />
          
          <div className="card mb-6">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search students by name or email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ maxWidth: '400px' }}
            />
          </div>
          
          {loading ? (
            <Loading text="Loading students..." />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                      <tr key={student.id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>#{student.id}</td>
                        <td style={{ fontWeight: 500 }}>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{student.gender}</td>
                        <td>{student.phone}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                        No students found
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

export default ManageStudents;

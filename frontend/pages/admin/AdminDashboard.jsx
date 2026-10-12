import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await adminApi.getDashboard();
        setDashboardData(data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="app-layout"><Sidebar isAdmin={true} /><div className="main-content"><Navbar title="Admin Dashboard" /><div className="page-content"><Loading /></div></div></div>;

  const stats = [
    { title: 'Total Students', value: dashboardData?.totalStudents || 0 },
    { title: 'Total Exams', value: dashboardData?.totalExams || 0 },
    { title: 'Total Topics', value: dashboardData?.totalTopics || 0 },
    { title: 'Total Questions', value: dashboardData?.totalQuestions || 0 },
    { title: 'Total Attempts', value: dashboardData?.totalAttempts || 0 },
    { title: 'Completed Attempts', value: dashboardData?.completedAttempts || 0 },
  ];

  return (
    <div className="app-layout">
      <Sidebar isAdmin={true} />
      <div className="main-content">
        <Navbar title="Admin Dashboard" />
        
        <div className="page-content">
          <div className="page-header">
            <h2>Overview</h2>
          </div>
          
          <ErrorMessage message={error} />
          
          <div className="grid grid-cols-3 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="card text-center" style={{ padding: '2rem 1rem' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stat.title}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-2">
            <div className="card">
              <h3 className="mb-4">Recent Exams</h3>
              {dashboardData?.recentExams?.length > 0 ? (
                dashboardData.recentExams.map(exam => (
                  <div key={exam.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 500 }}>{exam.title}</span>
                    <span className="badge badge-neutral">{exam.status}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>No recent exams</div>
              )}
            </div>
            
            <div className="card">
              <h3 className="mb-4">Recent Results</h3>
              {dashboardData?.recentResults?.length > 0 ? (
                dashboardData.recentResults.map(result => (
                  <div key={result.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{result.student?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{result.exam?.title}</div>
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {result.percentage}%
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>No recent results</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

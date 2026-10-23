import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  GraduationCap, 
  Calendar 
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import AppLayout from '../../components/AppLayout';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatCard from '../../components/StatCard';

const ManageAttempts = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAttempts();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setAttempts(list);
    } catch (err) {
      setError('Failed to fetch candidate examination attempts.');
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const total = attempts.length;
    const submitted = attempts.filter((a) => (a.status || '').toUpperCase() === 'SUBMITTED').length;
    const inProgress = attempts.filter((a) => (a.status || '').toUpperCase() === 'IN_PROGRESS').length;
    return { total, submitted, inProgress };
  }, [attempts]);

  const filteredAttempts = useMemo(() => {
    return attempts.filter((a) => {
      const q = searchTerm.toLowerCase().trim();
      const student = (a.student_name || a.student?.name || '').toLowerCase();
      const exam = (a.exam_name || a.exam?.title || a.exam?.exam_name || '').toLowerCase();
      const matchesSearch = student.includes(q) || exam.includes(q);

      const status = (a.status || '').toUpperCase();
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [attempts, searchTerm, statusFilter]);

  return (
    <AppLayout
      isAdmin={true}
      title="Examination Attempts"
      breadcrumbs={[{ label: 'Admin Console' }, { label: 'Attempts' }]}
    >
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>Candidate Examination Attempts</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
            Live session telemetry, audit logs, submission timestamps, and candidate exam statuses.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <StatCard
          title="Total Attempts"
          value={metrics.total}
          icon={ClipboardCheck}
          variant="primary"
        />
        <StatCard
          title="Completed Submissions"
          value={metrics.submitted}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Active In-Progress"
          value={metrics.inProgress}
          icon={Clock}
          variant="warning"
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search by candidate name or examination title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted Only</option>
              <option value="IN_PROGRESS">In Progress Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attempts Table */}
      {loading ? (
        <Loading text="Loading attempt audit records..." />
      ) : filteredAttempts.length > 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Attempt ID</th>
                  <th>Candidate</th>
                  <th>Examination</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Score</th>
                  <th>Session Started</th>
                  <th>Submission Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttempts.map((attempt) => {
                  const aId = attempt.attempt_id || attempt.id;
                  const isSubmitted = (attempt.status || '').toUpperCase() === 'SUBMITTED';

                  return (
                    <tr key={aId}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }} className="tabular-nums">
                        #{aId}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--background-color)',
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              fontSize: '0.8125rem',
                              flexShrink: 0,
                            }}
                          >
                            {(attempt.student_name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600 }}>{attempt.student_name || 'Candidate'}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {attempt.exam_name || attempt.exam?.title || 'Exam'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${isSubmitted ? 'badge-success' : 'badge-warning'}`}>
                          {attempt.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }} className="tabular-nums">
                        {attempt.score ?? '—'}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                          <span>{attempt.started_at ? new Date(attempt.started_at).toLocaleString() : '—'}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {attempt.submitted_at ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={13} style={{ color: 'var(--status-success)' }} />
                            <span>{new Date(attempt.submitted_at).toLocaleString()}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--status-warning)', fontWeight: 500 }}>
                            Active In-Progress
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={ClipboardCheck}
          title="No Examination Attempts Found"
          description={
            searchTerm || statusFilter !== 'ALL'
              ? 'No attempts match the applied filters. Try clearing your search.'
              : 'No candidates have launched an examination yet.'
          }
          actionText={searchTerm || statusFilter !== 'ALL' ? 'Clear Filters' : undefined}
          onAction={
            searchTerm || statusFilter !== 'ALL'
              ? () => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }
              : undefined
          }
        />
      )}
    </AppLayout>
  );
};

export default ManageAttempts;

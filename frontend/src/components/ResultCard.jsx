import React from 'react';

const ResultCard = ({ result, onAction }) => {
  const isPass = result.status === 'PASS';

  return (
    <div className="card text-center" style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '120px', 
          height: '120px', 
          borderRadius: '50%', 
          border: `8px solid ${isPass ? 'var(--status-success)' : 'var(--status-error)'}`,
          backgroundColor: isPass ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {result.percentage}%
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Score
            </div>
          </div>
        </div>
        
        <h2>{result.exam?.title || result.exam_name}</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Student: {result.student?.name || result.student_name}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6" style={{ textAlign: 'center', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1.5rem 0' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Marks Obtained</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{result.score}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Marks</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{result.exam?.total_marks || result.total_marks || '-'}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Status</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: isPass ? 'var(--status-success)' : 'var(--status-error)' }}>
            {result.status}
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Submitted on: {new Date(result.submitted_at || result.created_at).toLocaleString()}
      </p>

      {onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          View Ranking
        </button>
      )}
    </div>
  );
};

export default ResultCard;

import React from 'react';

const ExamCard = ({ exam, onAction, actionText, actionClass = "btn-primary" }) => {
  const isAvailable = exam.status === 'AVAILABLE';

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <h3 style={{ margin: 0 }}>{exam.title || exam.name}</h3>
        <span className={`badge ${isAvailable ? 'badge-success' : 'badge-neutral'}`}>
          {exam.status}
        </span>
      </div>
      
      {exam.topic && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Topic: {exam.topic.name || exam.topic}
        </p>
      )}

      {exam.description && (
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {exam.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 mb-4" style={{ fontSize: '0.875rem' }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
          <br/>
          <strong>{exam.duration} mins</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Marks:</span>
          <br/>
          <strong>{exam.total_marks || exam.totalMarks}</strong>
        </div>
      </div>

      <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          className={`btn ${actionClass}`} 
          onClick={() => onAction(exam.id || exam.exam_id)}
          disabled={actionText === 'View Exam' && !isAvailable && exam.status !== 'UPCOMING'}
        >
          {actionText}
        </button>
      </div>
    </div>
  );
};

export default ExamCard;

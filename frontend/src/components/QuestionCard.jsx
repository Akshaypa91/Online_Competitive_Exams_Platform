import React from 'react';

const QuestionCard = ({ question, index, total, selectedOption, onSelect }) => {
  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>
          Question {index} of {total}
        </span>
        <h3 style={{ marginTop: '0.5rem' }}>{question.question_text || question.text}</h3>
      </div>

      <div>
        {question.options && question.options.map((opt) => (
          <label 
            key={opt.id || opt.option_id} 
            className={`option-item ${selectedOption === (opt.id || opt.option_id) ? 'selected' : ''}`}
          >
            <input 
              type="radio" 
              name={`question-${question.id || question.question_id}`} 
              value={opt.id || opt.option_id}
              checked={selectedOption === (opt.id || opt.option_id)}
              onChange={() => onSelect(opt.id || opt.option_id)}
            />
            <span style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
              {opt.option_text || opt.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;

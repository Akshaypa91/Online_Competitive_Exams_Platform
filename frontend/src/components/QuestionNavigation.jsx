import React from 'react';

const QuestionNavigation = ({ total, current, answeredMap, onNavigate }) => {
  const circles = [];
  
  for (let i = 1; i <= total; i++) {
    const isAnswered = answeredMap[i - 1]; // assuming map keys are index or ID?
    // Let's assume answeredMap is an object like { questionId: optionId }
    // Or if passed as array of booleans: answeredMap[index]
    
    // We need to map index to question. Let's assume answeredMap is an array of answered status
    // where index corresponds to question index (0 to total-1)
    
    const isCurrent = i === current;
    const answered = answeredMap[i - 1];
    
    let className = 'nav-circle';
    if (answered) className += ' answered';
    if (isCurrent) className += ' current';

    circles.push(
      <button 
        key={i} 
        className={className} 
        onClick={() => onNavigate(i)}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="card">
      <h4 style={{ marginBottom: '1rem' }}>Navigation</h4>
      <div className="flex gap-4 mb-4" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <div className="flex items-center gap-2">
          <div className="nav-circle answered" style={{ width: '16px', height: '16px' }}></div> Answered
        </div>
        <div className="flex items-center gap-2">
          <div className="nav-circle" style={{ width: '16px', height: '16px' }}></div> Unanswered
        </div>
      </div>
      <div className="question-nav-grid">
        {circles}
      </div>
    </div>
  );
};

export default QuestionNavigation;

import React, { useState, useEffect } from 'react';

const Timer = ({ initialSeconds, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp]);

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isWarning = timeLeft < 300; // Less than 5 minutes

  return (
    <div style={{
      fontSize: '1.25rem',
      fontWeight: 'bold',
      padding: '0.5rem 1rem',
      backgroundColor: isWarning ? 'rgba(239, 68, 68, 0.1)' : 'var(--surface-color)',
      color: isWarning ? 'var(--danger-color)' : 'var(--text-primary)',
      borderRadius: 'var(--border-radius-md)',
      border: `1px solid ${isWarning ? 'var(--danger-color)' : 'var(--border-color)'}`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      ⏱ {formatTime(timeLeft)}
    </div>
  );
};

export default Timer;

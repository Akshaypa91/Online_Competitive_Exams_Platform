import React from 'react';

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <div style={{
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderLeft: '4px solid var(--danger-color)',
      color: 'var(--danger-color)',
      padding: '1rem',
      borderRadius: 'var(--border-radius-md)',
      marginBottom: '1rem'
    }}>
      {message}
    </div>
  );
};

export default ErrorMessage;

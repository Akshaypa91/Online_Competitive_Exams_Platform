import React from 'react';

const Loading = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center gap-4 py-8">
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-secondary)' }}>{text}</p>
    </div>
  );
};

export default Loading;

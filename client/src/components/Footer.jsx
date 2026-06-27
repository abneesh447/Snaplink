import React from 'react';

export const Footer = ({ variant = 'console' }) => {
  if (variant === 'landing') {
    return (
      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-surface)',
          padding: '16px 24px',
          marginTop: '40px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '13px',
        }}
      >
        <p>© {new Date().getFullYear()} SnapLink Inc. All rights reserved.</p>
      </footer>
    );
  }

  return (
    <footer style={{ marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '8px', paddingBottom: '4px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
      <p>© {new Date().getFullYear()} SnapLink Inc. All rights reserved.</p>
    </footer>
  );
};

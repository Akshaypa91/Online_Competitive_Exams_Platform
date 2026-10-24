import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import { useAuth } from '../../hooks/useAuth';
import ErrorMessage from '../../components/ErrorMessage';
import { GraduationCap, Eye, EyeOff, LogIn, Sparkles, Mail, X } from 'lucide-react';

const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleQuickFill = () => {
    setEmail('student1@example.com');
    setPassword('password123');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both your registered email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await authApi.loginStudent({ email, password });
      login(response.user, response.token);
      navigate('/student/dashboard');
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('The server took too long to respond. Check that the backend is running, then try again.');
      } else if (!err.response && err.message === 'Network Error') {
        setError('Could not reach the server. Check that the backend is running and try again.');
      } else {
        setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--surface-color)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          padding: '2.5rem 2rem',
        }}
      >
        {/* Brand Lockup */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--primary-color)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
            }}
          >
            <GraduationCap size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Candidate Portal
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Sign in to access your competitive exams and scorecards
          </p>
        </div>

        {/* Quick fill demo helper */}
        <div
          style={{
            padding: '0.625rem 0.875rem',
            backgroundColor: 'var(--surface-muted)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed #CBD5E1',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8125rem',
          }}
        >
          <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <Sparkles size={15} style={{ color: 'var(--primary-color)' }} />
            <span>Reviewer Demo:</span>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            style={{
              fontWeight: 600,
              color: 'var(--primary-color)',
              fontSize: '0.8125rem',
              textDecoration: 'underline',
            }}
          >
            Auto-fill student1
          </button>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="student-email">
              Email Address
            </label>
            <input
              id="student-email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center mb-1">
              <label className="form-label" htmlFor="student-password" style={{ margin: 0 }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setResetError('');
                  setResetMessage('');
                  setShowForgotPassword(true);
                }}
                style={{ color: 'var(--primary-color)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}
              >
                Forgot password?
              </button>
            </div>
            <div className="input-wrapper">
              <input
                id="student-password"
                type={showPassword ? 'text' : 'password'}
                className="form-control input-with-right-icon"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: 'var(--text-muted)' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full mt-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In to Examination Portal</span>
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.875rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Don't have a candidate account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Register Now
            </Link>
          </p>
          <p>
            <Link
              to="/admin/login"
              style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}
            >
              Switch to Administrator Portal →
            </Link>
          </p>
        </div>
      </div>

      {showForgotPassword && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowForgotPassword(false);
          }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '1.25rem',
            background: 'rgba(15, 23, 42, 0.42)', backdropFilter: 'blur(4px)',
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-password-title"
            style={{
              position: 'relative', width: '100%', maxWidth: 420, padding: '2rem',
              borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)',
              background: 'var(--surface-color)', boxShadow: 'var(--shadow-xl)',
            }}
          >
            <button
              type="button"
              aria-label="Close forgot password dialog"
              onClick={() => setShowForgotPassword(false)}
              style={{ position: 'absolute', top: 16, right: 16, color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>
            <div style={{
              width: 48, height: 48, display: 'flex', alignItems: 'center',
              justifyContent: 'center', borderRadius: 'var(--radius-lg)',
              background: 'var(--primary-light)', color: 'var(--primary-color)',
              marginBottom: '1rem',
            }}>
              <Mail size={23} />
            </div>
            <h2 id="forgot-password-title" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              Forgot your password?
            </h2>
            <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Enter your registered email to get help recovering your account.
            </p>
            {resetError && <div role="alert" style={{ marginBottom: '1rem', padding: '.75rem', borderRadius: 'var(--radius-md)', background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: '.875rem' }}>{resetError}</div>}
            {resetMessage && <div role="status" style={{ marginBottom: '1rem', padding: '.75rem', borderRadius: 'var(--radius-md)', background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', fontSize: '.875rem' }}>{resetMessage}</div>}
            <form onSubmit={(event) => {
              event.preventDefault();
              setResetError('');
              setResetMessage('');
              setResetLoading(true);
              authApi.requestStudentPasswordReset(resetEmail)
                .then((response) => setResetMessage(response.message || 'If an account exists for that email, a reset link will be sent shortly.'))
                .catch((err) => setResetError(err.response?.data?.message || 'Unable to send the reset email. Please try again later.'))
                .finally(() => setResetLoading(false));
            }}>
              <label className="form-label" htmlFor="reset-email">Registered email address</label>
              <input
                id="reset-email" type="email" className="form-control"
                value={resetEmail} onChange={(event) => setResetEmail(event.target.value)}
                placeholder="candidate@example.com" autoComplete="email" required autoFocus
              />
              <button type="submit" className="btn btn-primary btn-lg w-full mt-4" disabled={resetLoading}>{resetLoading ? 'Sending reset link...' : 'Send reset link'}</button>
            </form>
            <button
              type="button" onClick={() => setShowForgotPassword(false)}
              style={{ width: '100%', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}
            >
              Back to sign in
            </button>
          </section>
        </div>
      )}
    </div>
  );
};

export default StudentLogin;

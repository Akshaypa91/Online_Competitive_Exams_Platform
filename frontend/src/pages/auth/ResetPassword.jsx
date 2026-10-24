import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, LockKeyhole, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';
import { authApi } from '../../services/authApi';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!token) {
      setError('This password reset link is missing its token. Request a new link.');
      return;
    }
    if (password.length < 8) {
      setError('Choose a password with at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    try {
      setLoading(true);
      const response = await authApi.resetStudentPassword(token, password);
      setSuccess(response.message || 'Password updated. You can now sign in.');
      window.setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset the password. Request a new reset link and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', background: 'var(--background-color)',
    }}>
      <section style={{
        width: '100%', maxWidth: 440, padding: '2.5rem 2rem',
        background: 'var(--surface-color)', border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 52, height: 52, margin: '0 auto 1rem', display: 'flex',
            alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-lg)',
            background: 'var(--primary-color)', color: '#fff',
          }}>
            <GraduationCap size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Create a new password</h1>
          <p style={{ marginTop: '.5rem', color: 'var(--text-secondary)', fontSize: '.9rem' }}>
            Choose a strong password for your PrepMaster account.
          </p>
        </div>

        {error && <div role="alert" style={{
          marginBottom: '1rem', padding: '.875rem 1rem', borderRadius: 'var(--radius-md)',
          background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: '.875rem',
        }}>{error}</div>}
        {success && <div role="status" style={{
          marginBottom: '1rem', padding: '.875rem 1rem', borderRadius: 'var(--radius-md)',
          background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', fontSize: '.875rem',
          display: 'flex', gap: '.5rem', alignItems: 'center',
        }}><CheckCircle2 size={18} />{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="new-password">New password</label>
            <div className="input-wrapper">
              <input
                id="new-password" className="form-control input-with-right-icon"
                type={showPassword ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)} minLength={8}
                autoComplete="new-password" placeholder="At least 8 characters" required
              />
              <button type="button" className="input-icon-right" aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((value) => !value)} style={{ color: 'var(--text-muted)' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password" className="form-control" type={showPassword ? 'text' : 'password'}
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password" placeholder="Re-enter your password" required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg w-full mt-4" disabled={loading || Boolean(success)}>
            <LockKeyhole size={18} /> {loading ? 'Updating password...' : 'Update password'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: '.875rem', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
            <ArrowLeft size={16} /> Back to sign in
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ResetPassword;

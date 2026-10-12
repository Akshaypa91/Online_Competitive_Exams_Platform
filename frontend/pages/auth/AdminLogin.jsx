import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import { useAuth } from '../../hooks/useAuth';
import ErrorMessage from '../../components/ErrorMessage';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await authApi.loginAdmin({ email, password });
      login({ ...response.admin, role: 'ADMIN' }, response.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ borderTop: '4px solid var(--danger-color)' }}>
        <h2 className="auth-title">Admin Login</h2>
        <p className="auth-subtitle">Access the administrator portal</p>
        
        <ErrorMessage message={error} />
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter admin email"
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter password"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-danger w-full mt-4 flex justify-center" 
            disabled={isLoading}
          >
            {isLoading ? <div className="spinner" style={{width: 20, height: 20, borderLeftColor: 'white'}}></div> : 'Admin Login'}
          </button>
        </form>
        
        <div className="text-center mt-6" style={{ fontSize: '0.875rem' }}>
          <Link to="/login" style={{ color: 'var(--text-secondary)' }}>Back to Student Login</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

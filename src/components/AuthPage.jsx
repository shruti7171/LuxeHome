import React, { useState } from 'react';
import './AuthPage.css';
import authBg from '../assets/auth_bg.png';
import { getApiUrl } from '../config/api';

const AuthPage = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState('client-login'); // 'client-login', 'client-register', 'admin-login'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setMessage('');
  };

  const handleModeChange = (mode) => {
    setAuthMode(mode);
    setError('');
    setMessage('');
    setFormData({
      username: '',
      email: '',
      password: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isSignup = authMode === 'client-register';
    const endpoint = isSignup ? '/api/signup' : '/api/login';
    
    try {
      const response = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        if (!isSignup) {
          // Verify role matches mode
          if (authMode === 'admin-login' && data.user.role !== 'admin') {
            setError('Access Denied: Only Admin accounts can log in here.');
            return;
          }
          onLogin(data.user);
        } else {
          setMessage('Account created successfully! Please login to continue.');
          setAuthMode('client-login'); // Switch to client login after register
          setFormData({ username: '', email: '', password: '' });
        }
      } else {
        setError(data.message || data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Cannot connect to server. Make sure backend is running.');
    }
  };

  return (
    <div className="auth-container" style={{ backgroundImage: `url(${authBg})` }}>
      <div className="auth-overlay"></div>
      <div className="auth-card glass">
        <div className="auth-header">
          <h2 className="gradient-text">LuxeHome</h2>
          <p>
            {authMode === 'client-login' && 'Welcome back to excellence'}
            {authMode === 'client-register' && 'Begin your journey with LuxeHome'}
            {authMode === 'admin-login' && 'Administrative Access Portal'}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-message">{message}</div>}

        <div className="auth-toggle-group">
          <button 
            className={authMode === 'client-login' ? 'active' : ''} 
            onClick={() => handleModeChange('client-login')}
          >
            Client Login
          </button>
          <button 
            className={authMode === 'client-register' ? 'active' : ''} 
            onClick={() => handleModeChange('client-register')}
          >
            Register
          </button>
          <button 
            className={authMode === 'admin-login' ? 'active' : ''} 
            onClick={() => handleModeChange('admin-login')}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {authMode === 'client-register' && (
            <div className="form-group">
              <label htmlFor="auth-username">Username</label>
              <input 
                id="auth-username"
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe" 
                required 
              />
            </div>
          )}
          
          {authMode !== 'client-register' && (
            <div className="form-group">
              <label htmlFor="auth-username-login">Username</label>
              <input 
                id="auth-username-login"
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username" 
                required 
              />
            </div>
          )}

          {authMode === 'client-register' && (
            <div className="form-group">
              <label htmlFor="auth-email">Email Address</label>
              <input 
                id="auth-email"
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com" 
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input 
              id="auth-password"
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••" 
              required 
            />
          </div>
          
          <button type="submit" className="btn-primary auth-submit">
            {authMode === 'client-login' && 'Sign In'}
            {authMode === 'client-register' && 'Create Account'}
            {authMode === 'admin-login' && 'Admin Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {authMode === 'client-login' && (
              <>
                Don't have an account?{' '}
                <span onClick={() => handleModeChange('client-register')}>Register</span>
              </>
            )}
            {authMode === 'client-register' && (
              <>
                Already have an account?{' '}
                <span onClick={() => handleModeChange('client-login')}>Login</span>
              </>
            )}
            {authMode === 'admin-login' && (
              <>
                Not an administrator?{' '}
                <span onClick={() => handleModeChange('client-login')}>Client Login</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

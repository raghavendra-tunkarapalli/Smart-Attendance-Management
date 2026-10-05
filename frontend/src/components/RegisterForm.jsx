import React, { useState } from 'react';
import { UserPlus, User, Mail, Lock, ShieldCheck, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function RegisterForm({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    role: 'STUDENT',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setSuccess(null);

    if (loading) return;

    if (formData.role === 'ADMIN') {
      setError('Registration for ADMIN role is restricted by system policy.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify password confirmation.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await onRegister(formData);
      setSuccess('Account created successfully. Navigating to Sign In...');
      setTimeout(() => {
        onSwitchToLogin(formData.email, formData.password);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details and try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-20)' }}>
        <h2 style={{ fontFamily: 'var(--font-sf-pro-display)', fontSize: '24px', fontWeight: '600', color: 'var(--color-ink)', margin: '0 0 6px 0' }}>
          Create an Account
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-slate)', margin: 0 }}>
          Register your campus profile for portal access
        </p>
      </div>

      {error && (
        <div className="alert-banner error" style={{ marginBottom: '16px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert-banner success" style={{ marginBottom: '16px' }}>
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={16} />
              <input
                type="text"
                name="firstName"
                className="form-input"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Last Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={16} />
              <input
                type="text"
                name="lastName"
                className="form-input"
                placeholder="Appleseed"
                value={formData.lastName}
                onChange={handleChange}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-wrapper">
              <User className="input-icon" size={16} />
              <input
                type="text"
                name="username"
                className="form-input"
                placeholder="jappleseed"
                value={formData.username}
                onChange={handleChange}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={16} />
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="john@school.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label className="form-label">Account Role</label>
            <select
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="STAFF">Staff</option>
              <option value="PARENT">Parent</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <Lock className="input-icon" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                style={{ paddingRight: '2.5rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide Password' : 'Show Password'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-steel)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <ShieldCheck className="input-icon" size={16} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className="form-input"
                placeholder="••••••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                style={{ paddingRight: '2.5rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-steel)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: '12px' }}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}

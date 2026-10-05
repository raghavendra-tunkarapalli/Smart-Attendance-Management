import React, { useState, useEffect } from 'react';
import { LogIn, Mail, Lock, Sparkles, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function LoginForm({ onLogin, onSwitchToRegister, error, setError, prefillEmail, prefillPassword, successMessage }) {
  const [email, setEmail] = useState(prefillEmail || 'student@school.com');
  const [password, setPassword] = useState(prefillPassword || 'student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
    if (prefillPassword) setPassword(prefillPassword);
  }, [prefillEmail, prefillPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email/username and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onLogin({ email, password });
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    const roleLower = role.toLowerCase();
    const demoEmail = `${roleLower}@school.com`;
    const demoPass = roleLower;

    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);

    try {
      await onLogin({ email: demoEmail, password: demoPass });
    } catch (err) {
      try {
        await onLogin({ email: roleLower, password: demoPass });
      } catch (err2) {
        setError(err2.message || `Quick demo sign-in for ${role} failed.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-20)' }}>
        <h2 style={{ fontFamily: 'var(--font-sf-pro-display)', fontSize: '24px', fontWeight: '600', color: 'var(--color-ink)', margin: '0 0 6px 0' }}>
          Sign In to Portal
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-slate)', margin: 0 }}>
          Enter your credentials or choose a quick role below
        </p>
      </div>

      {successMessage && (
        <div className="alert-banner success" style={{ marginBottom: '16px' }}>
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="alert-banner error" style={{ marginBottom: '16px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email or Username</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={16} />
            <input
              type="text"
              className="form-input"
              placeholder="student@school.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-wrapper" style={{ position: 'relative' }}>
            <Lock className="input-icon" size={16} />
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: '8px' }}>
          {loading ? 'Signing In...' : 'Sign In to Portal'}
        </button>
      </form>

      <div className="demo-section" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-control-gray)' }}>
        <div className="demo-title" style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={13} color="var(--color-pricing-blue)" />
          Quick Role Fast-Access
        </div>
        <div className="demo-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <button type="button" className="btn-demo" onClick={() => handleQuickDemo('Admin')}>
            Admin
          </button>
          <button type="button" className="btn-demo" onClick={() => handleQuickDemo('Teacher')}>
            Teacher
          </button>
          <button type="button" className="btn-demo" onClick={() => handleQuickDemo('Staff')}>
            Staff
          </button>
          <button type="button" className="btn-demo" onClick={() => handleQuickDemo('Parent')}>
            Parent
          </button>
          <button type="button" className="btn-demo" onClick={() => handleQuickDemo('Student')}>
            Student
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AuthModal({
  tab,
  setTab,
  onClose,
  onSuccess,
  showToast
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '0px';

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = tab === 'login' ? { email, password } : { name, email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      onSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  const FormInput = ({ label, icon: Icon, type = 'text', placeholder, value, onChange, required = true }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <span style={{
            position: 'absolute',
            left: 'var(--space-4)',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Icon size={18} strokeWidth={2} />
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          className="form-control"
          style={{ paddingLeft: Icon ? 'var(--space-12)' : 'var(--space-4)' }}
          value={value}
          onChange={onChange}
          required={required}
          disabled={loading}
        />
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-5)',
        overflowY: 'auto',
        animation: 'fadeIn 0.3s ease'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          borderRadius: 'var(--border-radius-2xl)',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-2xl)',
          border: '1px solid var(--border-medium)',
          position: 'relative',
          backgroundColor: 'var(--bg-secondary)',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'fadeInUp 0.4s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{
            position: 'absolute',
            top: 'var(--space-4)',
            right: 'var(--space-4)',
            padding: 'var(--space-2)',
            borderRadius: 'var(--border-radius-md)'
          }}
          title="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
            color: 'white',
            padding: 'var(--space-4)',
            borderRadius: 'var(--border-radius-lg)',
            width: 'fit-content',
            margin: '0 auto var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Lock size={24} />
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            marginBottom: 'var(--space-2)',
            color: 'var(--text-primary)'
          }}>
            {tab === 'login' ? 'Welcome Back' : 'Join Us'}
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem'
          }}>
            {tab === 'login'
              ? 'Sign in to access your orders and wishlist'
              : 'Create an account to get started'}
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--border-radius-lg)',
          padding: 'var(--space-2)',
          marginBottom: 'var(--space-8)',
          gap: 'var(--space-2)'
        }}>
          {['login', 'register'].map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              style={{
                flex: 1,
                padding: 'var(--space-3)',
                background: tab === t ? 'var(--bg-secondary)' : 'transparent',
                border: tab === t ? '1px solid var(--border-medium)' : 'none',
                cursor: 'pointer',
                color: tab === t ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: tab === t ? 700 : 600,
                fontSize: '0.95rem',
                borderRadius: 'var(--border-radius-md)',
                transition: 'var(--transition-fast)',
                textTransform: 'capitalize'
              }}
              disabled={loading}
            >
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              backgroundColor: 'var(--error-light)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--error)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: 'var(--space-6)',
              animation: 'slideDown 0.3s ease'
            }}
          >
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--error)' }} />
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {tab === 'register' && (
            <FormInput
              label="Full Name"
              icon={User}
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <FormInput
            label="Email Address"
            icon={Mail}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: 'var(--space-4)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Lock size={18} strokeWidth={2} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="form-control"
                style={{
                  paddingLeft: 'var(--space-12)',
                  paddingRight: 'var(--space-12)'
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn btn-ghost"
                style={{
                  position: 'absolute',
                  right: 'var(--space-2)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: 'var(--space-2)',
                  borderRadius: 'var(--border-radius-md)',
                  color: 'var(--text-tertiary)'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: 'var(--space-4)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              marginTop: 'var(--space-4)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'var(--transition-fast)'
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner spinner-sm" style={{
                  borderWidth: '2px',
                  borderTop: '2px solid transparent'
                }} />
                Processing...
              </>
            ) : (
              <>
                {tab === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        {tab === 'login' && (
          <div
            style={{
              marginTop: 'var(--space-6)',
              padding: 'var(--space-4)',
              backgroundColor: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(236, 72, 153, 0.02) 100%)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--border-radius-lg)',
              fontSize: '0.85rem'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-3)'
            }}>
              <CheckCircle2 size={16} color="var(--success)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Demo Credentials</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                  Try these accounts:
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-3)'
            }}>
              <div style={{
                backgroundColor: 'var(--bg-tertiary)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Admin</div>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.8rem', marginTop: 'var(--space-1)', fontFamily: 'var(--font-family-mono)' }}>
                  admin@shopnow.com
                </div>
              </div>
              <div style={{
                backgroundColor: 'var(--bg-tertiary)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>User</div>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.8rem', marginTop: 'var(--space-1)', fontFamily: 'var(--font-family-mono)' }}>
                  user@shopnow.com
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

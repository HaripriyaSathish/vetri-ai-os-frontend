import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { isValidUsername, isValidEmail, isValidPassword } from './validators';
import GradientBackground from '../components/GradientBackground';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'trainer' });

  const handleRegister = async () => {
    setError('');
    setSuccess('');

    if (!form.username || !form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!isValidUsername(form.username)) {
      setError('Username must be alphanumeric only (no spaces or symbols).');
      return;
    }
    if (!isValidEmail(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isValidPassword(form.password)) {
      setError('Password must be at least 8 characters, include one uppercase letter and one number.');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/core/register/', form);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const data = err.response?.data;
      const firstError = data ? Object.values(data)[0] : 'Registration failed.';
      setError(Array.isArray(firstError) ? firstError[0] : firstError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <style>{`
        .reg-btn:hover:not(:disabled) { background: #003DAA !important; }
        .reg-btn:disabled { background: #93B4E8 !important; cursor: not-allowed !important; }
        .input-field:focus { border-color: #0051D5 !important; box-shadow: 0 0 0 3px rgba(0,81,213,0.1) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '48px 40px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ background: '#0051D5', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={26} color="#FFFFFF" />
          </div>
        </div>

        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '26px', color: '#1E1B4B', textAlign: 'center', marginBottom: '8px' }}>
          Create Account
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', textAlign: 'center', marginBottom: '32px' }}>
          Join Vetri AI-OS to access your dashboard.
        </p>

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#DC2626' }}>⚠</span>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#DC2626', margin: 0 }}>{error}</p>
          </div>
        )}

        {success && (
          <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#059669' }}>✓</span>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#059669', margin: 0 }}>{success}</p>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px', color: '#45464D', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            Username
          </label>
          <div style={{ position: 'relative' }}>
            <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD', pointerEvents: 'none' }} />
            <input
              className="input-field"
              type="text"
              placeholder="alphanumeric only"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', outline: 'none', background: '#FEFCFF', boxSizing: 'border-box', transition: 'border-color 0.2s ease' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px', color: '#45464D', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            Email
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD', pointerEvents: 'none' }} />
            <input
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', outline: 'none', background: '#FEFCFF', boxSizing: 'border-box', transition: 'border-color 0.2s ease' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px', color: '#45464D', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD', pointerEvents: 'none' }} />
            <input
              className="input-field"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ width: '100%', paddingLeft: '36px', paddingRight: '40px', paddingTop: '10px', paddingBottom: '10px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', outline: 'none', background: '#FEFCFF', boxSizing: 'border-box', transition: 'border-color 0.2s ease' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#C6C6CD', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px', color: '#45464D', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            Role
          </label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', outline: 'none', boxSizing: 'border-box', background: '#FEFCFF' }}
          >
            <option value="trainer">Trainer</option>
            <option value="student">Student</option>
            <option value="intern">Intern</option>
            <option value="hr">HR</option>
            <option value="management">Management</option>
          </select>
        </div>

        <button
          className="reg-btn"
          onClick={handleRegister}
          disabled={loading}
          style={{ width: '100%', background: '#0051D5', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '15px', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px', transition: 'background 0.2s ease' }}
        >
          {loading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Creating account...
            </>
          ) : <>Create Account <span style={{ fontSize: '16px' }}>→</span></>}
        </button>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', textAlign: 'center', margin: 0 }}>
          Already have an account? <Link to="/login" style={{ color: '#0051D5', textDecoration: 'none', fontWeight: 500 }}>Login here</Link>
        </p>
      </div>
    </GradientBackground>
  );
}
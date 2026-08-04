import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { isValidEmail } from './validators';
import GradientBackground from '../components/GradientBackground';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/core/forgot-password/', { email: email.trim() });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <style>{`
        .submit-btn:hover { background: #003DAA !important; }
        .submit-btn:disabled { background: #93B4E8 !important; cursor: not-allowed !important; }
        .input-field:focus { border-color: #0051D5 !important; box-shadow: 0 0 0 3px rgba(0,81,213,0.1) !important; }
        .back-link:hover { color: #0051D5 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '48px 40px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>

        {!sent ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ background: '#0051D5', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={26} color="#FFFFFF" />
              </div>
            </div>

            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '26px', color: '#1E1B4B', textAlign: 'center', marginBottom: '8px' }}>Forgot Password?</h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', textAlign: 'center', marginBottom: '32px' }}>
              Enter your registered email and we'll send you a link to reset your password.
            </p>

            {error && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#DC2626', fontSize: '16px', marginTop: '1px' }}>⚠</span>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#DC2626', margin: 0 }}>{error}</p>
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px', color: '#45464D', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Registered Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD', pointerEvents: 'none' }} />
                <input
                  className="input-field"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', outline: 'none', background: '#FEFCFF', boxSizing: 'border-box', transition: 'border-color 0.2s ease' }}
                />
              </div>
            </div>

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: '100%', background: '#0051D5', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '15px', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px', transition: 'background 0.2s ease' }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Sending...
                </>
              ) : 'Send Reset Link'}
            </button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ background: '#D1FAE5', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={26} color="#059669" />
              </div>
            </div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '24px', color: '#1E1B4B', textAlign: 'center', marginBottom: '8px' }}>Check Your Inbox</h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', textAlign: 'center', marginBottom: '8px' }}>
              If an account exists for
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0B1C30', textAlign: 'center', marginBottom: '8px' }}>
              {email}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', textAlign: 'center', marginBottom: '32px' }}>
              we've sent a password reset link. It expires in 1 hour.
            </p>
          </>
        )}

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" className="back-link" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s ease' }}>
            <ArrowLeft size={15} /> Back to Login
          </Link>
        </div>
      </div>
    </GradientBackground>
  );
}
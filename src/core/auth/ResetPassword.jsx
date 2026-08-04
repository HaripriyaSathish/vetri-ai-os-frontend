import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { isValidPassword } from './validators';
import GradientBackground from '../components/GradientBackground';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (!isValidPassword(password)) {
      setError('Password must be at least 8 characters, include one uppercase letter and one number.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!uid || !token) {
      setError('Invalid or expired reset link.');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/core/reset-password/', { uid, token, new_password: password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'This reset link is invalid or has expired.');
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
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '48px 40px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>

        {!success ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ background: '#0051D5', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={26} color="#FFFFFF" />
              </div>
            </div>

            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '26px', color: '#1E1B4B', textAlign: 'center', marginBottom: '8px' }}>Reset Password</h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', textAlign: 'center', marginBottom: '32px' }}>
              Choose a new password for your account.
            </p>

            {error && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#DC2626', fontSize: '16px', marginTop: '1px' }}>⚠</span>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#DC2626', margin: 0 }}>{error}</p>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px', color: '#45464D', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD', pointerEvents: 'none' }} />
                <input
                  className="input-field"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
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
              <p style={{ fontSize: '12px', color: '#76777D', margin: '6px 0 0' }}>Min 8 characters, 1 uppercase, 1 number.</p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px', color: '#45464D', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#C6C6CD', pointerEvents: 'none' }} />
                <input
                  className="input-field"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', outline: 'none', background: '#FEFCFF', boxSizing: 'border-box', transition: 'border-color 0.2s ease' }}
                />
              </div>
            </div>

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: '100%', background: '#0051D5', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '15px', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s ease' }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Resetting...
                </>
              ) : 'Reset Password'}
            </button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ background: '#D1FAE5', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={26} color="#059669" />
              </div>
            </div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '24px', color: '#1E1B4B', textAlign: 'center', marginBottom: '8px' }}>Password Reset!</h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', textAlign: 'center', marginBottom: '8px' }}>
              Your password has been updated successfully.
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', textAlign: 'center' }}>
              Redirecting to login...
            </p>
          </>
        )}

        {!success && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/login" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#0051D5', textDecoration: 'none', fontWeight: 500 }}>
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </GradientBackground>
  );
}
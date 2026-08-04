import { Link, useLocation } from 'react-router-dom';
import { DoorClosed, Building2 } from 'lucide-react';
import GradientBackground from '../components/GradientBackground';

export default function LoggedOut() {
  const location = useLocation();
  const role = location.state?.role;
  const isStudent = role === 'student';
  const accentColor = isStudent ? '#16A34A' : '#0051D5';

  return (
    <GradientBackground>
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '48px 40px', width: '100%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ background: accentColor, width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DoorClosed size={26} color="#FFFFFF" />
          </div>
        </div>

        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '24px', color: '#1E1B4B', margin: '0 0 8px' }}>
          You've been logged out
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', margin: '0 0 32px' }}>
          Thanks for using Vetri AI-OS. Log back in anytime to continue{isStudent ? ' your training' : ''}.
        </p>

        <Link
          to="/login"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: accentColor, color: '#fff', textDecoration: 'none',
            padding: '12px 24px', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px',
            width: '100%', boxSizing: 'border-box',
          }}
        >
          <Building2 size={18} /> Back to Login
        </Link>
      </div>
    </GradientBackground>
  );
}
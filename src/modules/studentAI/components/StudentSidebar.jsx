import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardCheck, ListChecks, FileText,
  MessageSquareText, TrendingUp, MessageCircle, LogOut, GraduationCap, Video, FileBarChart,
} from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';

const studentMenuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/student' },
  { label: 'Attendance', icon: ClipboardCheck, path: '/student/attendance' },
  { label: 'Daily Tasks', icon: ListChecks, path: '/student/daily-tasks' },
  { label: 'Assignments', icon: FileText, path: '/student/assignments' },
  { label: 'Recordings', icon: Video, path: '/student/recordings' },
  { label: 'Assessments', icon: MessageSquareText, path: '/student/assessments' },
  { label: 'My Progress', icon: TrendingUp, path: '/student/progress' },
  { label: 'Ask Trainer', icon: MessageCircle, path: '/student/ask-trainer' },
  { label: 'Reports', icon: FileBarChart, path: '/student/reports' },
];

export default function StudentSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/logged-out', { state: { role: 'student' } });
  };

  return (
    <aside
      style={{
        width: '260px',
        height: '100vh',
        background: 'linear-gradient(180deg, #06361D 0%, #0A4D26 45%, #0F7A37 100%)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '24px 24px 20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ background: '#16A34A', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <GraduationCap size={20} color="#FFFFFF" />
        </div>
        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#FFFFFF' }}>
          Student AI
        </span>
      </div>

      <nav style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {studentMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/student'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.75)',
              background: isActive ? 'rgba(255,255,255,0.16)' : 'transparent',
              transition: 'background 0.15s ease',
            })}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', marginBottom: '8px' }}>
          {user?.profile_photo ? (
            <img
              src={user.profile_photo}
              alt="Profile"
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px' }}>
                {user?.username?.[0]?.toUpperCase() || 'S'}
              </span>
            </div>
          )}
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#FFFFFF', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.username}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0, textTransform: 'capitalize' }}>
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
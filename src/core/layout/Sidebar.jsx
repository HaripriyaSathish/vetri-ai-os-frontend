import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, ClipboardCheck, FileText, MessageSquareText, LogOut, Building2, TrendingUp, BarChart3, FileBarChart, MessageCircle, UserPlus, UserX, Video, UserMinus, IndianRupee } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import sidebarBg from '../../assets/sidebar-bg.jpg';

const trainerMenuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/trainer' },
  { label: 'Batches', icon: Users, path: '/trainer/batches' },
  { label: 'Lesson Plans', icon: BookOpen, path: '/trainer/lesson-plans' },
  { label: 'Attendance', icon: ClipboardCheck, path: '/trainer/attendance' },
  { label: 'Assignments', icon: FileText, path: '/trainer/assignments' },
  { label: 'Mock Interviews', icon: MessageSquareText, path: '/trainer/mock-interviews' },
  { label: 'Student Progress', icon: TrendingUp, path: '/trainer/student-progress' },
  { label: 'Batch Performance', icon: BarChart3, path: '/trainer/batch-performance' },
  { label: 'Reports', icon: FileBarChart, path: '/trainer/reports' },
  { label: 'Messages', icon: MessageCircle, path: '/trainer/messages' },
  { label: 'Absentees & Recordings', icon: Video, path: '/trainer/absentees-recordings' },
  { label: 'Dropout Tracking', icon: UserX, path: '/trainer/dropout-tracking' },
  { label: 'All Students', icon: Users, path: '/trainer/students' },
  { label: 'Enquiries', icon: ClipboardCheck, path: '/trainer/enquiries' },
  { label: 'Payments', icon: IndianRupee, path: '/trainer/payments' },
  { label: 'Batch Grouping', icon: Users, path: '/trainer/batch-grouping' },
  { label: 'Create Trainer', icon: UserPlus, path: '/trainer/create-trainer' },
  { label: 'All Trainers', icon: Users, path: '/trainer/all-trainers' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isOrgViewer = user?.role === 'admin' || user?.role === 'management';

  const orgOnlyPaths = ['/trainer/students', '/trainer/all-trainers', '/trainer/enquiries', '/trainer/batch-grouping', '/trainer/create-trainer', '/trainer/payments'];
  const trainerOnlyPaths = ['/trainer/lesson-plans', '/trainer/student-progress', '/trainer/messages', '/trainer/batch-performance'];

  const visibleMenuItems = trainerMenuItems.filter((item) => {
    if (orgOnlyPaths.includes(item.path)) return isOrgViewer;
    if (trainerOnlyPaths.includes(item.path)) return !isOrgViewer;
    return true;
  });
  const handleLogout = () => {
    logout();
    navigate('/logged-out');
  };

  return (
    <aside
      style={{
        width: '260px',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `linear-gradient(180deg, rgba(11,15,46,0.88) 0%, rgba(30,27,75,0.9) 45%, rgba(45,27,105,0.92) 100%), url(${sidebarBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '24px 24px 20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.15)', position: 'relative', zIndex: 1, flexShrink: 0 }}>
        <div style={{ background: '#0051D5', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Building2 size={20} color="#FFFFFF" />
        </div>
        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#FFFFFF' }}>
          Vetri AI-OS
        </span>
      </div>

      <nav style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative', zIndex: 1 }}>
        {visibleMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/trainer'}
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
              color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
              background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
              transition: 'background 0.15s ease',
              flexShrink: 0,
            })}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.15)', position: 'relative', zIndex: 1, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', marginBottom: '8px' }}>
          {user?.profile_photo ? (
            <img
              src={user.profile_photo}
              alt="Profile"
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0051D5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px' }}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#FFFFFF', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {[user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || user?.username}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              {user?.username}
              {' · '}
              <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
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
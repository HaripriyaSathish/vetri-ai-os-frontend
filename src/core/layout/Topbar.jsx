import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ChevronDown, User as UserIcon, Mic, MicOff, Bell } from 'lucide-react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import axiosInstance from '../api/axiosInstance';

const navigationCommands = {
  'dashboard': '/trainer',
  'batches': '/trainer/batches',
  'lesson plan': '/trainer/lesson-plans',
  'lesson plans': '/trainer/lesson-plans',
  'attendance': '/trainer/attendance',
  'assignment': '/trainer/assignments',
  'assignments': '/trainer/assignments',
  'mock interview': '/trainer/mock-interviews',
  'mock interviews': '/trainer/mock-interviews',
  'student progress': '/trainer/student-progress',
  'batch performance': '/trainer/batch-performance',
  'reports': '/trainer/reports',
  'profile': '/profile',
  'messages': '/trainer/messages',
};

export default function Topbar({ title }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const isOrgViewer = user?.role === 'admin' || user?.role === 'management';

  useEffect(() => {
    const fetchUnread = () => {
      if (isOrgViewer) {
        axiosInstance.get('/admissions/enquiries/new-count/').then((res) => {
          setUnreadCount(res.data.new_count);
        }).catch(() => {});
      } else {
        axiosInstance.get('/trainer/unread-message-count/').then((res) => {
          setUnreadCount(res.data.unread_count);
        }).catch(() => {});
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isOrgViewer]);

  const handleBellClick = () => {
    navigate(isOrgViewer ? '/trainer/enquiries' : '/trainer/messages');
  };

  const handleVoiceResult = (transcript) => {
    const lower = transcript.toLowerCase().trim();

    const navMatch = lower.match(/^(go to|open|show|navigate to)\s+(.+)/);
    if (navMatch) {
      const target = navMatch[2].trim();
      const matchedKey = Object.keys(navigationCommands).find((key) => target.includes(key));
      if (matchedKey) {
        navigate(navigationCommands[matchedKey]);
        return;
      }
    }

    window.dispatchEvent(new CustomEvent('vetri-voice-input', { detail: transcript }));
  };

  const { listening, supported, startListening, stopListening } = useVoiceInput(handleVoiceResult);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      style={{
        height: '64px', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0,
      }}
    >
      <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '20px', color: '#1E1B4B', margin: 0 }}>
        {title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Notification bell */}
        <button
          onClick={handleBellClick}
          title={isOrgViewer ? 'New Enquiries' : 'Messages'}
          style={{
            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '38px', height: '38px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#F8FAFC',
          }}
        >
          <Bell size={18} color="#1E1B4B" />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute', top: '2px', right: '2px', background: '#DC2626', color: '#fff',
                borderRadius: '999px', fontSize: '10px', fontWeight: 700, minWidth: '16px', height: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Global voice assistant button */}
        {supported && (
          <button
            onClick={listening ? stopListening : startListening}
            title={listening ? 'Stop listening' : 'Say "go to [page]" to navigate, or speak to fill the active field'}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: listening ? '#FEE2E2' : '#EFF4FF',
              color: listening ? '#DC2626' : '#0051D5',
              fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
            }}
          >
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
            {listening ? 'Listening...' : 'Voice Assistant'}
          </button>
        )}

        {/* Profile dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent',
              border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px',
            }}
          >
            {user?.profile_photo ? (
              <img
                src={user.profile_photo}
                alt="Profile"
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0051D5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px' }}>
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#1E1B4B', margin: 0 }}>
                {[user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || user?.username}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', margin: 0 }}>
                {user?.username}
                {' · '}
                <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
              </p>
            </div>
            <ChevronDown size={16} color="#76777D" />
          </button>

          {open && (
            <div
              style={{
                position: 'absolute', top: '52px', right: 0, background: '#fff',
                border: '1px solid #E2E8F0', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                width: '180px', overflow: 'hidden', zIndex: 10,
              }}
            >
              <button
                onClick={() => { setOpen(false); navigate('/profile'); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', textAlign: 'left',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <UserIcon size={16} /> View Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
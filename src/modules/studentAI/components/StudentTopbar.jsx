import { useEffect, useRef, useState } from 'react';
import { ChevronDown, User as UserIcon, Bell } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api';

export default function StudentTopbar({ title }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  const load = () => getNotifications().then((r) => setNotifications(r.data)).catch(() => {});

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
        <div style={{ position: 'relative' }} ref={bellRef}>
          <button
            onClick={() => setBellOpen((v) => !v)}
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

          {bellOpen && (
            <div
              style={{
                position: 'absolute', top: '48px', right: 0, background: '#fff',
                border: '1px solid #E2E8F0', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                width: '320px', maxHeight: '380px', overflowY: 'auto', zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #E2E8F0' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#1E1B4B', margin: 0 }}>Notifications</p>
                <button
                  onClick={() => markAllNotificationsRead().then(load)}
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#16A34A', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Mark all read
                </button>
              </div>
              {notifications.length === 0 && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', textAlign: 'center', padding: '24px 16px' }}>
                  Nothing yet.
                </p>
              )}
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markNotificationRead(n.id).then(load)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #F1F5F9',
                    background: n.is_read ? '#fff' : '#F0FDF4', border: 'none', cursor: 'pointer',
                  }}
                >
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#1E1B4B', margin: 0 }}>{n.title}</p>
                  {n.message && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '2px 0 0' }}>{n.message}</p>}
                </button>
              ))}
            </div>
          )}
        </div>

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
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px' }}>
                  {user?.username?.[0]?.toUpperCase() || 'S'}
                </span>
              </div>
            )}
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#1E1B4B', margin: 0 }}>
                {user?.username}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', margin: 0, textTransform: 'capitalize' }}>
                {user?.role}
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
import { useState, useRef, useEffect } from 'react';
import DashboardShell from '../layout/DashboardShell';
import StudentLayout from '../../modules/studentAI/components/StudentLayout';
import { useAuth } from './AuthContext';
import { updateProfile, uploadAvatar, deleteAvatar } from '../api/profileApi';
import axiosInstance from '../api/axiosInstance';
import { Camera, Trash2, Save, FileText } from 'lucide-react';

function displayName(u) {
  const full = [u?.first_name, u?.last_name].filter(Boolean).join(' ').trim();
  return full || u?.username;
}

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);

  const Shell = user?.role === 'student' ? StudentLayout : DashboardShell;
  const accentColor = user?.role === 'student' ? '#16A34A' : '#0051D5';

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    submission_email: '',
    submission_email_password: '',
    submission_imap_host: '',
    personal_email: '',
    tenth_school: '', tenth_year: '', tenth_percentage: '',
    twelfth_school: '', twelfth_year: '', twelfth_percentage: '',
    ug_degree: '', ug_college: '', ug_year: '', ug_percentage: '',
    pg_degree: '', pg_college: '', pg_year: '', pg_percentage: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    axiosInstance.get('/core/me/').then((res) => {
      refreshUser(res.data);
      setForm({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        phone: res.data.phone || '',
        bio: res.data.bio || '',
        submission_email: res.data.submission_email || '',
        submission_email_password: '',
        submission_imap_host: res.data.submission_imap_host || 'imap.hostinger.com',
        personal_email: res.data.personal_email || '',
        tenth_school: res.data.tenth_school || '', tenth_year: res.data.tenth_year || '', tenth_percentage: res.data.tenth_percentage || '',
        twelfth_school: res.data.twelfth_school || '', twelfth_year: res.data.twelfth_year || '', twelfth_percentage: res.data.twelfth_percentage || '',
        ug_degree: res.data.ug_degree || '', ug_college: res.data.ug_college || '', ug_year: res.data.ug_year || '', ug_percentage: res.data.ug_percentage || '',
        pg_degree: res.data.pg_degree || '', pg_college: res.data.pg_college || '', pg_year: res.data.pg_year || '', pg_percentage: res.data.pg_percentage || '',
      });
      setLoaded(true);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    // Numeric fields must be a real number or null — never an empty string,
    // or Django's PositiveIntegerField/DecimalField reject it with a 400.
    const numericFields = [
      'tenth_year', 'tenth_percentage',
      'twelfth_year', 'twelfth_percentage',
      'ug_year', 'ug_percentage',
      'pg_year', 'pg_percentage',
    ];
    const payload = { ...form };
    numericFields.forEach((field) => {
      if (payload[field] === '' || payload[field] === undefined) {
        payload[field] = null;
      }
    });

    try {
      const res = await updateProfile(payload);
      refreshUser(res.data);
      setForm((prev) => ({
        ...prev,
        submission_imap_host: res.data.submission_imap_host || prev.submission_imap_host,
        submission_email_password: '',
      }));
      setSuccess('Profile updated!');
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadAvatar(file);
      refreshUser(res.data);
      setSuccess('Profile picture updated!');
    } catch (err) {
      setError('Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    setUploading(true);
    try {
      const res = await deleteAvatar();
      refreshUser(res.data);
      setSuccess('Profile picture removed.');
    } catch (err) {
      setError('Failed to remove photo.');
    } finally {
      setUploading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #C6C6CD',
    borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#45464D', display: 'block', marginBottom: '6px',
  };

  if (!loaded) {
    return (
      <Shell title="My Profile">
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>Loading profile...</p>
      </Shell>
    );
  }

  return (
    <Shell title="My Profile">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            {user?.profile_photo ? (
              <img
                src={user.profile_photo}
                alt="Profile"
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '28px' }}>
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
          <div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#1E1B4B', margin: '0 0 2px' }}>
              {displayName(user)}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: '0 0 4px' }}>
              {user?.username}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: '0 0 12px', textTransform: 'capitalize' }}>
              {user?.role}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: accentColor, color: '#fff', border: 'none', borderRadius: '6px',
                  padding: '7px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px',
                }}
              >
                <Camera size={14} /> {uploading ? 'Uploading...' : 'Change Photo'}
              </button>
              {user?.profile_photo && (
                <button
                  onClick={handleAvatarDelete}
                  disabled={uploading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px',
                    padding: '7px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px',
                  }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <form onSubmit={handleSave} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 16px' }}>
            Personal Information
          </h3>

          {error && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
          {success && <p style={{ color: '#059669', fontSize: '13px', marginBottom: '12px' }}>{success}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>First Name</label>
              <input
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. +91 9876543210"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="A short bio about yourself"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {user?.role === 'trainer' && (
            <div style={{ marginTop: '8px', marginBottom: '20px', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
              <h4 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1E1B4B', margin: '0 0 6px' }}>
                Assignment Submission Inbox
              </h4>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 16px' }}>
                Students will email their submissions here, with the subject "Submission of [assignment title]".
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Submission Email Address</label>
                <input
                  value={form.submission_email}
                  onChange={(e) => setForm({ ...form, submission_email: e.target.value })}
                  placeholder="submissions@yourdomain.com"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Email Password</label>
                <input
                  type="password"
                  value={form.submission_email_password}
                  onChange={(e) => setForm({ ...form, submission_email_password: e.target.value })}
                  placeholder="Leave blank to keep unchanged"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>IMAP Host</label>
                <input
                  value={form.submission_imap_host}
                  onChange={(e) => setForm({ ...form, submission_imap_host: e.target.value })}
                  placeholder="imap.hostinger.com"
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {user?.role === 'student' && (
            <div style={{ marginTop: '8px', marginBottom: '20px', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
              <h4 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1E1B4B', margin: '0 0 6px' }}>
                Personal Email
              </h4>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 16px' }}>
                Your own email, separate from your login. (Your official Vetri email, once assigned after fee confirmation, is shown below but managed by the office.)
              </p>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Personal Email</label>
                <input
                  value={form.personal_email}
                  onChange={(e) => setForm({ ...form, personal_email: e.target.value })}
                  placeholder="you@gmail.com"
                  style={inputStyle}
                />
              </div>
              {user?.official_email && (
                <div style={{ background: '#ECFDF5', borderRadius: '8px', padding: '10px 14px', marginBottom: '4px' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#0F7A37', margin: 0 }}>
                    <strong>Official Email:</strong> {user.official_email}
                  </p>
                </div>
              )}

              <h4 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1E1B4B', margin: '24px 0 16px' }}>
                Education
              </h4>

              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#45464D', margin: '0 0 10px' }}>10th Standard</p>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <input value={form.tenth_school} onChange={(e) => setForm({ ...form, tenth_school: e.target.value })} placeholder="School name" style={inputStyle} />
                <input type="number" value={form.tenth_year} onChange={(e) => setForm({ ...form, tenth_year: e.target.value })} placeholder="Year" style={inputStyle} />
                <input type="number" step="0.01" value={form.tenth_percentage} onChange={(e) => setForm({ ...form, tenth_percentage: e.target.value })} placeholder="%" style={inputStyle} />
              </div>

              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#45464D', margin: '0 0 10px' }}>12th Standard</p>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <input value={form.twelfth_school} onChange={(e) => setForm({ ...form, twelfth_school: e.target.value })} placeholder="School name" style={inputStyle} />
                <input type="number" value={form.twelfth_year} onChange={(e) => setForm({ ...form, twelfth_year: e.target.value })} placeholder="Year" style={inputStyle} />
                <input type="number" step="0.01" value={form.twelfth_percentage} onChange={(e) => setForm({ ...form, twelfth_percentage: e.target.value })} placeholder="%" style={inputStyle} />
              </div>

              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#45464D', margin: '0 0 10px' }}>Undergraduate (UG)</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <input value={form.ug_degree} onChange={(e) => setForm({ ...form, ug_degree: e.target.value })} placeholder="Degree e.g. B.E. CSE" style={inputStyle} />
                <input value={form.ug_college} onChange={(e) => setForm({ ...form, ug_college: e.target.value })} placeholder="College" style={inputStyle} />
                <input type="number" value={form.ug_year} onChange={(e) => setForm({ ...form, ug_year: e.target.value })} placeholder="Year" style={inputStyle} />
                <input type="number" step="0.01" value={form.ug_percentage} onChange={(e) => setForm({ ...form, ug_percentage: e.target.value })} placeholder="%/CGPA" style={inputStyle} />
              </div>

              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#45464D', margin: '0 0 10px' }}>Postgraduate (PG) — optional</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr', gap: '12px' }}>
                <input value={form.pg_degree} onChange={(e) => setForm({ ...form, pg_degree: e.target.value })} placeholder="Degree" style={inputStyle} />
                <input value={form.pg_college} onChange={(e) => setForm({ ...form, pg_college: e.target.value })} placeholder="College" style={inputStyle} />
                <input type="number" value={form.pg_year} onChange={(e) => setForm({ ...form, pg_year: e.target.value })} placeholder="Year" style={inputStyle} />
                <input type="number" step="0.01" value={form.pg_percentage} onChange={(e) => setForm({ ...form, pg_percentage: e.target.value })} placeholder="%/CGPA" style={inputStyle} />
              </div>

              <h4 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1E1B4B', margin: '24px 0 16px' }}>
                Certificates & Documents
              </h4>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 12px' }}>
                These are uploaded by our team once verified — reach out if anything looks incorrect.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: '10th Marksheet', url: user?.tenth_marksheet_url },
                  { label: '12th Marksheet', url: user?.twelfth_marksheet_url },
                  { label: 'UG Degree Certificate', url: user?.degree_certificate_url },
                  { label: 'PG Certificate', url: user?.pg_certificate_url },
                  { label: 'Terms & Conditions', url: user?.terms_conditions_doc_url },
                ].map(({ label, url }) => (
                  <div key={label} style={{ background: '#F8FAFC', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={15} color={url ? '#16A34A' : '#C6C6CD'} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#1E1B4B' }}>{label}</span>
                    </div>
                    {url ? (
                      <a href={url} target="_blank" rel="noreferrer" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>View PDF</a>
                    ) : (
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D' }}>Not uploaded yet</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: accentColor, color: '#fff', border: 'none', borderRadius: '8px',
              padding: '10px 20px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px',
            }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </Shell>
  );
}
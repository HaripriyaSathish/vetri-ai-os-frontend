import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardShell from '../../../core/layout/DashboardShell';
import { useAuth } from '../../../core/auth/AuthContext';
import { getStudentProfile, updateOfficialEmail } from '../api';
import { ArrowLeft, Award, Video, FileText } from 'lucide-react';
import DocumentUploadPanel from '../components/DocumentUploadPanel';

const CATEGORY_LABEL = { task: 'Daily Task', mini_project: 'Mini Project', main_project: 'Main Project' };

function Pill({ label, tone }) {
  const styles = {
    green: { background: '#DCFCE7', color: '#059669' },
    red: { background: '#FEE2E2', color: '#DC2626' },
    amber: { background: '#FEF3C7', color: '#D97706' },
    gray: { background: '#F1F5F9', color: '#45464D' },
  }[tone];
  return (
    <span style={{ ...styles, padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
      {label}
    </span>
  );
}

function displayName(s) {
  const full = [s.first_name, s.last_name].filter(Boolean).join(' ').trim();
  return full || s.username;
}
function trainerDisplayName(b) {
  const full = [b.trainer_first_name, b.trainer_last_name].filter(Boolean).join(' ').trim();
  return full || b.trainer_username;
}

export default function StudentProfile() {
  const { batchId, studentId } = useParams();
  const navigate = useNavigate();
  const { user: loggedInUser } = useAuth();
  const isOrgViewer = loggedInUser?.role === 'admin' || loggedInUser?.role === 'management';
  const canManageDocuments = loggedInUser?.role === 'management';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const [editingEmail, setEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');

  const loadProfile = () => {
    getStudentProfile(batchId, studentId)
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load this student\'s profile.'));
  };

  useEffect(() => {
    loadProfile();
  }, [batchId, studentId]);

  const handleSaveEmail = async () => {
    setEmailError('');
    if (!emailInput.trim()) {
      setEmailError('Enter a valid email.');
      return;
    }
    setSavingEmail(true);
    try {
      await updateOfficialEmail(data.student.id, emailInput.trim());
      setEditingEmail(false);
      loadProfile();
    } catch (err) {
      setEmailError(err.response?.data?.official_email?.[0] || 'Failed to update email.');
    } finally {
      setSavingEmail(false);
    }
  };

  const thStyle = {
    padding: '10px 14px', textAlign: 'left', fontFamily: 'Inter, sans-serif',
    fontWeight: 600, fontSize: '12px', color: '#76777D', borderBottom: '1px solid #E2E8F0',
  };
  const tdStyle = {
    padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: '13px',
    color: '#45464D', borderBottom: '1px solid #F1F5F9',
  };

  if (error) {
    return (
      <DashboardShell title="Student Profile">
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#DC2626' }}>{error}</p>
      </DashboardShell>
    );
  }

  if (!data) {
    return (
      <DashboardShell title="Student Profile">
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>Loading...</p>
      </DashboardShell>
    );
  }

  const mock = data.mock_interview;
  const edu = data.student.education;

  return (
    <DashboardShell title={displayName(data.student)}>
      <button
        onClick={() => navigate(`/trainer/batches/${batchId}`)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent',
          border: 'none', cursor: 'pointer', color: '#76777D', fontFamily: 'Inter, sans-serif',
          fontSize: '13px', marginBottom: '20px', padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Back to {data.batch.name}
      </button>

      {/* Overview */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#1E1B4B', margin: '0 0 4px' }}>
              {displayName(data.student)}
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: 0 }}>{data.student.username} · {data.student.email}</p>
          </div>
          <Pill label={data.eligible ? 'Mock Interview Eligible' : 'Not Yet Eligible'} tone={data.eligible ? 'green' : 'red'} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 4px' }}>Attendance</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 700, color: (data.attendance_percentage ?? 0) >= 85 ? '#059669' : '#DC2626', margin: 0 }}>
              {data.attendance_percentage != null ? `${data.attendance_percentage}%` : '—'}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', margin: '2px 0 0' }}>
              {data.present_days} / {data.total_days} days present
            </p>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 4px' }}>Batch</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: 700, color: '#0051D5', margin: 0 }}>
              {data.batch.name}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', margin: '2px 0 0' }}>
              Trainer: {trainerDisplayName(data.batch)}
            </p>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 4px' }}>Mock Interview</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: 700, color: mock.score != null ? '#059669' : '#76777D', margin: 0 }}>
              {mock.score != null ? `Score: ${mock.score}` : mock.invited ? 'Invited' : 'Not invited'}
            </p>
          </div>
        </div>
      </div>

      {/* Personal & Education */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          {data.student.profile_photo ? (
            <img src={data.student.profile_photo} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#0051D5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '24px' }}>{data.student.username[0]?.toUpperCase()}</span>
            </div>
          )}
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: 0 }}>Phone: {data.student.phone || '—'}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: '2px 0 0' }}>Personal Email: {data.student.personal_email || '—'}</p>

            {editingEmail ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="username@vetrifresh.com"
                  style={{ padding: '6px 10px', border: '1px solid #C6C6CD', borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '12px', width: '220px' }}
                />
                <button
                  onClick={handleSaveEmail}
                  disabled={savingEmail}
                  style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px' }}
                >
                  {savingEmail ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditingEmail(false); setEmailError(''); }}
                  style={{ background: 'transparent', border: 'none', color: '#76777D', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '11px' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#059669', margin: '2px 0 0', fontWeight: 600 }}>
                  Official Email: {data.student.official_email || 'Not assigned yet'}
                </p>
                {isOrgViewer && (
                  <button
                    onClick={() => { setEditingEmail(true); setEmailInput(data.student.official_email || ''); }}
                    style={{ background: 'transparent', border: 'none', color: '#0051D5', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600 }}
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
            {emailError && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#DC2626', margin: '4px 0 0' }}>{emailError}</p>}
          </div>
        </div>

        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1E1B4B', margin: '0 0 12px' }}>Education</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {[
            { label: '10th Standard', d: edu.tenth, key: 'school' },
            { label: '12th Standard', d: edu.twelfth, key: 'school' },
            { label: 'Undergraduate', d: edu.ug, key: 'degree' },
            { label: 'Postgraduate', d: edu.pg, key: 'degree' },
          ].map(({ label, d, key }) => (
            <div key={label} style={{ background: '#F8FAFC', borderRadius: '8px', padding: '12px 14px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#76777D', margin: '0 0 4px' }}>{label}</p>
              {!d[key] ? (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: 0 }}>Not provided</p>
              ) : (
                <>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#1E1B4B', margin: 0 }}>{d[key]}{d.college ? ` — ${d.college}` : ''}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '2px 0 0' }}>{d.year || '—'} {d.percentage ? `· ${d.percentage}%` : ''}</p>
                </>
              )}
            </div>
          ))}
        </div>

        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1E1B4B', margin: '20px 0 12px' }}>Certificates & Documents</h3>
        {canManageDocuments ? (
          <DocumentUploadPanel
            userId={data.student.id}
            documents={[
              { key: 'tenth', label: '10th Marksheet', url: data.student.tenth_marksheet_url },
              { key: 'twelfth', label: '12th Marksheet', url: data.student.twelfth_marksheet_url },
              { key: 'degree', label: 'UG Degree Certificate', url: data.student.degree_certificate_url },
              { key: 'pg', label: 'PG Certificate', url: data.student.pg_certificate_url },
              { key: 'terms', label: 'Terms & Conditions (Signed)', url: data.student.terms_conditions_doc_url },
            ]}
            onUploaded={loadProfile}
          />
        ) : (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { label: '10th Marksheet', url: data.student.tenth_marksheet_url },
              { label: '12th Marksheet', url: data.student.twelfth_marksheet_url },
              { label: 'UG Degree Certificate', url: data.student.degree_certificate_url },
              { label: 'PG Certificate', url: data.student.pg_certificate_url },
              { label: 'Terms & Conditions', url: data.student.terms_conditions_doc_url },
            ].map(({ label, url }) => (
              <div key={label} style={{ background: '#F8FAFC', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={15} color={url ? '#16A34A' : '#C6C6CD'} />
                {url ? (
                  <a href={url} target="_blank" rel="noreferrer" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#0051D5' }}>{label}</a>
                ) : (
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D' }}>{label} — not uploaded</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignment breakdown */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 16px' }}>
          Assignment Breakdown
        </h3>
        {data.category_breakdown.map((block) => (
          <div key={block.category} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#1E1B4B', margin: 0 }}>
                {CATEGORY_LABEL[block.category]}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: 0 }}>
                {block.submitted} / {block.total} submitted
              </p>
            </div>
            {block.rows.length === 0 ? (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: 0 }}>None assigned yet.</p>
            ) : (
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      <th style={thStyle}>Title</th>
                      <th style={thStyle}>Due Date</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((r) => (
                      <tr key={r.id}>
                        <td style={tdStyle}>{r.title}</td>
                        <td style={tdStyle}>{r.due_date}</td>
                        <td style={tdStyle}>
                          {!r.submitted ? <Pill label="Not submitted" tone="red" /> : r.on_time ? <Pill label="On time" tone="green" /> : <Pill label="Late" tone="amber" />}
                        </td>
                        <td style={tdStyle}>{r.score != null ? `${r.score} / 100` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mock interview details */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Award size={18} color="#0051D5" />
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: 0 }}>
            Mock Interview
          </h3>
        </div>
        {!mock.invited ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', margin: 0 }}>Not invited yet.</p>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              {mock.attended == null ? <Pill label="Awaiting session" tone="amber" /> : mock.attended ? <Pill label="Attended" tone="green" /> : <Pill label="Missed" tone="red" />}
              {mock.scheduled_datetime && (
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D' }}>
                  {new Date(mock.scheduled_datetime).toLocaleString()}
                </span>
              )}
            </div>
            {mock.meeting_link && (
              <a href={mock.meeting_link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#0051D5', marginBottom: '10px' }}>
                <Video size={14} /> {mock.meeting_link}
              </a>
            )}
            {mock.feedback && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', margin: 0 }}>{mock.feedback}</p>}
          </div>
        )}
      </div>

      {/* Report notes */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 16px' }}>
          Personal Feedback History
        </h3>
        {data.student_notes.length === 0 ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', margin: 0 }}>
            No individual notes found for this student in any generated report yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.student_notes.map((n, i) => (
              <div key={i} style={{ background: '#F8FAFC', borderRadius: '8px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#76777D' }}>{n.report_title}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D' }}>{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#1E1B4B', margin: 0 }}>{n.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../../../core/layout/DashboardShell';
import { getTrainerDirectory } from '../api';
import { Search, Users, BookOpen } from 'lucide-react';


function displayName(t) {
  const full = [t.first_name, t.last_name].filter(Boolean).join(' ').trim();
  return full || t.username;
}

export default function TrainerDirectory() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getTrainerDirectory()
      .then((res) => setTrainers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return trainers.filter((t) =>
      displayName(t).toLowerCase().includes(q) ||
      t.username.toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q)
    );
  }, [trainers, search]);

  const thStyle = {
    padding: '10px 14px', textAlign: 'left', fontFamily: 'Inter, sans-serif',
    fontWeight: 600, fontSize: '12px', color: '#76777D', borderBottom: '1px solid #E2E8F0',
  };
  const tdStyle = {
    padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: '13px',
    color: '#45464D', borderBottom: '1px solid #F1F5F9',
  };

  return (
    <DashboardShell title="All Trainers">
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', maxWidth: '400px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#76777D" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, username, or email..."
            style={{ width: '100%', paddingLeft: '36px', padding: '9px 12px 9px 36px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 12px' }}>
        Showing {filtered.length} of {trainers.length} trainer(s)
      </p>

      {loading ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>No trainers found.</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Trainer', 'Email', 'Phone', 'Batches', 'Ongoing', 'Completed', 'Total Students'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} onClick={() => navigate(`/trainer/all-trainers/${t.id}`)} style={{ cursor: 'pointer' }}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {t.profile_photo ? (
                        <img src={t.profile_photo} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#0051D5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px' }}>
                            {t.username?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: '#1E1B4B' }}>{displayName(t)}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#76777D' }}>{t.username}</p>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>{t.email || '—'}</td>
                  <td style={tdStyle}>{t.phone || '—'}</td>
                  <td style={tdStyle}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BookOpen size={13} color="#0051D5" /> {t.batch_count}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: '#FEF3C7', color: '#D97706' }}>
                      {t.ongoing_count}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: '#F1F5F9', color: '#45464D' }}>
                      {t.completed_count}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={13} color="#059669" /> {t.student_count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
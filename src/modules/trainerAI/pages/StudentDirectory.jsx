import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../../../core/layout/DashboardShell';
import { getStudentDirectory, getBatches, getTrainers } from '../api';
import { Search, Users } from 'lucide-react';

function Pill({ label, tone }) {
  const styles = {
    green: { background: '#DCFCE7', color: '#059669' },
    amber: { background: '#FEF3C7', color: '#D97706' },
    gray: { background: '#F1F5F9', color: '#45464D' },
  }[tone];
  return (
    <span style={{ ...styles, padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
      {label}
    </span>
  );
}

const MOCK_TONE = {
  'Scored': 'green', 'Attended': 'green', 'Invited': 'amber', 'Missed': 'amber', 'Not invited': 'gray',
};

function displayName(s) {
  const full = [s.first_name, s.last_name].filter(Boolean).join(' ').trim();
  return full || s.username;
}
function trainerDisplayName(b) {
  const full = [b.trainer_first_name, b.trainer_last_name].filter(Boolean).join(' ').trim();
  return full || b.trainer_username;
}
export default function StudentDirectory() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [allTrainers, setAllTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [trainerFilter, setTrainerFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');

  useEffect(() => {
    Promise.all([getStudentDirectory(), getBatches(), getTrainers()])
      .then(([studentsRes, batchesRes, trainersRes]) => {
        setStudents(studentsRes.data);
        setAllBatches(batchesRes.data);
        setAllTrainers(trainersRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Every trainer, straight from the batch list — not inferred from
  // enrolled students, so a trainer with zero students still shows up.
  // Every registered trainer, straight from the trainer list itself —
  // not inferred from batches, so a trainer with zero batches still shows up.
  const trainerOptions = useMemo(() => {
    return allTrainers.map((t) => t.username).sort();
  }, [allTrainers]);

  const batchOptions = useMemo(() => {
    let pool = allBatches;
    if (trainerFilter) pool = pool.filter((b) => b.trainer_username === trainerFilter);
    return pool.map((b) => b.name).sort();
  }, [allBatches, trainerFilter]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter((s) => {
      const matchesSearch =
        s.username.toLowerCase().includes(q) ||
        displayName(s).toLowerCase().includes(q) ||
        (s.course_name || '').toLowerCase().includes(q) ||
        (s.personal_email || '').toLowerCase().includes(q);
      const matchesTrainer = !trainerFilter || s.trainer_username === trainerFilter;
      const matchesBatch = !batchFilter || s.batch_name === batchFilter;
      return matchesSearch && matchesTrainer && matchesBatch;
    });
  }, [students, search, trainerFilter, batchFilter]);

  const thStyle = {
    padding: '10px 14px', textAlign: 'left', fontFamily: 'Inter, sans-serif',
    fontWeight: 600, fontSize: '12px', color: '#76777D', borderBottom: '1px solid #E2E8F0',
  };
  const tdStyle = {
    padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: '13px',
    color: '#45464D', borderBottom: '1px solid #F1F5F9',
  };
  const selectStyle = {
    padding: '9px 12px', border: '1px solid #C6C6CD', borderRadius: '8px',
    fontFamily: 'Inter, sans-serif', fontSize: '13px', background: '#fff', minWidth: '180px',
  };

  return (
    <DashboardShell title="All Students">
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'end' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="#76777D" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, course, or email..."
            style={{ width: '100%', paddingLeft: '36px', padding: '9px 12px 9px 36px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <select
          value={trainerFilter}
          onChange={(e) => { setTrainerFilter(e.target.value); setBatchFilter(''); }}
          style={selectStyle}
        >
          <option value="">All Trainers</option>
          {trainerOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Batches</option>
          {batchOptions.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        {(trainerFilter || batchFilter || search) && (
          <button
            onClick={() => { setSearch(''); setTrainerFilter(''); setBatchFilter(''); }}
            style={{ background: 'transparent', border: 'none', color: '#0051D5', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            Clear filters
          </button>
        )}
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 12px' }}>
        Showing {filtered.length} of {students.length} student(s)
        {batchFilter && filtered.length === 0 && (
          <span> — this batch has no enrolled students yet.</span>
        )}
      </p>

      {loading ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>No students found.</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Student', 'Trainer', 'Course / Batch', 'Attendance', 'Assignments', 'Mock Interview'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => s.batch_id && navigate(`/trainer/batches/${s.batch_id}/students/${s.id}`)}
                  style={{ cursor: s.batch_id ? 'pointer' : 'default' }}
                >
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {s.profile_photo ? (
                        <img src={s.profile_photo} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#0051D5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px' }}>
                            {s.username?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: '#1E1B4B' }}>{displayName(s)}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#76777D' }}>
                          {(s.first_name || s.last_name) ? s.username : (s.personal_email || s.official_email || 'No email on file')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>{s.trainer_username ? trainerDisplayName(s) : '—'}</td>
                  <td style={tdStyle}>
                    {s.course_name || <span style={{ color: '#76777D' }}>Not enrolled</span>}
                    {s.batch_status && <span style={{ marginLeft: '8px' }}><Pill label={s.batch_status === 'completed' ? 'Completed' : 'Ongoing'} tone={s.batch_status === 'completed' ? 'gray' : 'green'} /></span>}
                  </td>
                  <td style={tdStyle}>{s.attendance_percentage != null ? `${s.attendance_percentage}%` : '—'}</td>
                  <td style={tdStyle}>{s.total_assignments > 0 ? `${s.assignments_submitted}/${s.total_assignments}` : '—'}</td>
                  <td style={tdStyle}><Pill label={s.mock_interview_status} tone={MOCK_TONE[s.mock_interview_status] || 'gray'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
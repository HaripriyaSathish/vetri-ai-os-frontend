import { useState, useEffect } from 'react';
import DashboardShell from '../../../core/layout/DashboardShell';
import { getBatches, getBatchEnrollmentStatus, markDiscontinued, reactivateStudent } from '../api';
import { UserMinus, UserCheck, AlertTriangle } from 'lucide-react';

export default function DropoutTracking() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [actionStudent, setActionStudent] = useState(null); // { student_id, name }
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBatches().then((res) => {
      setBatches(res.data);
      if (res.data.length > 0) setSelectedBatch(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedBatch) load();
  }, [selectedBatch]);

  const load = () => {
    setLoading(true);
    getBatchEnrollmentStatus(selectedBatch).then((res) => setStudents(res.data)).finally(() => setLoading(false));
  };

  const openDiscontinueForm = (student) => {
    setActionStudent(student);
    setReason('');
  };

  const handleConfirmDiscontinue = async () => {
    setSaving(true);
    try {
      await markDiscontinued({
        batch_id: selectedBatch,
        student_id: actionStudent.student_id,
        discontinued_date: new Date().toISOString().slice(0, 10),
        reason,
      });
      setActionStudent(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleReactivate = async (studentId) => {
    await reactivateStudent({ batch_id: selectedBatch, student_id: studentId });
    load();
  };

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', boxSizing: 'border-box' };
  const labelStyle = { fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#1E1B4B', display: 'block', marginBottom: '6px' };
  const thStyle = { padding: '10px 14px', textAlign: 'left', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: '#76777D', borderBottom: '1px solid #E2E8F0' };
  const tdStyle = { padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', borderBottom: '1px solid #F1F5F9' };

  return (
    <DashboardShell title="Dropout Tracking">
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', maxWidth: '340px' }}>
        <label style={labelStyle}>Batch</label>
        <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} style={inputStyle}>
          {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {loading ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>Loading...</p>
      ) : students.length === 0 ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>No students enrolled in this batch yet.</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Student', 'Status', 'Current Streak', 'Total Absent Days', 'Discontinued Date', 'Reason', 'Action'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.student_id} style={{ background: s.is_candidate ? '#FEF3C7' : 'transparent' }}>
                  <td style={tdStyle}>
                    {s.name}
                    {s.is_candidate && (
                      <span style={{ marginLeft: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#92400E', fontSize: '11px', fontWeight: 600 }}>
                        <AlertTriangle size={12} /> Candidate
                      </span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: s.status === 'active' ? '#DCFCE7' : '#FEE2E2', color: s.status === 'active' ? '#059669' : '#DC2626' }}>
                      {s.status === 'active' ? 'Active' : 'Discontinued'}
                    </span>
                  </td>
                  <td style={tdStyle}>{s.current_absence_streak} day(s)</td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 600, color: s.total_absent_days > 0 ? '#DC2626' : '#76777D' }}>
                      {s.total_absent_days} day(s)
                    </span>
                  </td>
                  <td style={tdStyle}>{s.discontinued_date || '—'}</td>
                  <td style={tdStyle}>{s.discontinued_reason || '—'}</td>
                  <td style={tdStyle}>
                    {s.status === 'active' ? (
                      <button
                        onClick={() => openDiscontinueForm(s)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600 }}
                      >
                        <UserMinus size={13} /> Mark Discontinued
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivate(s.student_id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#059669', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600 }}
                      >
                        <UserCheck size={13} /> Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {actionStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,30,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '420px', maxWidth: '100%', padding: '24px' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#1E1B4B', margin: '0 0 14px' }}>
              Mark {actionStudent.name} as Discontinued
            </h3>
            <label style={labelStyle}>Reason (optional)</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} style={{ ...inputStyle, marginBottom: '16px' }} placeholder="e.g. Stopped attending, no response to outreach" />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setActionStudent(null)} style={{ flex: 1, background: '#F8FAFC', color: '#45464D', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px' }}>
                Cancel
              </button>
              <button onClick={handleConfirmDiscontinue} disabled={saving} style={{ flex: 1, background: '#DC2626', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
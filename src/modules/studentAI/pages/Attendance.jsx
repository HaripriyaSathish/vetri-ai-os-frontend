import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, CalendarDays } from 'lucide-react';
import { getAttendance } from '../api';

const STATUS_STYLE = {
  present: { color: '#16A34A', background: '#ECFDF5' },
  late: { color: '#D97706', background: '#FFFBEB' },
  absent: { color: '#DC2626', background: '#FEF2F2' },
};

function StatBlock({ icon: Icon, iconBg, iconColor, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: iconBg, flexShrink: 0 }}>
        <Icon size={20} color={iconColor} />
      </div>
      <div>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 700, color: '#1E1B4B', margin: 0 }}>{value}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '2px 0 0' }}>{label}</p>
      </div>
    </div>
  );
}

export default function Attendance() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    getAttendance().then((r) => setRecords(r.data)).catch(() => {});
  }, []);

  const summary = useMemo(() => {
    if (!records.length) return null;
    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;
    return {
      total: records.length,
      present,
      absent,
      late,
      pct: Math.round((present / records.length) * 100),
    };
  }, [records]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {summary && (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 20px' }}>
            Overall Attendance
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '36px', fontWeight: 700, color: '#16A34A', margin: 0 }}>{summary.pct}%</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '4px 0 0' }}>of {summary.total} recorded days</p>
            </div>
            <StatBlock icon={CheckCircle2} iconBg="#ECFDF5" iconColor="#16A34A" label="Days Present" value={summary.present} />
            <StatBlock icon={XCircle} iconBg="#FEF2F2" iconColor="#DC2626" label="Days Absent" value={summary.absent} />
            <StatBlock icon={CalendarDays} iconBg="#FFFBEB" iconColor="#D97706" label="Days Late" value={summary.late} />
          </div>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
              <th style={{ padding: '14px 24px', color: '#76777D', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '14px 24px', color: '#76777D', fontWeight: 600 }}>Batch</th>
              <th style={{ padding: '14px 24px', color: '#76777D', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                <td style={{ padding: '14px 24px', color: '#1E1B4B' }}>{r.date}</td>
                <td style={{ padding: '14px 24px', color: '#76777D' }}>{r.batch_label}</td>
                <td style={{ padding: '14px 24px' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, ...STATUS_STYLE[r.status] }}>{r.status}</span>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: '#76777D' }}>No attendance records yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
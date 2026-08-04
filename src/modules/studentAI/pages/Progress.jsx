import { useEffect, useState } from 'react';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getProgress, getAssignments, getAttendance } from '../api';

const ATTENDANCE_COLORS = { present: '#16A34A', late: '#D97706', absent: '#DC2626' };

function ScoreTrendChart({ assignments }) {
  const data = assignments
    .filter((a) => a.my_submission?.score != null)
    .sort((a, b) => new Date(a.my_submission.submitted_at) - new Date(b.my_submission.submitted_at))
    .map((a) => ({
      label: a.title.length > 12 ? a.title.slice(0, 12) + '…' : a.title,
      score: a.my_submission.score,
    }));

  if (data.length === 0) {
    return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D' }}>No graded assignments yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F0" />
        <XAxis dataKey="label" tick={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fill: '#76777D' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fill: '#76777D' }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value) => [`${value} / 100`, 'Score']}
          contentStyle={{ fontFamily: 'Inter, sans-serif', fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
        />
        <Line type="monotone" dataKey="score" stroke="#16A34A" strokeWidth={2.5} dot={{ r: 4, fill: '#16A34A' }} activeDot={{ r: 6 }} animationDuration={800} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function AttendancePieChart({ records }) {
  const present = records.filter((r) => r.status === 'present').length;
  const late = records.filter((r) => r.status === 'late').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const data = [
    { name: 'Present', value: present, key: 'present' },
    { name: 'Late', value: late, key: 'late' },
    { name: 'Absent', value: absent, key: 'absent' },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D' }}>No attendance data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3} animationDuration={800}>
          {data.map((d) => <Cell key={d.key} fill={ATTENDANCE_COLORS[d.key]} />)}
        </Pie>
        <Tooltip contentStyle={{ fontFamily: 'Inter, sans-serif', fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
        <Legend
          verticalAlign="bottom"
          height={28}
          formatter={(value) => <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#45464D' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function Progress() {
  const [reports, setReports] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([getProgress(), getAssignments(), getAttendance()])
      .then(([rep, asg, att]) => {
        setReports(rep.data);
        setAssignments(asg.data);
        setAttendance(att.data);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const myFeedback = reports.filter((r) => r.my_note);
  const latestSummary = reports.find((r) => r.executive_summary)?.executive_summary;
  const batchLabel = reports[0]?.title;

  if (!loaded) return <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>Loading…</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <TrendingUp size={18} color="#16A34A" />
        <div>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 600, color: '#1E1B4B', margin: 0 }}>
            {batchLabel || 'Your Progress'}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '2px 0 0' }}>
            Personalized feedback your trainer's AI has written specifically about you, over time.
          </p>
        </div>
      </div>

      {latestSummary && (
        <div style={{ background: '#ECFDF5', borderRadius: '12px', padding: '18px 24px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#0F7A37', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px', fontWeight: 600 }}>
            Latest Batch Summary
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#0F7A37', margin: 0, lineHeight: 1.6 }}>{latestSummary}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <TrendingUp size={16} color="#16A34A" />
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, color: '#1E1B4B', margin: 0 }}>Score Trend</p>
          </div>
          <ScoreTrendChart assignments={assignments} />
        </div>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <PieChartIcon size={16} color="#16A34A" />
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, color: '#1E1B4B', margin: 0 }}>Attendance Breakdown</p>
          </div>
          <AttendancePieChart records={attendance} />
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
              <th style={{ padding: '14px 24px', color: '#76777D', fontWeight: 600, width: '180px' }}>Date</th>
              <th style={{ padding: '14px 24px', color: '#76777D', fontWeight: 600 }}>Feedback About You</th>
            </tr>
          </thead>
          <tbody>
            {myFeedback.map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                <td style={{ padding: '14px 24px', color: '#76777D', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                  {new Date(r.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ padding: '14px 24px', color: '#1E1B4B', lineHeight: 1.6 }}>{r.my_note}</td>
              </tr>
            ))}
            {myFeedback.length === 0 && (
              <tr>
                <td colSpan={2} style={{ padding: '32px', textAlign: 'center', color: '#76777D' }}>
                  No individual feedback about you yet — this fills in once your trainer generates a batch report that mentions you by name.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
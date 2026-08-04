import { useEffect, useState } from 'react';
import { ClipboardList, AlertTriangle, Bell, TrendingUp, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { getDashboard, getAttendance, getAssignments } from '../api';

const fadeKeyframes = `
@keyframes saFadeInUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

function FadeIn({ delay = 0, children, style }) {
  return (
    <div style={{ animation: `saFadeInUp 0.5s ease both`, animationDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

function AttendanceRing({ percent }) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimatedPercent(percent ?? 0), 150);
    return () => clearTimeout(t);
  }, [percent]);

  const size = 120, stroke = 10, radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercent / 100) * circumference;
  const color = animatedPercent >= 85 ? '#16A34A' : animatedPercent >= 60 ? '#D97706' : '#DC2626';

  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="#EEF2F0" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={stroke} fill="none"
        strokeLinecap="round" strokeDasharray={circumference}
        strokeDashoffset={percent == null ? circumference : offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="#1E1B4B" fontSize="22" fontFamily="Poppins, sans-serif" fontWeight="600">
        {percent != null ? `${percent}%` : '—'}
      </text>
    </svg>
  );
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
    >
      <div style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: iconBg, marginBottom: '16px' }}>
        <Icon size={20} color={iconColor} />
      </div>
      <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '28px', fontWeight: 700, color: '#1E1B4B', margin: 0 }}>{value}</p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: '4px 0 0' }}>{label}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
      <Icon size={18} color="#16A34A" />
      <div>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 600, color: '#1E1B4B', margin: 0 }}>{title}</p>
        {subtitle && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '2px 0 0' }}>{subtitle}</p>}
      </div>
    </div>
  );
}

const ATTENDANCE_COLOR = { present: '#16A34A', late: '#D97706', absent: '#DC2626' };

function AttendanceTrendChart({ records }) {
  const data = [...records]
    .slice(0, 10)
    .reverse()
    .map((r) => ({
      date: r.date?.slice(5), // MM-DD
      value: 1,
      status: r.status,
    }));

  if (data.length === 0) {
    return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D' }}>No attendance data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F0" />
        <XAxis dataKey="date" tick={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fill: '#76777D' }} axisLine={false} tickLine={false} />
        <YAxis hide domain={[0, 1]} />
        <Tooltip
          formatter={(_, __, props) => [props.payload.status, 'Status']}
          contentStyle={{ fontFamily: 'Inter, sans-serif', fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={28} animationDuration={800}>
          {data.map((d, i) => <Cell key={i} fill={ATTENDANCE_COLOR[d.status] || '#94A3B8'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function AssignmentScoresChart({ assignments }) {
  const data = assignments
    .filter((a) => a.my_submission?.score != null)
    .sort((a, b) => new Date(a.my_submission.submitted_at) - new Date(b.my_submission.submitted_at))
    .slice(-6)
    .map((a) => ({ title: a.title.length > 14 ? a.title.slice(0, 14) + '…' : a.title, score: a.my_submission.score }));

  if (data.length === 0) {
    return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D' }}>No graded assignments yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F0" />
        <XAxis dataKey="title" tick={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fill: '#76777D' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fill: '#76777D' }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value) => [`${value} / 100`, 'Score']}
          contentStyle={{ fontFamily: 'Inter, sans-serif', fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
        />
        <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={36} animationDuration={800}>
          {data.map((d, i) => <Cell key={i} fill={d.score >= 75 ? '#16A34A' : d.score >= 50 ? '#D97706' : '#DC2626'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    Promise.all([getDashboard(), getAttendance(), getAssignments()])
      .then(([dash, att, asg]) => {
        setData(dash.data);
        setAttendance(att.data);
        setAssignments(asg.data);
      })
      .catch(() => {});
  }, []);

  if (!data) return <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>Loading your dashboard…</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px' }}>
      <style>{fadeKeyframes}</style>

      <FadeIn delay={0}>
        <div style={{ background: '#ECFDF5', borderRadius: '12px', padding: '18px 24px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#0F7A37', margin: 0 }}>
            {data.batch
              ? `Welcome back! You're enrolled in ${data.batch}, trained by ${data.trainer}.`
              : "Welcome back! You haven't been assigned to a batch yet."}
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={80}>
        <SectionHeader icon={BarChart3} title="Overview" subtitle="Your key numbers at a glance" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', display: 'flex', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <AttendanceRing percent={data.attendance_percent} />
          </div>
          <StatCard icon={ClipboardList} iconBg="#ECFDF5" iconColor="#16A34A" label="Pending Assignments" value={data.pending_assignments_count} />
          <StatCard icon={AlertTriangle} iconBg="#FEF2F2" iconColor="#DC2626" label="Overdue" value={data.overdue_assignments_count} />
          <StatCard icon={Bell} iconBg="#FFFBEB" iconColor="#D97706" label="Unread" value={data.unread_notifications + data.unread_messages} />
        </div>
      </FadeIn>

      <FadeIn delay={160}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <SectionHeader icon={TrendingUp} title="Attendance Trend" subtitle="Last 10 recorded days" />
            <AttendanceTrendChart records={attendance} />
          </div>
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <SectionHeader icon={BarChart3} title="Recent Assignment Scores" subtitle="Your last 6 graded submissions" />
            <AssignmentScoresChart assignments={assignments} />
          </div>
        </div>
      </FadeIn>

      {data.latest_report && (
        <FadeIn delay={240}>
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#76777D', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>Latest Feedback</p>
            {data.latest_report.executive_summary && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', lineHeight: 1.6, margin: '0 0 8px' }}>{data.latest_report.executive_summary}</p>
            )}
            {data.latest_report.my_note && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#0F7A37', lineHeight: 1.6, margin: 0 }}>{data.latest_report.my_note}</p>
            )}
          </div>
        </FadeIn>
      )}
    </div>
  );
}
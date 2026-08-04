import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../../../core/layout/DashboardShell';
import { useAuth } from '../../../core/auth/AuthContext';
import { getBatches, getLessonPlans, getAssignments, getReports, getMockEligibility } from '../api';
import { Users, BookOpen, FileText, FileBarChart, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function TrainerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ batches: 0, lessonPlans: 0, assignments: 0, reports: 0 });
  const [studentChartData, setStudentChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const batchesRes = await getBatches();
      const batches = batchesRes.data;

      let lessonPlanCount = 0;
      let assignmentCount = 0;
      let reportCount = 0;
      let allStudentData = [];

      for (const batch of batches) {
        const [lpRes, aRes, rRes, eligRes] = await Promise.all([
          getLessonPlans(batch.id),
          getAssignments(batch.id),
          getReports(batch.id),
          getMockEligibility(batch.id).catch(() => ({ data: [] })),
        ]);
        lessonPlanCount += lpRes.data.length;
        assignmentCount += aRes.data.length;
        reportCount += rRes.data.length;

        eligRes.data.forEach((s) => {
          allStudentData.push({
            name: s.username,
            Attendance: s.attendance_percentage,
            Score: s.assignments_submitted > 0 ? Math.round((s.assignments_submitted / s.total_assignments) * 100) : 0,
          });
        });
      }

      setStats({
        batches: batches.length,
        lessonPlans: lessonPlanCount,
        assignments: assignmentCount,
        reports: reportCount,
      });
      setStudentChartData(allStudentData);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: 'Batches', value: stats.batches, icon: Users, color: '#0051D5', path: '/trainer/batches' },
    { label: 'Lesson Plans', value: stats.lessonPlans, icon: BookOpen, color: '#059669', path: '/trainer/lesson-plans' },
    { label: 'Assignments', value: stats.assignments, icon: FileText, color: '#D97706', path: '/trainer/assignments' },
    { label: 'Reports', value: stats.reports, icon: FileBarChart, color: '#7C3AED', path: '/trainer/reports' },
  ];

  const quickLinks = [
    { label: 'Mark Attendance', path: '/trainer/attendance' },
    { label: 'Generate Mock Questions', path: '/trainer/mock-interviews' },
    { label: 'View Student Progress', path: '/trainer/student-progress' },
    { label: 'View Batch Performance', path: '/trainer/batch-performance' },
  ];

  return (
    <DashboardShell title="Trainer Dashboard">
      <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '10px', padding: '14px 20px', marginBottom: '28px', display: 'inline-block' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#1E1B4B', margin: 0 }}>
          Welcome back, <strong>{user?.username}</strong>! Here's a quick overview of your training activity.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {cards.map(({ label, value, icon: Icon, color, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            style={{
              background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px',
              textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px',
            }}
          >
            <div style={{ background: `${color}15`, borderRadius: '8px', padding: '8px', width: 'fit-content' }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '26px', color: '#1E1B4B', margin: 0 }}>
                {loading ? '—' : value}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: 0 }}>
                {label}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Bar chart: student attendance & assignment completion */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '28px' }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 20px' }}>
          Student Attendance & Assignment Completion
        </h3>
        {loading ? (
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>Loading chart data...</p>
        ) : studentChartData.length === 0 ? (
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>No student data available yet. Mark attendance and create assignments to see this chart.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={studentChartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fill: '#76777D' }} />
              <YAxis domain={[0, 100]} tick={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fill: '#76777D' }} />
              <Tooltip contentStyle={{ fontFamily: 'Inter, sans-serif', fontSize: 13, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }} />
              <Bar dataKey="Attendance" fill="#059669" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Score" fill="#0051D5" radius={[6, 6, 0, 0]} name="Assignments Completed %" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Quick links */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 16px' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {quickLinks.map(({ label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '12px 14px', borderRadius: '8px', textAlign: 'left',
                fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {label}
              <ArrowRight size={16} color="#0051D5" />
            </button>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
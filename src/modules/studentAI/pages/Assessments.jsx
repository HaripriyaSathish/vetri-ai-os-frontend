import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Award, Clock, BookOpen } from 'lucide-react';
import { getEligibility } from '../api';

const CATEGORY_LABEL = { task: 'Daily Task', mini_project: 'Mini Project', main_project: 'Main Project' };

function Pill({ label, tone }) {
  const styles = {
    green: { background: '#ECFDF5', color: '#0F7A37' },
    red: { background: '#FEF2F2', color: '#DC2626' },
    amber: { background: '#FFFBEB', color: '#D97706' },
    gray: { background: '#F1F5F9', color: '#45464D' },
  }[tone];
  return (
    <span style={{ ...styles, padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
      {label}
    </span>
  );
}

function CategoryTable({ block }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, color: '#1E1B4B', margin: 0 }}>
          {CATEGORY_LABEL[block.category] || block.label}
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: 0 }}>
          {block.submitted} / {block.total} submitted
        </p>
      </div>
      {block.rows.length === 0 ? (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: 0 }}>None assigned yet.</p>
      ) : (
        <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
                <th style={{ padding: '10px 16px', color: '#76777D', fontWeight: 600 }}>Title</th>
                <th style={{ padding: '10px 16px', color: '#76777D', fontWeight: 600 }}>Due Date</th>
                <th style={{ padding: '10px 16px', color: '#76777D', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '10px 16px', color: '#76777D', fontWeight: 600 }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '10px 16px', color: '#1E1B4B' }}>{r.title}</td>
                  <td style={{ padding: '10px 16px', color: '#76777D' }}>{r.due_date}</td>
                  <td style={{ padding: '10px 16px' }}>
                    {!r.submitted ? (
                      <Pill label="Not submitted" tone="red" />
                    ) : r.on_time ? (
                      <Pill label="On time" tone="green" />
                    ) : (
                      <Pill label="Late" tone="amber" />
                    )}
                  </td>
                  <td style={{ padding: '10px 16px', color: '#1E1B4B' }}>{r.score != null ? `${r.score} / 100` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Assessments() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getEligibility()
      .then((r) => setData(r.data))
      .catch(() => setError('Not enrolled in a batch yet.'));
  }, []);

  if (error) return <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>{error}</p>;
  if (!data) return <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>Loading…</p>;

  const mock = data.mock_interview;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Course status + eligibility */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={18} color="#16A34A" />
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 600, color: '#1E1B4B', margin: 0 }}>{data.batch_label}</p>
          </div>
          <Pill label={data.batch_status === 'completed' ? 'Course Completed' : 'Ongoing'} tone={data.batch_status === 'completed' ? 'gray' : 'green'} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '16px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', textTransform: 'uppercase', margin: 0 }}>Attendance</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '24px', fontWeight: 700, color: data.attendance_percentage >= 85 ? '#16A34A' : '#DC2626', margin: '4px 0 0' }}>
              {data.attendance_percentage}%
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', margin: '2px 0 0' }}>{data.present_days} / {data.total_days} days present</p>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '16px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', textTransform: 'uppercase', margin: 0 }}>Assignments</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '24px', fontWeight: 700, color: '#1E1B4B', margin: '4px 0 0' }}>
              {data.assignments_submitted} / {data.total_assignments}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: data.all_on_time ? '#16A34A' : '#DC2626', margin: '2px 0 0' }}>
              {data.all_on_time ? 'All submitted on time' : 'Some missing or late'}
            </p>
          </div>
          <div style={{ background: data.eligible ? '#ECFDF5' : '#FEF2F2', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {data.eligible ? <CheckCircle2 size={18} color="#16A34A" /> : <XCircle size={18} color="#DC2626" />}
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 700, color: data.eligible ? '#0F7A37' : '#DC2626', margin: 0 }}>
                {data.eligible ? 'Mock Interview Eligible' : 'Not Yet Eligible'}
              </p>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', margin: '4px 0 0' }}>Needs 85%+ attendance & all on-time</p>
          </div>
        </div>
      </div>

      {/* Assignment breakdown by category */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 600, color: '#1E1B4B', margin: '0 0 16px' }}>Assignment Breakdown</p>
        {data.category_breakdown.map((block) => <CategoryTable key={block.category} block={block} />)}
      </div>

      {/* Mock interview */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Award size={18} color="#16A34A" />
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 600, color: '#1E1B4B', margin: 0 }}>Mock Interview</p>
        </div>

        {!mock?.invited ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', margin: 0 }}>
            You haven't been invited to a mock interview yet. Reach the eligibility criteria above and your trainer will send an invite.
          </p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Clock size={14} color="#76777D" />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#1E1B4B', margin: 0 }}>
                  {mock.scheduled_datetime ? new Date(mock.scheduled_datetime).toLocaleString() : 'Not scheduled yet'}
                </p>
              </div>
              <Pill
                label={mock.attended == null ? 'Awaiting session' : mock.attended ? 'Attended' : 'Missed'}
                tone={mock.attended == null ? 'amber' : mock.attended ? 'green' : 'red'}
              />
              {mock.feedback && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', margin: '12px 0 0', maxWidth: '500px' }}>{mock.feedback}</p>
              )}
            </div>
            {mock.score != null && (
              <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '32px', fontWeight: 700, color: '#16A34A' }}>{mock.score}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
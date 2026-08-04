import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardShell from '../../../core/layout/DashboardShell';
import { getTrainerDetail } from '../api';
import { ArrowLeft, BookOpen, Users, CheckCircle2, Clock, Calendar } from 'lucide-react';

function displayName(t) {
  const full = [t.first_name, t.last_name].filter(Boolean).join(' ').trim();
  return full || t.username;
}

export default function TrainerDetail() {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const loadDetail = () => {
    getTrainerDetail(trainerId)
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load trainer details.'));
  };

  useEffect(() => {
    loadDetail();
  }, [trainerId]);

  if (error) {
    return (
      <DashboardShell title="Trainer Details">
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#DC2626' }}>{error}</p>
      </DashboardShell>
    );
  }

  if (!data) {
    return (
      <DashboardShell title="Trainer Details">
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>Loading...</p>
      </DashboardShell>
    );
  }

  const { trainer, batches, total_batches, ongoing_count, completed_count } = data;

  return (
    <DashboardShell title={displayName(trainer)}>
      <button
        onClick={() => navigate('/trainer/all-trainers')}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent',
          border: 'none', cursor: 'pointer', color: '#76777D', fontFamily: 'Inter, sans-serif',
          fontSize: '13px', marginBottom: '20px', padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Back to All Trainers
      </button>

      {/* Trainer overview */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          {trainer.profile_photo ? (
            <img src={trainer.profile_photo} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#0051D5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '24px' }}>{trainer.username[0]?.toUpperCase()}</span>
            </div>
          )}
          <div>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#1E1B4B', margin: '0 0 4px' }}>
              {displayName(trainer)}
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: 0 }}>
              {trainer.username} · {trainer.email} {trainer.phone && `· ${trainer.phone}`}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 4px' }}>Total Batches</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 700, color: '#0051D5', margin: 0 }}>{total_batches}</p>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 4px' }}>Ongoing</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 700, color: '#D97706', margin: 0 }}>{ongoing_count}</p>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 4px' }}>Completed</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 700, color: '#059669', margin: 0 }}>{completed_count}</p>
          </div>
        </div>
      </div>

      {/* Batch list */}
      <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 12px' }}>
        Batches Handled
      </h3>

      {batches.length === 0 ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>This trainer has no batches yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {batches.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/trainer/batches/${b.id}`)}
              style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 2px' }}>{b.name}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: 0 }}>{b.course_name || '—'}</p>
                </div>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '6px',
                  fontSize: '11px', fontWeight: 600,
                  background: b.status === 'completed' ? '#DCFCE7' : '#FEF3C7',
                  color: b.status === 'completed' ? '#059669' : '#D97706',
                }}>
                  {b.status === 'completed' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                  {b.status === 'completed' ? 'Completed' : 'Ongoing'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Calendar size={13} color="#76777D" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D' }}>
                  {b.start_date} {b.end_date ? `→ ${b.end_date}` : '(ongoing)'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Users size={13} color="#76777D" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D' }}>
                  {b.students_enrolled} / {b.max_students} students
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={13} color="#76777D" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D' }}>
                  {b.topics_covered} topic(s) covered · {b.training_mode}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
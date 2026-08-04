import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../../../core/layout/DashboardShell';
import { getBatches, deleteBatch } from '../api';
import axiosInstance from '../../../core/api/axiosInstance';
import { useAuth } from '../../../core/auth/AuthContext';
import { Users, Calendar, BookOpen, CheckCircle2, Clock, Trash2 } from 'lucide-react';
function trainerDisplayName(b) {
  const full = [b.trainer_first_name, b.trainer_last_name].filter(Boolean).join(' ').trim();
  return full || b.trainer_username;
}
export default function Batches() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOrgViewer = user?.role === 'admin' || user?.role === 'management';
  const canRemoveBatch = user?.role === 'management';

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const res = await getBatches();
      setBatches(res.data);
    } catch (err) {
      setError('Failed to load batches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const toggleStatus = async (batch) => {
    const newStatus = batch.status === 'completed' ? 'ongoing' : 'completed';
    try {
      await axiosInstance.patch(`/trainer/batches/${batch.id}/`, { status: newStatus });
      loadBatches();
    } catch (err) {
      setError('Failed to update batch status.');
    }
  };

  const handleRemoveBatch = async (batch, e) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Permanently remove "${batch.name}"?\n\nThis deletes ALL of its attendance records, lesson plans, assignments, submissions, reports, and messages. This cannot be undone.`
    );
    if (!confirmed) return;

    setRemovingId(batch.id);
    setError('');
    try {
      await deleteBatch(batch.id);
      loadBatches();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove batch.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <DashboardShell title="Batches">
      {error && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

      {loading ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>Loading batches...</p>
      ) : batches.length === 0 ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>No batches yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {batches.map((batch) => (
            <div
              key={batch.id}
              onClick={() => navigate(`/trainer/batches/${batch.id}`)}
              style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#EFF4FF', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                    <Users size={18} color="#0051D5" />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: 0 }}>
                      {batch.name}
                    </h3>
                    {isOrgViewer && (
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', margin: '2px 0 0' }}>
                        Trainer: {trainerDisplayName(batch)}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleStatus(batch); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px',
                      background: batch.status === 'completed' ? '#DCFCE7' : '#FEF3C7',
                      color: batch.status === 'completed' ? '#059669' : '#D97706',
                    }}
                  >
                    {batch.status === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {batch.status === 'completed' ? 'Completed' : 'Ongoing'}
                  </button>
                  {canRemoveBatch && (
                    <button
                      onClick={(e) => handleRemoveBatch(batch, e)}
                      disabled={removingId === batch.id}
                      title="Remove batch"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '26px', height: '26px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                        background: '#FEE2E2', color: '#DC2626',
                        opacity: removingId === batch.id ? 0.6 : 1,
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Calendar size={14} color="#76777D" />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: 0 }}>
                  {batch.start_date} {batch.end_date ? `→ ${batch.end_date}` : '(ongoing)'}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <Users size={14} color="#76777D" />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: 0 }}>
                  {batch.students_enrolled} student(s) enrolled
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <BookOpen size={14} color="#76777D" />
                  <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: '#45464D', margin: 0 }}>
                    Topics Covered ({batch.topics_covered.length})
                  </p>
                </div>
                {batch.topics_covered.length === 0 ? (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: 0 }}>
                    No lesson plans yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {batch.topics_covered.map((topic, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px',
                          padding: '3px 8px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#45464D',
                        }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
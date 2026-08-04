import { useEffect, useState } from 'react';
import { getAssignments } from '../api';
import AssignmentCard from '../components/AssignmentCard';

const TABS = [
  { key: '', label: 'All' },
  { key: 'task', label: 'Daily Task' },
  { key: 'mini_project', label: 'Mini Project' },
  { key: 'main_project', label: 'Main Project' },
];

export default function Assignments() {
  const [tab, setTab] = useState('');
  const [assignments, setAssignments] = useState([]);

  const load = () => getAssignments(tab || undefined).then((r) => setAssignments(r.data)).catch(() => {});

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 16px', borderRadius: '999px', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600,
              background: tab === t.key ? '#16A34A' : '#F8FAFC',
              color: tab === t.key ? '#fff' : '#76777D',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {assignments.map((a) => <AssignmentCard key={a.id} assignment={a} onSubmitted={load} />)}
      {assignments.length === 0 && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D' }}>Nothing here yet.</p>}
    </div>
  );
}
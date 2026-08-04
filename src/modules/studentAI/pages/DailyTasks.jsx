import { useEffect, useState } from 'react';
import { getAssignments } from '../api';
import AssignmentCard from '../components/AssignmentCard';

export default function DailyTasks() {
  const [tasks, setTasks] = useState([]);
  const load = () => getAssignments('task').then((r) => setTasks(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);
  const done = tasks.filter((t) => t.my_submission).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px' }}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', textAlign: 'right', margin: 0 }}>{done} / {tasks.length} completed</p>
      {tasks.map((t) => <AssignmentCard key={t.id} assignment={t} onSubmitted={load} />)}
      {tasks.length === 0 && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D' }}>No daily tasks posted yet.</p>}
    </div>
  );
}
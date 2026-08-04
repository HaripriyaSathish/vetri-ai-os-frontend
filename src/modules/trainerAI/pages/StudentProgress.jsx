import { useState, useEffect } from 'react';
import DashboardShell from '../../../core/layout/DashboardShell';
import { getBatches, getStudents, generateStudentProgress } from '../api';
import { Sparkles, TrendingUp, Loader2, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function displayName(s) {
  const full = [s.first_name, s.last_name].filter(Boolean).join(' ').trim();
  return full || s.username;
}
export default function StudentProgress() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getBatches().then((res) => {
      setBatches(res.data);
      if (res.data.length > 0) setSelectedBatch(res.data[0].id);
    });
    getStudents().then((res) => {
      setStudents(res.data);
      if (res.data.length > 0) setSelectedStudent(res.data[0].id);
    });
  }, []);

  const handleGenerate = async () => {
    setError('');
    setResult(null);
    if (!selectedBatch || !selectedStudent) {
      setError('Please select a batch and a student.');
      return;
    }
    setGenerating(true);
    try {
      const res = await generateStudentProgress({ batch_id: selectedBatch, student_id: selectedStudent });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate progress report.');
    } finally {
      setGenerating(false);
    }
  };

  const cleanText = (text) => {
    if (!text) return '';
    return text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '').trim();
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD',
    borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#45464D', display: 'block', marginBottom: '6px',
  };

  const attendancePct = result?.attendance_percentage ?? 0;
  const avgScore = result?.average_score ?? 0;

  const attendanceData = [
    { name: 'Present', value: attendancePct },
    { name: 'Absent', value: 100 - attendancePct },
  ];
  const ATTENDANCE_COLORS = ['#059669', '#E2E8F0'];
  const scoreData = [{ name: 'Score', value: avgScore }];

  return (
    <DashboardShell title="Student Progress">
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 16px' }}>
          Generate Student Progress Report
        </h3>

        {error && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Batch</label>
            <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} style={inputStyle}>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Student</label>
            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} style={inputStyle}>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{displayName(s)}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#0051D5', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '10px 18px', cursor: generating ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap',
              opacity: generating ? 0.7 : 1,
            }}
          >
            {generating ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {result && (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: '#EFF4FF', borderRadius: '8px', padding: '8px', display: 'flex' }}>
              <TrendingUp size={18} color="#0051D5" />
            </div>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#1E1B4B', margin: 0 }}>
              Progress Summary
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '16px 20px', flex: '1 1 260px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 8px' }}>Attendance</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={attendanceData} dataKey="value" innerRadius={45} outerRadius={65} startAngle={90} endAngle={-270}>
                    {attendanceData.map((entry, index) => (
                      <Cell key={index} fill={ATTENDANCE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 700, color: '#059669', margin: 0 }}>
                {result.attendance_percentage !== null ? `${result.attendance_percentage}%` : 'N/A'}
              </p>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '16px 20px', flex: '1 1 260px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 8px' }}>Average Score</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={scoreData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0051D5" radius={[8, 8, 8, 8]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 700, color: '#0051D5', margin: 0 }}>
                {result.average_score !== null ? `${result.average_score}/100` : 'N/A'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', lineHeight: 1.6, margin: 0 }}>
              {cleanText(result.generated_summary)}
            </p>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
import { useState, useEffect } from 'react';
import DashboardShell from '../../../core/layout/DashboardShell';
import { getBatches, generateBatchPerformance } from '../api';
import { Sparkles, BarChart3, Loader2, Users, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
function trainerDisplayName(b) {
  const full = [b.trainer_first_name, b.trainer_last_name].filter(Boolean).join(' ').trim();
  return full || b.trainer_username;
}
export default function BatchPerformance() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getBatches().then((res) => {
      setBatches(res.data);
      if (res.data.length > 0) setSelectedBatch(res.data[0].id);
    });
  }, []);

  const handleGenerate = async () => {
    setError('');
    setResult(null);
    if (!selectedBatch) {
      setError('Please select a batch.');
      return;
    }
    setGenerating(true);
    try {
      const res = await generateBatchPerformance({ batch_id: selectedBatch });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate batch performance report.');
    } finally {
      setGenerating(false);
    }
  };

  const cleanText = (text) => (text ? text.replace(/\*\*/g, '').replace(/\*/g, '') : '');

  const statusColor = {
    Excelling: { bg: '#DCFCE7', text: '#059669' },
    'On Track': { bg: '#FEF3C7', text: '#D97706' },
    'Needs Attention': { bg: '#FEE2E2', text: '#DC2626' },
  };

  const handleDownload = () => {
    if (!result) return;
    const rows = result.students.map((s) => ({
      Student: s.student,
      'Attendance %': s.attendance_percentage ?? 'N/A',
      'Average Score': s.average_score ?? 'N/A',
      'Assignments Submitted': s.assignments_submitted,
      Status: s.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Batch Performance');
    XLSX.writeFile(workbook, `${result.batch_name.replace(/\s+/g, '_')}_Performance.xlsx`);
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD',
    borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#45464D', display: 'block', marginBottom: '6px',
  };

  return (
    <DashboardShell title="Batch Performance">
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 16px' }}>
          Generate Batch Performance Report
        </h3>

        {error && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'end', maxWidth: '500px' }}>
          <div>
            <label style={labelStyle}>Batch</label>
            <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} style={inputStyle}>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
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
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#EFF4FF', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                <BarChart3 size={18} color="#0051D5" />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#1E1B4B', margin: 0 }}>
                  {result.batch_name}
                </h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={12} /> {result.student_count} student(s) evaluated
                </p>
              </div>
            </div>
            <button
              onClick={handleDownload}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#059669', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '9px 16px', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
              }}
            >
              <Download size={16} /> Download Excel
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FDE047' }}>
                  {['Student', 'Attendance %', 'Average Score', 'Assignments Submitted', 'Status'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 16px', textAlign: 'left', fontFamily: 'Inter, sans-serif',
                        fontWeight: 700, fontSize: '13px', color: '#1E1B4B', border: '1px solid #E2E8F0',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.students.map((s, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#F8FAFC' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', border: '1px solid #E2E8F0' }}>
                      {s.student}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', border: '1px solid #E2E8F0' }}>
                      {s.attendance_percentage !== null ? `${s.attendance_percentage}%` : 'N/A'}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', border: '1px solid #E2E8F0' }}>
                      {s.average_score !== null ? `${s.average_score}/100` : 'N/A'}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', border: '1px solid #E2E8F0' }}>
                      {s.assignments_submitted}
                    </td>
                    <td style={{ padding: '12px 16px', border: '1px solid #E2E8F0' }}>
                      <span
                        style={{
                          display: 'inline-block', padding: '4px 10px', borderRadius: '6px',
                          fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px',
                          background: statusColor[s.status]?.bg, color: statusColor[s.status]?.text,
                        }}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '20px 24px', borderTop: '1px solid #E2E8F0' }}>
            <h4 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#76777D', textTransform: 'uppercase', margin: '0 0 10px' }}>
              AI Summary
            </h4>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>
              {cleanText(result.generated_report)}
            </p>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
import { useState } from 'react';
import { downloadZoneReport } from '../api';
import { FileBarChart, Download } from 'lucide-react';

export default function Reports() {
  const [downloading, setDownloading] = useState(null); // 'weekly' | 'monthly' | null
  const [error, setError] = useState('');

  const handleDownload = async (period) => {
    setDownloading(period);
    setError('');
    try {
      const res = await downloadZoneReport(period);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${period}_zone_report.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to download report.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <FileBarChart size={20} color="#16A34A" />
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#1E1B4B', margin: 0 }}>
            Batch Performance Reports
          </h3>
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: '0 0 20px', lineHeight: 1.6 }}>
          Download your batch's zone report — attendance, task completion, and zone status for the whole batch.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleDownload('weekly')}
            disabled={downloading !== null}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#16A34A', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '10px 18px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
              opacity: downloading === 'weekly' ? 0.7 : 1,
            }}
          >
            <Download size={15} /> {downloading === 'weekly' ? 'Downloading...' : 'Weekly Report'}
          </button>
          <button
            onClick={() => handleDownload('monthly')}
            disabled={downloading !== null}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '10px 18px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
              opacity: downloading === 'monthly' ? 0.7 : 1,
            }}
          >
            <Download size={15} /> {downloading === 'monthly' ? 'Downloading...' : 'Monthly Report'}
          </button>
        </div>
        {error && <p style={{ color: '#DC2626', fontSize: '13px', margin: '14px 0 0' }}>{error}</p>}
      </div>
    </div>
  );
}
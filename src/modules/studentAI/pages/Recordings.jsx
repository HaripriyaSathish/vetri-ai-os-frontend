import { useEffect, useState } from 'react';
import { getRecordings } from '../api';
import { Video, CheckCircle2, ExternalLink } from 'lucide-react';

export default function Recordings() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecordings().then((res) => setRecordings(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D' }}>Loading...</p>;

  if (recordings.length === 0) {
    return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D' }}>No recordings shared with you yet.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '800px' }}>
      {recordings.map((r) => (
        <div key={r.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Video size={20} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: 0 }}>{r.title}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '4px 0 0' }}>{r.date}</p>
              {r.notes && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', margin: '6px 0 0' }}>{r.notes}</p>}
              {r.watched && (
                <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#059669', fontWeight: 600, margin: '6px 0 0' }}>
                  <CheckCircle2 size={13} /> Watched {new Date(r.watched_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <a
            href={r.tracked_link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#16A34A', color: '#fff', textDecoration: 'none', borderRadius: '8px', padding: '10px 18px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', flexShrink: 0 }}
          >
            <ExternalLink size={15} /> Watch Recording
          </a>
        </div>
      ))}
    </div>
  );
}
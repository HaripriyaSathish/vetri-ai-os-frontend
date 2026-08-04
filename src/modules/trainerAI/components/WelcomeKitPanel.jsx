import { useState, useEffect } from 'react';
import { Package, CheckCircle2, Truck } from 'lucide-react';
import { getWelcomeKit, updateWelcomeKit } from '../api';

export default function WelcomeKitPanel({ enquiry }) {
  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courier, setCourier] = useState('');
  const [tracking, setTracking] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getWelcomeKit(enquiry.id)
      .then((res) => {
        setKit(res.data);
        setCourier(res.data.courier_name || '');
        setTracking(res.data.tracking_id || '');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [enquiry.id]);

  const handleMarkSent = async () => {
    setSaving(true);
    try {
      await updateWelcomeKit(kit.id, { sent: true, courier_name: courier, tracking_id: tracking });
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleMarkReceived = async () => {
    setSaving(true);
    try {
      await updateWelcomeKit(kit.id, { received: true });
      load();
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    padding: '9px 12px', border: '1px solid #C6C6CD', borderRadius: '8px',
    fontFamily: 'Inter, sans-serif', fontSize: '13px', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#45464D', display: 'block', marginBottom: '4px',
  };

  if (loading || !kit) {
    return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', padding: '12px' }}>Loading welcome kit info...</p>;
  }

  return (
    <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '16px 20px' }}>
      <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#1E1B4B', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Package size={14} /> Welcome Kit
      </p>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 12px' }}>
        <strong>Ship to:</strong> {kit.address || 'No address on file — ask student to update it.'}
      </p>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Sent status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={16} color={kit.sent ? '#059669' : '#C6C6CD'} />
          {kit.sent ? (
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#059669', fontWeight: 600 }}>
              Sent {kit.sent_date} {kit.courier_name && `via ${kit.courier_name}`} {kit.tracking_id && `(#${kit.tracking_id})`}
            </span>
          ) : (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="Courier name" style={{ ...inputStyle, width: '130px' }} />
              <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Tracking ID (optional)" style={{ ...inputStyle, width: '150px' }} />
              <button
                onClick={handleMarkSent}
                disabled={saving}
                style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px' }}
              >
                Mark Sent
              </button>
            </div>
          )}
        </div>

        {/* Received status */}
        {kit.sent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color={kit.received ? '#059669' : '#C6C6CD'} />
            {kit.received ? (
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#059669', fontWeight: 600 }}>
                Confirmed received {kit.received_date}
              </span>
            ) : (
              <button
                onClick={handleMarkReceived}
                disabled={saving}
                style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px' }}
              >
                Confirm Received
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
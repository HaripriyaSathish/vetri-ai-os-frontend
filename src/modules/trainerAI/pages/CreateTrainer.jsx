import { useState } from 'react';
import DashboardShell from '../../../core/layout/DashboardShell';
import { createTrainerAccount } from '../api';
import { UserPlus, Copy, Check, CheckCircle2 } from 'lucide-react';

export default function CreateTrainer() {
  const [form, setForm] = useState({ username: '', password: '', email: '', first_name: '', last_name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState('');

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #C6C6CD', borderRadius: '8px',
    fontFamily: 'Inter, sans-serif', fontSize: '14px', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#1E1B4B', display: 'block', marginBottom: '6px',
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pwd = '';
    for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setForm((f) => ({ ...f, password: pwd }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.password || !form.email) {
      setError('Username, password, and email are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await createTrainerAccount(form);
      setResult({ ...res.data, password: form.password });
      setForm({ username: '', password: '', email: '', first_name: '', last_name: '', phone: '' });
    } catch (err) {
      setError(err.response?.data?.detail || Object.values(err.response?.data || {})[0]?.[0] || 'Failed to create trainer account.');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <DashboardShell title="Create Trainer Account">
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        {result && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, color: '#059669', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} /> Trainer Account Created!
            </p>
            {[
              { label: 'Username', value: result.username },
              { label: 'Password', value: result.password },
              { label: 'Email', value: result.email },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: '6px', padding: '8px 12px', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D' }}>{label}: <strong style={{ color: '#1E1B4B' }}>{value}</strong></span>
                <button onClick={() => copyToClipboard(value, label)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0051D5' }}>
                  {copied === label ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={16} color="#0051D5" /> New Trainer
          </h3>

          {error && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>First Name</label>
              <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Username</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} style={inputStyle} placeholder="e.g. trainer3" />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} placeholder="trainer@example.com" />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="+91 9876543210" />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} placeholder="Type or generate" />
              <button
                type="button"
                onClick={generatePassword}
                style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#0051D5', whiteSpace: 'nowrap' }}
              >
                Generate
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%', background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Creating...' : 'Create Trainer Account'}
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}
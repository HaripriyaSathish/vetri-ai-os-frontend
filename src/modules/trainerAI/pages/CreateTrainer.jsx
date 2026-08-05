import { useState } from 'react';
import DashboardShell from '../../../core/layout/DashboardShell';
import { createTrainerAccount, notifyTrainer } from '../api';
import WhatsAppButton from '../../../core/components/WhatsAppButton';
import { UserPlus, Copy, Check, CheckCircle2, Mail, X } from 'lucide-react';

export default function CreateTrainer() {
  const [form, setForm] = useState({
    username: '', password: '', personal_email: '', official_email: '',
    first_name: '', last_name: '', phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState('');

  // Email-send modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');

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
    if (!form.username || !form.password || !form.personal_email) {
      setError('Username, password, and personal email are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await createTrainerAccount(form);
      setResult({ ...res.data, password: form.password, phone: form.phone });
      setForm({ username: '', password: '', personal_email: '', official_email: '', first_name: '', last_name: '', phone: '' });
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

  const notifyEmail = result?.official_email || result?.personal_email;

  const credentialsText = result
    ? `Hi, here are your Vetri AI-OS trainer login credentials:\n\nUsername: ${result.username}\nPassword: ${result.password}\nOfficial Email: ${result.official_email || '—'}\nPersonal Email: ${result.personal_email}\n\nPlease log in and change your password after first login.`
    : '';

  const openEmailModal = () => {
    setEmailSubject('Your Vetri AI-OS Trainer Account Credentials');
    setEmailBody(
      `<p>Hi ${result.username},</p>` +
      `<p>Your trainer account has been created. Here are your login credentials:</p>` +
      `<p><strong>Username:</strong> ${result.username}<br/>` +
      `<strong>Password:</strong> ${result.password}<br/>` +
      `<strong>Official Email:</strong> ${result.official_email || '—'}<br/>` +
      `<strong>Personal Email:</strong> ${result.personal_email}</p>` +
      `<p>Please log in and change your password after first login.</p>`
    );
    setEmailMsg('');
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    setEmailMsg('');
    try {
      await notifyTrainer({ to: notifyEmail, subject: emailSubject, body: emailBody });
      setEmailMsg('Sent!');
      setTimeout(() => setShowEmailModal(false), 1000);
    } catch (err) {
      setEmailMsg('Failed to send email.');
    } finally {
      setSendingEmail(false);
    }
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
              { label: 'Official Email', value: result.official_email || '—' },
              { label: 'Personal Email', value: result.personal_email },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: '6px', padding: '8px 12px', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D' }}>{label}: <strong style={{ color: '#1E1B4B' }}>{value}</strong></span>
                {value !== '—' && (
                  <button onClick={() => copyToClipboard(value, label)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0051D5' }}>
                    {copied === label ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              {result.phone && (
                <WhatsAppButton
                  phoneNumber={result.phone}
                  message={credentialsText}
                  label="Send via WhatsApp"
                />
              )}
              <button
                onClick={openEmailModal}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px',
                  padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
                }}
              >
                <Mail size={15} /> Send via Email
              </button>
            </div>
            {!result.phone && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', margin: '8px 0 0' }}>
                No phone number was entered for this trainer, so WhatsApp isn't available — email only.
              </p>
            )}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Personal Email</label>
              <input type="email" value={form.personal_email} onChange={(e) => setForm({ ...form, personal_email: e.target.value })} style={inputStyle} placeholder="trainer.personal@gmail.com" />
            </div>
            <div>
              <label style={labelStyle}>Official Email (optional)</label>
              <input type="email" value={form.official_email} onChange={(e) => setForm({ ...form, official_email: e.target.value })} style={inputStyle} placeholder="trainer@vetrifresh.com" />
            </div>
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

      {/* Send via Email — compose modal */}
      {showEmailModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,15,30,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '520px', maxWidth: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#1E1B4B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={17} color="#0051D5" /> Send Credentials via Email
              </h3>
              <button onClick={() => setShowEmailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#76777D" />
              </button>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>To</label>
              <input value={notifyEmail || ''} disabled style={{ ...inputStyle, background: '#F8FAFC', color: '#76777D' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Subject</label>
              <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Content (HTML)</label>
              <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={8} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }} />
            </div>

            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              style={{ width: '100%', background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', opacity: sendingEmail ? 0.7 : 1 }}
            >
              {sendingEmail ? 'Sending...' : 'Send Email'}
            </button>

            {emailMsg && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: emailMsg.includes('Failed') ? '#DC2626' : '#059669', marginTop: '12px' }}>{emailMsg}</p>}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
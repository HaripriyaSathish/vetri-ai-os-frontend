import { useState, useEffect } from 'react';
import { UserPlus, CheckCircle2, Copy, Check } from 'lucide-react';
import { suggestUsername, createAccount } from '../api';

export default function CreateAccountPanel({ enquiry, payment, onCreated }) {
  const [username, setUsername] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (enquiry.account_created) return;
    suggestUsername(enquiry.id)
      .then((res) => {
        setUsername(res.data.suggested_username);
        setOfficialEmail(res.data.suggested_official_email);
      })
      .finally(() => setLoadingSuggestion(false));
  }, [enquiry.id, enquiry.account_created]);

  const paymentVerified = payment && (payment.fully_paid || payment.first_installment_paid);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pwd = '';
    for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setPassword(pwd);
  };

  const handleCreate = async () => {
    setError('');
    if (!username || !password || !officialEmail) {
      setError('Username, password, and official email are all required.');
      return;
    }
    setCreating(true);
    try {
      const res = await createAccount({
        enquiry_id: enquiry.id,
        username,
        password,
        official_email: officialEmail,
      });
      setResult(res.data);
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.detail || Object.values(err.response?.data || {})[0]?.[0] || 'Failed to create account.');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
  };

  const inputStyle = {
    padding: '9px 12px', border: '1px solid #C6C6CD', borderRadius: '8px',
    fontFamily: 'Inter, sans-serif', fontSize: '13px', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#45464D', display: 'block', marginBottom: '4px',
  };

  if (enquiry.account_created) {
    return (
      <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '18px 20px' }}>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, color: '#059669', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> Account Created
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'Username', value: enquiry.account_created_username },
            { label: 'Password', value: enquiry.created_password },
            { label: 'Official Email', value: enquiry.account_created_email },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: '6px', padding: '8px 12px' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D' }}>{label}: <strong style={{ color: '#1E1B4B' }}>{value || '—'}</strong></span>
              {value && (
                <button onClick={() => copyToClipboard(value, label)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0051D5' }}>
                  {copied === label ? <Check size={14} /> : <Copy size={14} />}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!paymentVerified) {
    return (
      <div style={{ background: '#FEF3C7', borderRadius: '10px', padding: '14px 20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#92400E', margin: 0 }}>
          Payment must be fully paid, or at least the first installment paid, before creating an account.
        </p>
      </div>
    );
  }

  if (result) {
    return (
      <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '18px 20px' }}>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, color: '#059669', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> Account Created!
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'Username', value: result.username },
            { label: 'Password', value: password },
            { label: 'Official Email', value: result.official_email },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: '6px', padding: '8px 12px' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D' }}>{label}: <strong style={{ color: '#1E1B4B' }}>{value}</strong></span>
              <button onClick={() => copyToClipboard(value, label)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0051D5' }}>
                {copied === label ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', margin: '10px 0 0' }}>
          Copy these and send to the student via WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '16px 20px' }}>
      <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#1E1B4B', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <UserPlus size={14} /> Create Student Account
      </p>
      {error && <p style={{ color: '#DC2626', fontSize: '12px', marginBottom: '10px' }}>{error}</p>}
      {loadingSuggestion ? (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D' }}>Loading suggestion...</p>
      ) : (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <label style={labelStyle}>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} style={{ ...inputStyle, width: '160px' }} />
          </div>
          <div>
            <label style={labelStyle}>Official Email</label>
            <input value={officialEmail} onChange={(e) => setOfficialEmail(e.target.value)} style={{ ...inputStyle, width: '220px' }} />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, width: '140px' }} placeholder="Click Generate" />
              <button
                type="button"
                onClick={generatePassword}
                style={{ background: '#fff', border: '1px solid #C6C6CD', borderRadius: '8px', padding: '9px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#0051D5' }}
              >
                Generate
              </button>
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px' }}
          >
            {creating ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { getCoursesPublic, submitEnquiry } from '../../modules/trainerAI/api';
import { CheckCircle2 } from 'lucide-react';

export default function EnquiryForm() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    name: '', date_of_birth: '', whatsapp_number: '', personal_email: '',
    course: '', education_summary: '', source: 'instagram', address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCoursesPublic().then((res) => {
      setCourses(res.data);
      if (res.data.length > 0) setForm((f) => ({ ...f, course: res.data[0].id }));
    });
  }, []);

  const inputStyle = {
    width: '100%', padding: '11px 14px', border: '1px solid #C6C6CD', borderRadius: '8px',
    fontFamily: 'Inter, sans-serif', fontSize: '14px', boxSizing: 'border-box', marginBottom: '16px',
  };
  const labelStyle = {
    fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#1E1B4B', display: 'block', marginBottom: '6px',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.date_of_birth || !form.whatsapp_number || !form.course) {
      setError('Please fill in name, date of birth, WhatsApp number, and course.');
      return;
    }
    setSubmitting(true);
    try {
      await submitEnquiry(form);
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#1E1B4B', margin: '0 0 8px' }}>
            Thanks for your interest!
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', margin: 0 }}>
            Our team will reach out to you on WhatsApp shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '20px' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '16px', padding: '32px', maxWidth: '480px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#1E1B4B', margin: '0 0 4px' }}>
          Course Enquiry
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: '0 0 24px' }}>
          Fill in your details and we'll get back to you.
        </p>

        {error && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

        <label style={labelStyle}>Full Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="Your full name" />

        <label style={labelStyle}>Date of Birth</label>
        <input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} style={inputStyle} />

        <label style={labelStyle}>WhatsApp Number</label>
        <input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} style={inputStyle} placeholder="+91 9876543210" />

        <label style={labelStyle}>Personal Email (optional)</label>
        <input type="email" value={form.personal_email} onChange={(e) => setForm({ ...form, personal_email: e.target.value })} style={inputStyle} placeholder="you@gmail.com" />

        <label style={labelStyle}>Course Interested In</label>
        <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} style={inputStyle}>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label style={labelStyle}>Education Details</label>
        <input value={form.education_summary} onChange={(e) => setForm({ ...form, education_summary: e.target.value })} style={inputStyle} placeholder="e.g. B.E. CSE, 2024 pass-out" />
        
        <label style={labelStyle}>Shipping Address (for welcome kit)</label>
        <textarea
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          rows={2}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="Full address including pincode"
        />
        
        <label style={labelStyle}>How did you hear about us?</label>
        <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} style={inputStyle}>
          <option value="instagram">Instagram</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="referral">Referral</option>
          <option value="walk_in">Walk-in</option>
          <option value="other">Other</option>
        </select>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%', background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px',
            padding: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '15px',
            marginTop: '8px', opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Enquiry'}
        </button>
      </form>
    </div>
  );
}
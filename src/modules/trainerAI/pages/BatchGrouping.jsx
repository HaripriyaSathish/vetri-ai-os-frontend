import { useState, useEffect } from 'react';
import DashboardShell from '../../../core/layout/DashboardShell';
import { getUngroupedStudents, getTrainers, groupIntoBatch, sendWelcomeEmail, notifyTrainer, getBatches, getBatchStudents } from '../api';
import { Users, CheckCircle2, X, Mail, AlertTriangle } from 'lucide-react';

function displayName(s) {
  const full = [s.first_name, s.last_name].filter(Boolean).join(' ').trim();
  return full || s.username;
}

function trainerDisplayName(b) {
  const full = [b.trainer_first_name, b.trainer_last_name].filter(Boolean).join(' ').trim();
  return full || b.trainer_username;
}

function buildTrainerDefaults(trainer, roster, form) {
  const rosterRows = roster.map((s) =>
    `<tr><td style="padding:6px 12px;border:1px solid #ddd;">${s.name}</td><td style="padding:6px 12px;border:1px solid #ddd;">${s.personal_email || '—'}</td><td style="padding:6px 12px;border:1px solid #ddd;">${s.official_email || '—'}</td></tr>`
  ).join('');
  return {
    to: trainer.email || '',
    cc: '',
    subject: `New Batch Assigned: ${form.batch_name}`,
    body:
      `<p>Hi ${trainer.name},</p>` +
      `<p>A new batch has been assigned to you.</p>` +
      `<p><strong>Batch:</strong> ${form.batch_name}<br/>` +
      `<strong>Course:</strong> ${form.course_name}<br/>` +
      `<strong>Start Date:</strong> ${form.start_date}</p>` +
      `<p><strong>Student Roster (${roster.length}):</strong></p>` +
      `<table style="border-collapse:collapse;">` +
      `<tr><th style="padding:6px 12px;border:1px solid #ddd;text-align:left;">Name</th>` +
      `<th style="padding:6px 12px;border:1px solid #ddd;text-align:left;">Personal Email</th>` +
      `<th style="padding:6px 12px;border:1px solid #ddd;text-align:left;">Official Email</th></tr>` +
      `${rosterRows}</table>`,
  };
}

function buildWelcomeDefaults() {
  return {
    cc: '',
    subject: `Welcome to Vetri AI-OS, {{full_name}}!`,
    body: `<p>Hi {{full_name}},</p><p>Welcome aboard! We're excited to have you start your journey with us at Vetri Technology Solutions.</p>`,
  };
}

function EmailModal({ trainer, roster, form, batchId, onClose }) {
  const [tab, setTab] = useState('trainer'); // 'trainer' | 'welcome'
  const [trainerForm, setTrainerForm] = useState(() => buildTrainerDefaults(trainer, roster, form));
  const [welcomeForm, setWelcomeForm] = useState(buildWelcomeDefaults);
  const [welcomeStudentIds, setWelcomeStudentIds] = useState(roster.map((s) => s.id));
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');
  const [trainerSent, setTrainerSent] = useState(false);
  const [welcomeSent, setWelcomeSent] = useState(false);

  const toggleWelcomeStudent = (id) => {
    setWelcomeStudentIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD', borderRadius: '8px',
    fontFamily: 'Inter, sans-serif', fontSize: '13px', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#1E1B4B', display: 'block', marginBottom: '6px',
  };

  const handleSendTrainer = async () => {
    setSending(true);
    setStatus('');
    try {
      await notifyTrainer({ ...trainerForm, batch_id: batchId });
      setStatus('Trainer notified successfully.');
      setTrainerSent(true);
    } catch (err) {
      setStatus(err.response?.data?.detail || 'Failed to notify trainer.');
    } finally {
      setSending(false);
    }
  };

  const handleSendWelcome = async () => {
    if (welcomeStudentIds.length === 0) {
      setStatus('Select at least one student to email.');
      return;
    }
    setSending(true);
    setStatus('');
    try {
      const res = await sendWelcomeEmail({
        student_ids: welcomeStudentIds,
        cc: welcomeForm.cc,
        subject: welcomeForm.subject,
        body: welcomeForm.body,
        batch_id: batchId,
      });
      setStatus(`Sent to ${res.data.sent_count} student(s).${res.data.skipped?.length ? ` ${res.data.skipped.length} skipped.` : ''}`);
      if (res.data.sent_count > 0) setWelcomeSent(true);
    } catch (err) {
      setStatus(err.response?.data?.detail || 'Failed to send welcome email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,15,30,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '14px', width: '640px', maxWidth: '100%',
        maxHeight: '88vh', overflowY: 'auto', padding: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '17px', color: '#1E1B4B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={18} color="#0051D5" /> {form?.batch_name || 'Batch'} — Send Notifications
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#76777D" />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid #E2E8F0' }}>
          <button
            onClick={() => setTab('trainer')}
            style={{
              padding: '8px 4px', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600,
              color: tab === 'trainer' ? '#0051D5' : '#76777D',
              borderBottom: tab === 'trainer' ? '2px solid #0051D5' : '2px solid transparent',
              marginRight: '16px', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            Notify Trainer {trainerSent && <CheckCircle2 size={13} color="#059669" />}
          </button>
          <button
            onClick={() => setTab('welcome')}
            style={{
              padding: '8px 4px', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600,
              color: tab === 'welcome' ? '#0051D5' : '#76777D',
              borderBottom: tab === 'welcome' ? '2px solid #0051D5' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            Welcome Students {welcomeSent && <CheckCircle2 size={13} color="#059669" />}
          </button>
        </div>

        {tab === 'trainer' ? (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>To</label>
              <input value={trainerForm.to} onChange={(e) => setTrainerForm({ ...trainerForm, to: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>CC (comma-separated, optional)</label>
              <input value={trainerForm.cc} onChange={(e) => setTrainerForm({ ...trainerForm, cc: e.target.value })} style={inputStyle} placeholder="e.g. founder@vetri.com, ops@vetri.com" />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Subject</label>
              <input value={trainerForm.subject} onChange={(e) => setTrainerForm({ ...trainerForm, subject: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Content (HTML)</label>
              <textarea value={trainerForm.body} onChange={(e) => setTrainerForm({ ...trainerForm, body: e.target.value })} rows={10} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }} />
            </div>
            <button
              onClick={handleSendTrainer}
              disabled={sending}
              style={{ width: '100%', background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', opacity: sending ? 0.7 : 1 }}
            >
              {sending ? 'Sending...' : 'Send to Trainer'}
            </button>
          </div>
        ) : (
          <div>
            <label style={labelStyle}>To (auto-filled from student records — uncheck to exclude)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px', maxHeight: '140px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px' }}>
              {roster.map((s) => (
                <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#1E1B4B' }}>
                  <input type="checkbox" checked={welcomeStudentIds.includes(s.id)} onChange={() => toggleWelcomeStudent(s.id)} />
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                  <span style={{ color: '#76777D' }}>{s.personal_email || '—'} · {s.official_email || '—'}</span>
                </label>
              ))}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>CC (comma-separated, optional)</label>
              <input value={welcomeForm.cc} onChange={(e) => setWelcomeForm({ ...welcomeForm, cc: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Subject (use {'{{full_name}}'} for personalization)</label>
              <input value={welcomeForm.subject} onChange={(e) => setWelcomeForm({ ...welcomeForm, subject: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Content (HTML, use {'{{full_name}}'} for personalization)</label>
              <textarea value={welcomeForm.body} onChange={(e) => setWelcomeForm({ ...welcomeForm, body: e.target.value })} rows={10} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }} />
            </div>
            <button
              onClick={handleSendWelcome}
              disabled={sending}
              style={{ width: '100%', background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', opacity: sending ? 0.7 : 1 }}
            >
              {sending ? 'Sending...' : `Send Welcome Email (${welcomeStudentIds.length})`}
            </button>
          </div>
        )}

        {status && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: status.includes('Failed') ? '#DC2626' : '#059669', marginTop: '14px' }}>{status}</p>}
      </div>
    </div>
  );
}

export default function BatchGrouping() {
  const [students, setStudents] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    batch_name: '', trainer_id: '', course_name: '', training_mode: 'Online',
    programming_language: '', start_date: '', end_date: '', class_start_time: '', class_end_time: '', max_students: 45,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailModal, setEmailModal] = useState(null); // { trainer, roster, form, batchId }

  // Pending notifications — batches (any, from any session) still missing trainer/welcome emails
  const [pendingBatches, setPendingBatches] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([getUngroupedStudents(), getTrainers()])
      .then(([sRes, tRes]) => {
        setStudents(sRes.data);
        setTrainers(tRes.data);
        if (tRes.data.length > 0) setForm((f) => ({ ...f, trainer_id: tRes.data[0].id }));
      })
      .finally(() => setLoading(false));
  };

  const loadPending = () => {
    setLoadingPending(true);
    getBatches()
      .then((res) => {
        setPendingBatches(res.data.filter((b) => !b.trainer_notified || !b.welcome_email_sent));
      })
      .finally(() => setLoadingPending(false));
  };

  useEffect(() => {
    load();
    loadPending();
  }, []);

  const toggleStudent = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const selectAllForCourse = (courseName) => {
    const ids = students.filter((s) => s.course_name === courseName).map((s) => s.id);
    setSelected((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (selected.length === 0) {
      setError('Select at least one student.');
      return;
    }
    if (!form.batch_name || !form.trainer_id || !form.course_name || !form.start_date) {
      setError('Batch name, trainer, course name, and start date are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await groupIntoBatch({
        enquiry_ids: selected,
        ...form,
        end_date: form.end_date || null,
        class_start_time: form.class_start_time || null,
        class_end_time: form.class_end_time || null,
      });
      setSuccess(res.data.detail);
      setEmailModal({ trainer: res.data.trainer, roster: res.data.roster, form, batchId: res.data.batch_id });
      setSelected([]);
      setForm({ batch_name: '', trainer_id: trainers[0]?.id || '', course_name: '', training_mode: 'Online', programming_language: '', start_date: '', end_date: '', class_start_time: '', class_end_time: '', max_students: 45 });
      load();
      loadPending();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create batch.');
    } finally {
      setSaving(false);
    }
  };

  const openPendingReminder = async (batch) => {
    try {
      const res = await getBatchStudents(batch.id);
      const roster = res.data.map((s) => ({
        id: s.id,
        name: displayName(s),
        personal_email: s.personal_email,
        official_email: s.official_email,
      }));
      setEmailModal({
        trainer: { name: trainerDisplayName(batch), email: batch.trainer_email },
        roster,
        form: { batch_name: batch.name, course_name: batch.course_name || batch.name, start_date: batch.start_date },
        batchId: batch.id,
      });
    } catch (err) {
      setError('Failed to load batch roster.');
    }
  };

  const handleModalClose = () => {
    setEmailModal(null);
    loadPending();
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD', borderRadius: '8px',
    fontFamily: 'Inter, sans-serif', fontSize: '14px', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#1E1B4B', display: 'block', marginBottom: '6px',
  };

  const courseGroups = students.reduce((acc, s) => {
    const key = s.course_name || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <DashboardShell title="Batch Grouping">
      {error && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}
      {success && <p style={{ color: '#059669', fontSize: '13px', marginBottom: '16px' }}>{success}</p>}

      {/* Pending Notifications */}
      {!loadingPending && pendingBatches.length > 0 && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '12px', padding: '18px 20px', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#92400E', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} /> Pending Notifications ({pendingBatches.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pendingBatches.map((b) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: '8px', padding: '10px 14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#1E1B4B', margin: 0 }}>{b.name}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', margin: '2px 0 0' }}>
                    {!b.trainer_notified && !b.welcome_email_sent
                      ? 'Trainer not notified & students not welcomed'
                      : !b.trainer_notified
                      ? 'Trainer not notified'
                      : 'Students not welcomed'}
                  </p>
                </div>
                <button
                  onClick={() => openPendingReminder(b)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: '#0051D5', color: '#fff', border: 'none', borderRadius: '6px',
                    padding: '7px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px',
                  }}
                >
                  <Mail size={13} /> Send Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} color="#0051D5" /> Paid Students Awaiting a Batch ({students.length})
          </h3>

          {loading ? (
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>Loading...</p>
          ) : students.length === 0 ? (
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>No students waiting to be grouped.</p>
          ) : (
            Object.entries(courseGroups).map(([courseName, group]) => (
              <div key={courseName} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#45464D', margin: 0 }}>{courseName} ({group.length})</p>
                  <button
                    onClick={() => selectAllForCourse(courseName)}
                    style={{ background: 'none', border: 'none', color: '#0051D5', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600 }}
                  >
                    Select all
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {group.map((s) => (
                    <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: selected.includes(s.id) ? '#EFF4FF' : '#F8FAFC', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggleStudent(s.id)} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#1E1B4B' }}>{s.name}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', marginLeft: 'auto' }}>{s.whatsapp_number}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}

          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#0051D5', fontWeight: 600, marginTop: '12px' }}>
            {selected.length} student(s) selected
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 16px' }}>
            Batch Details
          </h3>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Batch Name</label>
            <input value={form.batch_name} onChange={(e) => setForm({ ...form, batch_name: e.target.value })} placeholder="e.g. AI Fullstack - August 2026" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Course Name</label>
            <input value={form.course_name} onChange={(e) => setForm({ ...form, course_name: e.target.value })} placeholder="e.g. AI Fullstack" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Trainer</label>
            <select value={form.trainer_id} onChange={(e) => setForm({ ...form, trainer_id: e.target.value })} style={inputStyle}>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>{displayName(t)} ({t.username})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>End Date (optional)</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Daily Class Start Time</label>
              <input type="time" value={form.class_start_time} onChange={(e) => setForm({ ...form, class_start_time: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Daily Class End Time</label>
              <input type="time" value={form.class_end_time} onChange={(e) => setForm({ ...form, class_end_time: e.target.value })} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Max Students</label>
            <input type="number" value={form.max_students} onChange={(e) => setForm({ ...form, max_students: Number(e.target.value) })} style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Training Mode</label>
              <select value={form.training_mode} onChange={(e) => setForm({ ...form, training_mode: e.target.value })} style={inputStyle}>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Programming Language</label>
              <input value={form.programming_language} onChange={(e) => setForm({ ...form, programming_language: e.target.value })} placeholder="e.g. Java" style={inputStyle} />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <CheckCircle2 size={18} /> {saving ? 'Creating...' : `Create Batch (${selected.length} students)`}
          </button>
        </form>
      </div>

      {emailModal && (
        <EmailModal
          trainer={emailModal.trainer}
          roster={emailModal.roster}
          form={emailModal.form}
          batchId={emailModal.batchId}
          onClose={handleModalClose}
        />
      )}
    </DashboardShell>
  );
}
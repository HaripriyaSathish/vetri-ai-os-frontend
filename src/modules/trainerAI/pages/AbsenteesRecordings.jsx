import { useState, useEffect } from 'react';
import DashboardShell from '../../../core/layout/DashboardShell';
import {
  getBatches, getAbsentStudents, notifyAbsentStudents,
  getRecordings, createRecording, shareRecording, getRecordingStats,
  getBatchStudents,
} from '../api';
import { UserX, Video, Mail, X, Eye, Link2 } from 'lucide-react';

export default function AbsenteesRecordings() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');

  // Absentees
  const [absentDate, setAbsentDate] = useState('');
  const [absentees, setAbsentees] = useState([]);
  const [absentSelected, setAbsentSelected] = useState([]);
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [absentSubject, setAbsentSubject] = useState('');
  const [absentCc, setAbsentCc] = useState('');
  const [absentBody, setAbsentBody] = useState('');
  const [absentSending, setAbsentSending] = useState(false);
  const [absentStatus, setAbsentStatus] = useState('');

  // Recordings
  const [recordings, setRecordings] = useState([]);
  const [recDate, setRecDate] = useState('');
  const [recTitle, setRecTitle] = useState('');
  const [recLink, setRecLink] = useState('');
  const [recNotes, setRecNotes] = useState('');
  const [recSaving, setRecSaving] = useState(false);

  const [shareModal, setShareModal] = useState(null); // recording object
  const [batchStudents, setBatchStudents] = useState([]);
  const [shareSelected, setShareSelected] = useState([]);
  const [shareSubject, setShareSubject] = useState('');
  const [shareCc, setShareCc] = useState('');
  const [shareBody, setShareBody] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState('');

  const [statsModal, setStatsModal] = useState(null);

  useEffect(() => {
    getBatches().then((res) => {
      setBatches(res.data);
      if (res.data.length > 0) setSelectedBatch(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedBatch) loadRecordings();
  }, [selectedBatch]);

  const loadRecordings = () => {
    getRecordings(selectedBatch).then((res) => setRecordings(res.data));
  };

  const loadAbsentees = () => {
  if (!absentDate) {
    setAbsentStatus('Pick a date first.');
    return;
  }
  getAbsentStudents(selectedBatch, absentDate).then((res) => {
    setAbsentees(res.data);
    setAbsentSelected(res.data.filter((s) => !s.already_notified).map((s) => s.id));
    setAbsentStatus('');
  });
};

  const openAbsentModal = () => {
    if (absentees.length === 0) {
      setAbsentStatus('No absent students loaded for this date.');
      return;
    }
    setAbsentSubject('Missed Class Today');
    setAbsentBody(`<p>Hi {{full_name}},</p><p>You were marked absent for class on <strong>${absentDate}</strong>. Please catch up on today's topics and reach out if you need the recording or notes.</p>`);
    setAbsentCc('');
    setAbsentStatus('');
    setShowAbsentModal(true);
  };

  const toggleAbsentStudent = (id) => {
    setAbsentSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSendAbsentNotice = async () => {
  setAbsentSending(true);
  setAbsentStatus('');
  try {
    const res = await notifyAbsentStudents({
      batch_id: selectedBatch,
      date: absentDate,
      student_ids: absentSelected,
      subject: absentSubject,
      body: absentBody,
      cc: absentCc,
    });
    setAbsentStatus(`Sent to ${res.data.sent_count} student(s).${res.data.skipped.length ? ` ${res.data.skipped.length} skipped.` : ''}`);
    setShowAbsentModal(false);
    loadAbsentees(); // refresh so already-notified students show correctly
  } catch (err) {
    setAbsentStatus('Failed to send.');
  } finally {
    setAbsentSending(false);
  }
};

  const handleCreateRecording = async () => {
    if (!recDate || !recTitle || !recLink) return;
    setRecSaving(true);
    try {
      await createRecording({ batch_id: selectedBatch, date: recDate, title: recTitle, link: recLink, notes: recNotes });
      setRecDate(''); setRecTitle(''); setRecLink(''); setRecNotes('');
      loadRecordings();
    } finally {
      setRecSaving(false);
    }
  };

  const openShareModal = (recording) => {
    getBatchStudents(selectedBatch).then((res) => {
      setBatchStudents(res.data);
      setShareSelected(res.data.map((s) => s.id));
    });
    setShareSubject(`Class Recording: ${recording.title}`);
    setShareBody(`<p>Hi {{full_name}},</p><p>Here's the recording for <strong>${recording.title}</strong> (${recording.date}).</p><p>{{recording_link}}</p>`);
    setShareCc('');
    setShareStatus('');
    setShareModal(recording);
  };

  const toggleShareStudent = (id) => {
    setShareSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleShare = async () => {
    setSharing(true);
    setShareStatus('');
    try {
      const res = await shareRecording(shareModal.id, {
        student_ids: shareSelected, subject: shareSubject, body: shareBody, cc: shareCc,
      });
      setShareStatus(`Sent to ${res.data.sent_count} student(s).${res.data.skipped.length ? ` ${res.data.skipped.length} skipped.` : ''}`);
      loadRecordings();
    } catch (err) {
      setShareStatus('Failed to send.');
    } finally {
      setSharing(false);
    }
  };

  const openStats = (recordingId) => {
    getRecordingStats(recordingId).then((res) => setStatsModal(res.data));
  };

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', boxSizing: 'border-box' };
  const labelStyle = { fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#1E1B4B', display: 'block', marginBottom: '6px' };
  const cardStyle = { background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '20px' };

  return (
    <DashboardShell title="Absentees & Recordings">
      <div style={{ ...cardStyle, maxWidth: '340px' }}>
        <label style={labelStyle}>Batch</label>
        <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} style={inputStyle}>
          {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Absentees section */}
      <div style={cardStyle}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserX size={16} color="#DC2626" /> Absent Students
        </h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" value={absentDate} onChange={(e) => setAbsentDate(e.target.value)} style={{ ...inputStyle, width: '180px' }} />
          </div>
          <button onClick={loadAbsentees} style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', height: '38px' }}>
            Load Absentees
          </button>
        </div>

        {absentStatus && <p style={{ color: absentStatus.includes('Failed') || absentStatus.includes('No absent') ? '#DC2626' : '#059669', fontSize: '13px', marginBottom: '12px' }}>{absentStatus}</p>}

        {absentees.length > 0 && (
  <div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px', maxHeight: '200px', overflowY: 'auto' }}>
      {absentees.map((s) => (
        s.already_notified ? (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ECFDF5', borderRadius: '8px', padding: '8px 12px' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#1E1B4B' }}>{s.name}</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#059669', fontWeight: 600, marginLeft: 'auto' }}>Already Notified</span>
          </div>
        ) : (
          <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }}>
            <input type="checkbox" checked={absentSelected.includes(s.id)} onChange={() => toggleAbsentStudent(s.id)} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#1E1B4B' }}>{s.name}</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', marginLeft: 'auto' }}>{s.personal_email || '—'}</span>
          </label>
        )
      ))}
    </div>
    {absentSelected.length > 0 && (
      <button
        onClick={openAbsentModal}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px' }}
      >
        <Mail size={15} /> Notify {absentSelected.length} Selected
      </button>
    )}
  </div>
)}
      </div>

      {/* Recordings section */}
      <div style={cardStyle}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Video size={16} color="#0051D5" /> Class Recordings
        </h3>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '20px', background: '#F8FAFC', padding: '16px', borderRadius: '10px' }}>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" value={recDate} onChange={(e) => setRecDate(e.target.value)} style={{ ...inputStyle, width: '150px' }} />
          </div>
          <div>
            <label style={labelStyle}>Title</label>
            <input value={recTitle} onChange={(e) => setRecTitle(e.target.value)} placeholder="e.g. Java Collections - Session 5" style={{ ...inputStyle, width: '220px' }} />
          </div>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label style={labelStyle}>Recording Link (Drive / YouTube / Zoom)</label>
            <input value={recLink} onChange={(e) => setRecLink(e.target.value)} placeholder="https://drive.google.com/..." style={inputStyle} />
          </div>
          <button
            onClick={handleCreateRecording}
            disabled={recSaving}
            style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', height: '38px' }}
          >
            {recSaving ? 'Saving...' : 'Add Recording'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recordings.length === 0 ? (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D' }}>No recordings shared yet for this batch.</p>
          ) : (
            recordings.map((r) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#1E1B4B', margin: 0 }}>{r.title}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '2px 0 0' }}>{r.date} · Sent to {r.sent_count} · Watched by {r.watched_count}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openStats(r.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#0051D5', border: '1px solid #0051D5', borderRadius: '6px', padding: '7px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px' }}>
                    <Eye size={13} /> View Stats
                  </button>
                  <button onClick={() => openShareModal(r)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0051D5', color: '#fff', border: 'none', borderRadius: '6px', padding: '7px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px' }}>
                    <Mail size={13} /> Share
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Absent notify modal */}
      {showAbsentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,30,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '600px', maxWidth: '100%', maxHeight: '88vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '17px', color: '#1E1B4B', margin: 0 }}>Notify Absent Students</h3>
              <button onClick={() => setShowAbsentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#76777D" /></button>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', marginBottom: '16px' }}>Use {'{{full_name}}'} for personalization.</p>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>CC (optional)</label><input value={absentCc} onChange={(e) => setAbsentCc(e.target.value)} style={inputStyle} /></div>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Subject</label><input value={absentSubject} onChange={(e) => setAbsentSubject(e.target.value)} style={inputStyle} /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Content (HTML)</label><textarea value={absentBody} onChange={(e) => setAbsentBody(e.target.value)} rows={8} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }} /></div>
            <button onClick={handleSendAbsentNotice} disabled={absentSending} style={{ width: '100%', background: '#DC2626', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', opacity: absentSending ? 0.7 : 1 }}>
              {absentSending ? 'Sending...' : `Send to ${absentSelected.length} Student(s)`}
            </button>
            {absentStatus && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: absentStatus.includes('Failed') ? '#DC2626' : '#059669', marginTop: '14px' }}>{absentStatus}</p>}
          </div>
        </div>
      )}

      {/* Share recording modal */}
      {shareModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,30,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '620px', maxWidth: '100%', maxHeight: '88vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '17px', color: '#1E1B4B', margin: 0 }}>Share: {shareModal.title}</h3>
              <button onClick={() => setShareModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#76777D" /></button>
            </div>
            <label style={labelStyle}>Students (personal email used — uncheck to exclude)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px', maxHeight: '140px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px' }}>
              {batchStudents.map((s) => (
                <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#1E1B4B' }}>
                  <input type="checkbox" checked={shareSelected.includes(s.id)} onChange={() => toggleShareStudent(s.id)} />
                  <span style={{ fontWeight: 600 }}>{s.username}</span>
                  <span style={{ color: '#76777D' }}>{s.email}</span>
                </label>
              ))}
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', marginBottom: '12px' }}>Use {'{{full_name}}'} and {'{{recording_link}}'} in the body — the link is auto-tracked per student.</p>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>CC (optional)</label><input value={shareCc} onChange={(e) => setShareCc(e.target.value)} style={inputStyle} /></div>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Subject</label><input value={shareSubject} onChange={(e) => setShareSubject(e.target.value)} style={inputStyle} /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Content (HTML)</label><textarea value={shareBody} onChange={(e) => setShareBody(e.target.value)} rows={8} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }} /></div>
            <button onClick={handleShare} disabled={sharing} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', opacity: sharing ? 0.7 : 1 }}>
              <Link2 size={16} /> {sharing ? 'Sending...' : `Share with ${shareSelected.length} Student(s)`}
            </button>
            {shareStatus && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: shareStatus.includes('Failed') ? '#DC2626' : '#059669', marginTop: '14px' }}>{shareStatus}</p>}
          </div>
        </div>
      )}

      {/* Stats modal */}
      {/* Stats modal */}
{statsModal && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,30,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
    <div style={{ background: '#fff', borderRadius: '14px', width: '620px', maxWidth: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#1E1B4B', margin: 0 }}>{statsModal.recording_title}</h3>
        <button onClick={() => setStatsModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#76777D" /></button>
      </div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', marginBottom: '16px' }}>Class date: {statsModal.recording_date}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
        <div style={{ background: '#EFF4FF', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#0051D5', margin: 0 }}>{statsModal.attended_live_count}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#45464D', margin: '2px 0 0' }}>Attended Live</p>
        </div>
        <div style={{ background: '#ECFDF5', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#059669', margin: 0 }}>{statsModal.watched_count}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#45464D', margin: '2px 0 0' }}>Watched Recording</p>
        </div>
        <div style={{ background: '#FEF3C7', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#D97706', margin: 0 }}>{statsModal.watched_without_attending_count}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#45464D', margin: '2px 0 0' }}>Watched Only (Missed Live)</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {statsModal.students.map((s) => (
          <div key={s.student_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: s.watched_without_attending ? '#FEF3C7' : '#F8FAFC', borderRadius: '6px', padding: '8px 12px', gap: '10px' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#1E1B4B', flexShrink: 0 }}>{s.name}</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '5px',
                background: s.attended_live ? '#DCFCE7' : '#FEE2E2',
                color: s.attended_live ? '#059669' : '#DC2626',
              }}>
                {s.attended_live ? 'Attended Live' : (s.attendance_status === 'not_marked' ? 'Not Marked' : s.attendance_status.charAt(0).toUpperCase() + s.attendance_status.slice(1))}
              </span>
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '5px',
                background: s.watched_recording ? '#DCFCE7' : '#F1F5F9',
                color: s.watched_recording ? '#059669' : '#76777D',
              }}>
                {s.watched_recording ? `Watched ${new Date(s.watched_at).toLocaleDateString()}` : (s.sent_recording ? 'Not Watched' : 'Not Sent')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
    </DashboardShell>
  );
}
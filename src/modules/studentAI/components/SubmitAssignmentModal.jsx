import { useState } from 'react';
import { X, Paperclip, Send } from 'lucide-react';
import { submitAssignment } from '../api';

const MAX_FILES = 3;
const MAX_FILE_SIZE_MB = 5;

export default function SubmitAssignmentModal({ assignment, onClose, onSubmitted }) {
  const [subject, setSubject] = useState(`Submission of ${assignment.title}`);
  const [cc, setCc] = useState('');
  const [content, setContent] = useState('');
  const [links, setLinks] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }
    const oversized = selected.find((f) => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversized) {
      setError(`'${oversized.name}' exceeds ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setError('');
    setFiles((prev) => [...prev, ...selected]);
    e.target.value = '';
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    setError('');
    if (files.length === 0 && !links.trim() && !content.trim()) {
      setError('Attach a file, paste a link, or write a note.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('assignment', assignment.id);
      formData.append('subject', subject);
      formData.append('cc_email', cc);
      formData.append('student_note', content);
      formData.append('links', links);
      files.forEach((f) => formData.append('attachments', f));

      await submitAssignment(formData);
      onSubmitted?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const labelStyle = { fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#1E1B4B', display: 'block', marginBottom: '6px' };
  const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,30,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '14px', width: '600px', maxWidth: '100%', maxHeight: '88vh', overflowY: 'auto', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '17px', color: '#1E1B4B', margin: 0 }}>
            Submit: {assignment.title}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#76777D" />
          </button>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>To</label>
          <input value={assignment.trainer_submission_email || 'Not set up yet'} disabled style={{ ...inputStyle, background: '#F8FAFC', color: '#76777D' }} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>CC (comma-separated, optional)</label>
          <input value={cc} onChange={(e) => setCc(e.target.value)} style={inputStyle} placeholder="e.g. friend@gmail.com" />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Content / Notes</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} style={inputStyle} placeholder="Describe your submission..." />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Links (GitHub, Google Drive — one per line)</label>
          <textarea value={links} onChange={(e) => setLinks(e.target.value)} rows={3} style={inputStyle} placeholder={"https://github.com/...\nhttps://drive.google.com/..."} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Attachments (screenshots, Word docs — up to {MAX_FILES} files, {MAX_FILE_SIZE_MB}MB each)</label>
          <input type="file" multiple onChange={handleFileChange} accept="image/*,.doc,.docx,.pdf" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px' }} />
          {files.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              {files.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', borderRadius: '6px', padding: '6px 10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#1E1B4B' }}>
                    <Paperclip size={12} /> {f.name} ({(f.size / 1024 / 1024).toFixed(1)}MB)
                  </span>
                  <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', opacity: submitting ? 0.7 : 1 }}
        >
          <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Assignment'}
        </button>
      </div>
    </div>
  );
}
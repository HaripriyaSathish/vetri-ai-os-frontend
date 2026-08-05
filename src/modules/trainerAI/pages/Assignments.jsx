import { useState, useEffect } from 'react';
import DashboardShell from '../../../core/layout/DashboardShell';
import { useAuth } from '../../../core/auth/AuthContext';
import {
  getBatches, getAssignments, createAssignment, generateAssignment,
  getSubmissionsForBatch, updateSubmission, getBatchStudents, createSubmission,
} from '../api';
import { Sparkles, FileText, ClipboardList, Layers, Rocket, Loader2, ChevronDown, ChevronUp, PenLine, MailPlus, Presentation } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const CATEGORIES = [
  { value: 'task', label: 'Daily Task', icon: ClipboardList, color: '#059669' },
  { value: 'mini_project', label: 'Mini Project', icon: Layers, color: '#D97706' },
  { value: 'main_project', label: 'Main Project', icon: Rocket, color: '#7C3AED' },
  { value: 'seminar', label: 'Seminar', icon: Presentation, color: '#0891B2' },
];

function displayName(s) {
  const full = [s.student_first_name, s.student_last_name].filter(Boolean).join(' ').trim();
  return full || s.student_username;
}
function trainerDisplayName(b) {
  const full = [b.trainer_first_name, b.trainer_last_name].filter(Boolean).join(' ').trim();
  return full || b.trainer_username;
}
export default function Assignments() {
  const { user } = useAuth();
  const canEdit = user?.role === 'trainer';

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [batchStudents, setBatchStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('task');

  // AI generation state
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('beginner');
  const [dueDate, setDueDate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Manual assignment creation state
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualDueDate, setManualDueDate] = useState('');
  const [manualSaving, setManualSaving] = useState(false);
  const [manualError, setManualError] = useState('');
  const [manualSuccess, setManualSuccess] = useState('');

  // Manual submission logging state (for Outlook / any non-auto-logged submission)
  const [showLogForm, setShowLogForm] = useState(false);
  const [logStudent, setLogStudent] = useState('');
  const [logAssignment, setLogAssignment] = useState('');
  const [logDate, setLogDate] = useState('');
  const [logScore, setLogScore] = useState('');
  const [logRemarks, setLogRemarks] = useState('');
  const [logSaving, setLogSaving] = useState(false);
  const [logError, setLogError] = useState('');
  const [logSuccess, setLogSuccess] = useState('');

  // Edit remarks (inline row) state
  const [editingSubmissionId, setEditingSubmissionId] = useState(null);
  const [editRemarks, setEditRemarks] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    getBatches().then((res) => {
      setBatches(res.data);
      if (res.data.length > 0) setSelectedBatch(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      loadAssignments();
      loadSubmissions();
      loadBatchStudents();
    }
  }, [selectedBatch]);

  useEffect(() => {
    const handleVoice = (e) => setTopic(e.detail);
    window.addEventListener('vetri-voice-input', handleVoice);
    return () => window.removeEventListener('vetri-voice-input', handleVoice);
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await getAssignments(selectedBatch);
      setAssignments(res.data);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const res = await getSubmissionsForBatch(selectedBatch);
      setSubmissions(res.data);
    } catch (err) {
      setSubmissions([]);
    }
  };

  const loadBatchStudents = async () => {
    try {
      const res = await getBatchStudents(selectedBatch);
      setBatchStudents(res.data);
    } catch (err) {
      setBatchStudents([]);
    }
  };

  const handleGenerate = async () => {
    if (!canEdit) return;
    setError('');
    setSuccess('');
    setGeneratedContent('');
    if (!topic || !selectedBatch) {
      setError('Please select a batch and enter a topic.');
      return;
    }
    setGenerating(true);
    try {
      const res = await generateAssignment({ topic, level, category: activeCategory, batch_id: selectedBatch });
      setGeneratedContent(res.data.generated_content);
    } catch (err) {
      setError('Failed to generate assignment. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!canEdit) return;
    if (!dueDate) {
      setError('Please set a due date before saving.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createAssignment({
        batch: selectedBatch,
        category: activeCategory,
        title: topic,
        description: generatedContent,
        due_date: dueDate,
      });
      setSuccess('Assignment saved!');
      setGeneratedContent('');
      setTopic('');
      setDueDate('');
      loadAssignments();
    } catch (err) {
      setError('Failed to save assignment.');
    } finally {
      setSaving(false);
    }
  };

  const handleManualSave = async () => {
    if (!canEdit) return;
    setManualError('');
    setManualSuccess('');
    if (!manualTitle.trim() || !manualDescription.trim() || !manualDueDate) {
      setManualError('Title, description, and due date are all required.');
      return;
    }
    setManualSaving(true);
    try {
      await createAssignment({
        batch: selectedBatch,
        category: activeCategory,
        title: manualTitle,
        description: manualDescription,
        due_date: manualDueDate,
      });
      setManualSuccess('Assignment saved!');
      setManualTitle('');
      setManualDescription('');
      setManualDueDate('');
      loadAssignments();
    } catch (err) {
      setManualError('Failed to save assignment.');
    } finally {
      setManualSaving(false);
    }
  };

  const handleScoreChange = async (submissionId, score) => {
    if (!canEdit) return;
    try {
      await updateSubmission(submissionId, { score: score ? parseInt(score) : null });
      loadSubmissions();
    } catch (err) {
      setError('Failed to update score.');
    }
  };

  const handleVerifiedToggle = async (submissionId, verifiedValue) => {
    if (!canEdit) return;
    try {
      await updateSubmission(submissionId, { verified: verifiedValue });
      loadSubmissions();
    } catch (err) {
      setError('Failed to update verification status.');
    }
  };

  const handleSaveEdit = async (submissionId) => {
    if (!canEdit) return;
    setEditSaving(true);
    try {
      await updateSubmission(submissionId, { remarks: editRemarks });
      setEditingSubmissionId(null);
      loadSubmissions();
    } catch (err) {
      setError('Failed to save changes.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleLogSubmission = async () => {
    if (!canEdit) return;
    setLogError('');
    setLogSuccess('');
    if (!logStudent || !logAssignment || !logDate) {
      setLogError('Student, assignment, and submission date are required.');
      return;
    }
    setLogSaving(true);
    try {
      await createSubmission({
        assignment: logAssignment,
        student: logStudent,
        submitted_at: `${logDate}T00:00:00Z`,
        score: logScore ? parseInt(logScore) : null,
        remarks: logRemarks || 'Manually logged by trainer (e.g. emailed via Outlook).',
      });
      setLogSuccess('Submission logged!');
      setLogStudent('');
      setLogAssignment('');
      setLogDate('');
      setLogScore('');
      setLogRemarks('');
      loadSubmissions();
    } catch (err) {
      setLogError(
        err.response?.data?.assignment?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to log submission — that student may already have a submission for this assignment.'
      );
    } finally {
      setLogSaving(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => a.category === activeCategory);
  const activeConfig = CATEGORIES.find((c) => c.value === activeCategory);

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD',
    borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#1E1B4B', display: 'block', marginBottom: '6px',
  };
  const thStyle = {
    padding: '10px 14px', textAlign: 'left', fontFamily: 'Inter, sans-serif',
    fontWeight: 600, fontSize: '12px', color: '#76777D', borderBottom: '1px solid #E2E8F0',
  };
  const tdStyle = {
    padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: '13px',
    color: '#45464D', borderBottom: '1px solid #F1F5F9',
  };
  const emptyStateStyle = {
    background: 'rgba(255,255,255,0.9)', borderRadius: '10px', padding: '14px 18px', display: 'inline-block',
  };
  const toggleLinkStyle = {
    display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#0051D5', padding: 0,
  };

  return (
    <DashboardShell title="Assignments">
      {/* Batch selector */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', maxWidth: '340px' }}>
        <label style={labelStyle}>Batch</label>
        <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}{b.trainer_username ? ` — ${trainerDisplayName(b)}` : ''}</option>
          ))}
        </select>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {CATEGORIES.map(({ value, label, icon: Icon, color }) => {
          const isActive = activeCategory === value;
          return (
            <button
              key={value}
              onClick={() => { setActiveCategory(value); setGeneratedContent(''); setTopic(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '10px', cursor: 'pointer',
                border: `1.5px solid ${color}`,
                background: isActive ? color : '#fff',
                color: isActive ? '#fff' : color,
                fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} /> {label}
            </button>
          );
        })}
      </div>

      {/* Generate form (AI) — trainer only */}
      {canEdit && (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color={activeConfig.color} />
            Generate {activeConfig.label} with AI
          </h3>

          {error && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
          {success && <p style={{ color: '#059669', fontSize: '13px', marginBottom: '12px' }}>{success}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '16px', marginBottom: '16px', alignItems: 'end' }}>
            <div>
              <label style={labelStyle}>Topic</label>
              <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. REST APIs, or use Voice Assistant above" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} style={inputStyle}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: activeConfig.color, color: '#fff', border: 'none',
                borderRadius: '8px', padding: '10px 18px', cursor: generating ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap',
                opacity: generating ? 0.7 : 1,
              }}
            >
              {generating ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>

          {generatedContent && (
            <div style={{ marginTop: '16px' }}>
              <div
                className="markdown-body"
                style={{
                  background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px',
                  padding: '20px', fontFamily: 'Inter, sans-serif', fontSize: '13.5px',
                  color: '#334155', maxHeight: '450px', overflowY: 'auto', marginBottom: '16px', lineHeight: 1.7,
                }}
              >
                <ReactMarkdown>{generatedContent}</ReactMarkdown>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'end' }}>
                <div style={{ maxWidth: '220px' }}>
                  <label style={labelStyle}>Due Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    background: '#059669', color: '#fff', border: 'none', borderRadius: '8px',
                    padding: '10px 18px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px',
                  }}
                >
                  {saving ? 'Saving...' : `Save as ${activeConfig.label}`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual assignment creation (no AI) — trainer only */}
      {canEdit && (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px' }}>
          <button onClick={() => setShowManualForm((v) => !v)} style={toggleLinkStyle}>
            <PenLine size={15} />
            {showManualForm ? 'Hide manual entry' : `Or type a ${activeConfig.label} manually`}
            {showManualForm ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showManualForm && (
            <div style={{ marginTop: '16px' }}>
              {manualError && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '12px' }}>{manualError}</p>}
              {manualSuccess && <p style={{ color: '#059669', fontSize: '13px', marginBottom: '12px' }}>{manualSuccess}</p>}

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Title</label>
                <input
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g. Build a Todo API"
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="Write the task description, requirements, and submission format directly."
                  rows={5}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'end' }}>
                <div style={{ maxWidth: '220px' }}>
                  <label style={labelStyle}>Due Date</label>
                  <input type="date" value={manualDueDate} onChange={(e) => setManualDueDate(e.target.value)} style={inputStyle} />
                </div>
                <button
                  onClick={handleManualSave}
                  disabled={manualSaving}
                  style={{
                    background: activeConfig.color, color: '#fff', border: 'none', borderRadius: '8px',
                    padding: '10px 18px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px',
                  }}
                >
                  {manualSaving ? 'Saving...' : `Save as ${activeConfig.label}`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Saved assignments list — filtered by active category */}
      <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', marginBottom: '12px' }}>
        Saved {activeConfig.label}s
      </h3>
      {loading ? (
        <div style={emptyStateStyle}>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#45464D', margin: 0 }}>Loading...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div style={emptyStateStyle}>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#45464D', margin: 0 }}>No {activeConfig.label.toLowerCase()}s saved yet for this batch.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {filteredAssignments.map((a) => {
            const isExpanded = expandedId === a.id;
            return (
              <div key={a.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : a.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <FileText size={16} color={activeConfig.color} style={{ flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1E1B4B' }}>
                    {a.title}
                  </span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', marginLeft: 'auto' }}>
                    Due: {a.due_date}
                  </span>
                  {isExpanded ? <ChevronUp size={16} color="#76777D" /> : <ChevronDown size={16} color="#76777D" />}
                </button>

                {isExpanded && (
                  <div
                    className="markdown-body"
                    style={{
                      padding: '0 16px 16px', fontFamily: 'Inter, sans-serif', fontSize: '13.5px',
                      color: '#334155', borderTop: '1px solid #F1F5F9',
                      paddingTop: '16px', maxHeight: '450px', overflowY: 'auto', lineHeight: 1.7,
                    }}
                  >
                    <ReactMarkdown>{a.description}</ReactMarkdown>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Log a submission manually — the Outlook fallback — trainer only */}
      {canEdit && (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px' }}>
          <button onClick={() => setShowLogForm((v) => !v)} style={toggleLinkStyle}>
            <MailPlus size={15} />
            {showLogForm ? 'Hide manual submission log' : 'Log a submission manually (e.g. received by email)'}
            {showLogForm ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '8px 0 0' }}>
            Use this for students whose submission emails can't be auto-detected (e.g. sent to an Outlook inbox), or any submission you received outside the system.
          </p>

          {showLogForm && (
            <div style={{ marginTop: '16px' }}>
              {logError && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '12px' }}>{logError}</p>}
              {logSuccess && <p style={{ color: '#059669', fontSize: '13px', marginBottom: '12px' }}>{logSuccess}</p>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>Student</label>
                  <select value={logStudent} onChange={(e) => setLogStudent(e.target.value)} style={inputStyle}>
                    <option value="">Select student...</option>
                    {batchStudents.map((s) => (
                      <option key={s.id} value={s.id}>{s.username}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Assignment</label>
                  <select value={logAssignment} onChange={(e) => setLogAssignment(e.target.value)} style={inputStyle}>
                    <option value="">Select assignment...</option>
                    {assignments.map((a) => (
                      <option key={a.id} value={a.id}>{a.title} ({CATEGORIES.find((c) => c.value === a.category)?.label})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Submitted On</label>
                  <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Score</label>
                  <input
                    type="number" min="0" max="100" value={logScore}
                    onChange={(e) => setLogScore(e.target.value)}
                    placeholder="Optional"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Remarks</label>
                  <input
                    value={logRemarks}
                    onChange={(e) => setLogRemarks(e.target.value)}
                    placeholder='e.g. "Received via Outlook email on 30 Jul"'
                    style={inputStyle}
                  />
                </div>
              </div>

              <button
                onClick={handleLogSubmission}
                disabled={logSaving}
                style={{
                  background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px',
                  padding: '10px 18px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px',
                }}
              >
                {logSaving ? 'Logging...' : 'Log Submission'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Student submissions table */}
      <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 12px' }}>
        Student Submissions
      </h3>
      {submissions.length === 0 ? (
        <div style={emptyStateStyle}>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#45464D', margin: 0 }}>No submissions yet for this batch.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Student', 'Assignment', 'Submitted', 'Due Date', 'Status', 'Score', 'Verified', 'Edit'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <>
                  <tr key={s.id}>
                    <td style={tdStyle}>{displayName(s)}</td>
                    <td style={tdStyle}>{s.assignment_title}</td>
                    <td style={tdStyle}>{new Date(s.submitted_at).toLocaleDateString()}</td>
                    <td style={tdStyle}>{s.due_date}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: '3px 10px', borderRadius: '6px', fontFamily: 'Inter, sans-serif',
                          fontWeight: 600, fontSize: '11px',
                          background: s.on_time ? '#DCFCE7' : '#FEE2E2',
                          color: s.on_time ? '#059669' : '#DC2626',
                        }}
                      >
                        {s.on_time ? 'On Time' : 'Late'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={s.score ?? ''}
                        placeholder="—"
                        disabled={!canEdit}
                        onBlur={(e) => handleScoreChange(s.id, e.target.value)}
                        style={{
                          width: '60px', padding: '4px 8px', border: '1px solid #C6C6CD',
                          borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '12px',
                          opacity: canEdit ? 1 : 0.5, cursor: canEdit ? 'text' : 'not-allowed',
                        }}
                      />
                    </td>
                    <td style={tdStyle}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: canEdit ? 'pointer' : 'default' }}>
                        <input
                          type="checkbox"
                          checked={!!s.verified}
                          disabled={!canEdit}
                          onChange={(e) => handleVerifiedToggle(s.id, e.target.checked)}
                        />
                        {s.verified ? (
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#059669' }}>Verified</span>
                        ) : (
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D' }}>Not yet</span>
                        )}
                      </label>
                    </td>
                    <td style={tdStyle}>
                      {canEdit && (
                        <button
                          onClick={() => {
                            if (editingSubmissionId === s.id) {
                              setEditingSubmissionId(null);
                            } else {
                              setEditingSubmissionId(s.id);
                              setEditRemarks(s.remarks || '');
                            }
                          }}
                          style={{
                            background: 'none', border: '1px solid #C6C6CD', borderRadius: '6px',
                            padding: '4px 10px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#0051D5',
                          }}
                        >
                          {editingSubmissionId === s.id ? 'Close' : 'Edit'}
                        </button>
                      )}
                    </td>
                  </tr>
                  {editingSubmissionId === s.id && (
                    <tr key={`${s.id}-edit`}>
                      <td colSpan={8} style={{ padding: '14px 20px', background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                        <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#1E1B4B', display: 'block', marginBottom: '6px' }}>
                          Remarks
                        </label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input
                            value={editRemarks}
                            onChange={(e) => setEditRemarks(e.target.value)}
                            placeholder='e.g. "Verified completed via email attachment"'
                            style={{ flex: 1, padding: '8px 10px', border: '1px solid #C6C6CD', borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}
                          />
                          <button
                            onClick={() => handleSaveEdit(s.id)}
                            disabled={editSaving}
                            style={{
                              background: '#059669', color: '#fff', border: 'none', borderRadius: '6px',
                              padding: '8px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px',
                            }}
                          >
                            {editSaving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
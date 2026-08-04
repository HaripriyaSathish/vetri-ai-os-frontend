import { useState, useEffect, useRef } from 'react';
import DashboardShell from '../../../core/layout/DashboardShell';
import { useAuth } from '../../../core/auth/AuthContext';
import {
  getBatches, getMockQuestions, createMockQuestion, generateMockQuestions,
  getMockEligibility, sendMockInvites, getMockSessions, updateMockSession, uploadMockScores,
  deleteMockQuestion, scheduleIndividualInterview,
} from '../api';
import { Sparkles, MessageSquareText, Loader2, Trash2, Mail, Upload, FileDown, Video, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';

const DIFFICULTY_COLOR = { beginner: '#059669', intermediate: '#D97706', advanced: '#DC2626' };

function displayName(e) {
  const full = [e.first_name, e.last_name].filter(Boolean).join(' ').trim();
  return full || e.username;
}
function trainerDisplayName(b) {
  const full = [b.trainer_first_name, b.trainer_last_name].filter(Boolean).join(' ').trim();
  return full || b.trainer_username;
}
export default function MockInterviews() {
  const { user } = useAuth();
  const canEdit = user?.role === 'trainer';

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [generatedList, setGeneratedList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [eligibility, setEligibility] = useState([]);
  const [sending, setSending] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [windowStart, setWindowStart] = useState('10:00 AM');
  const [windowEnd, setWindowEnd] = useState('5:00 PM');

  // Notify Eligible Students — compose modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSubject, setInviteSubject] = useState('');
  const [inviteBody, setInviteBody] = useState('');
  const [inviteCc, setInviteCc] = useState('');

  const [uploadingScores, setUploadingScores] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileInputRef = useRef(null);

  // Individual scheduling (Teams link) state
  const [schedulingStudentId, setSchedulingStudentId] = useState(null);
  const [slotDatetime, setSlotDatetime] = useState('');
  const [slotLink, setSlotLink] = useState('');
  const [slotSaving, setSlotSaving] = useState(false);
  const [slotMsg, setSlotMsg] = useState('');

  useEffect(() => {
    getBatches().then((res) => {
      setBatches(res.data);
      if (res.data.length > 0) setSelectedBatch(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      loadQuestions();
      loadEligibility();
    }
  }, [selectedBatch]);

  useEffect(() => {
    const handleVoice = (e) => setTopic(e.detail);
    window.addEventListener('vetri-voice-input', handleVoice);
    return () => window.removeEventListener('vetri-voice-input', handleVoice);
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await getMockQuestions(selectedBatch);
      setQuestions(res.data);
    } finally {
      setLoading(false);
    }
  };

  const loadEligibility = async () => {
    try {
      const res = await getMockEligibility(selectedBatch);
      setEligibility(res.data);
    } catch (err) {
      // silent fail, table will just show empty
    }
  };

  const parseQuestions = (text) => {
    return text
      .split(/\n(?=\d+\.\s)/)
      .map((q) => q.replace(/^\d+\.\s*/, '').trim())
      .filter((q) => q.length > 0);
  };

  const handleGenerate = async () => {
    if (!canEdit) return;
    setError('');
    setSuccess('');
    setGeneratedList([]);
    if (!topic || !selectedBatch) {
      setError('Please select a batch and enter a topic.');
      return;
    }
    setGenerating(true);
    try {
      const res = await generateMockQuestions({ topic, difficulty, count, batch_id: selectedBatch });
      setGeneratedList(parseQuestions(res.data.generated_content));
    } catch (err) {
      setError('Failed to generate questions. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAll = async () => {
    if (!canEdit) return;
    setSaving(true);
    setError('');
    try {
      for (const question of generatedList) {
        await createMockQuestion({ batch: selectedBatch, topic, question, difficulty });
      }
      setSuccess(`Saved ${generatedList.length} question(s)!`);
      setGeneratedList([]);
      setTopic('');
      loadQuestions();
    } catch (err) {
      setError('Failed to save some questions.');
    } finally {
      setSaving(false);
    }
  };

  const removeGeneratedQuestion = (index) => {
    setGeneratedList(generatedList.filter((_, i) => i !== index));
  };

  const handleDeleteQuestion = async (id) => {
    if (!canEdit) return;
    if (!window.confirm('Delete this question?')) return;
    try {
      await deleteMockQuestion(id);
      loadQuestions();
    } catch (err) {
      setError('Failed to delete question.');
    }
  };

  const buildInviteDefaults = () => {
    setInviteSubject(`Mock Interview - You're Eligible!`);
    setInviteBody(
      `<p>Hi {{full_name}},</p>` +
      `<p>Congratulations! You've completed all assignments on time and maintained {{attendance_percentage}}% attendance. You're eligible for the Mock Interview round.</p>` +
      `<p>Please be ready and available on <strong>${interviewDate}</strong>, between <strong>${windowStart}</strong> and <strong>${windowEnd}</strong>.</p>` +
      `<p>Your exact time slot and the Microsoft Teams meeting link will be shared with you individually shortly.</p>` +
      `<p>Best of luck!</p>`
    );
    setInviteCc('');
  };

  const handleOpenInviteModal = () => {
    if (!interviewDate) {
      setInviteMsg('Please pick a date first.');
      return;
    }
    buildInviteDefaults();
    setInviteMsg('');
    setShowInviteModal(true);
  };

  const handleSendInvites = async () => {
    setSending(true);
    setInviteMsg('');
    try {
      const res = await sendMockInvites(selectedBatch, interviewDate, windowStart, windowEnd, inviteSubject, inviteBody, inviteCc);
      setInviteMsg(`Notified ${res.data.count} newly eligible student(s) to be ready on ${interviewDate}, ${windowStart}–${windowEnd}.`);
      setShowInviteModal(false);
      loadEligibility();
    } catch (err) {
      setInviteMsg('Failed to send invites.');
    } finally {
      setSending(false);
    }
  };

  const handleMarkAttended = async (studentId, attendedValue) => {
    const res = await getMockSessions(selectedBatch);
    const record = res.data.find((s) => s.student === studentId);
    if (record) {
      await updateMockSession(record.id, { attended: attendedValue });
      loadEligibility();
    }
  };

  const handleScoreBlur = async (studentId, scoreValue) => {
    const res = await getMockSessions(selectedBatch);
    const record = res.data.find((s) => s.student === studentId);
    if (record) {
      await updateMockSession(record.id, { score: scoreValue });
      loadEligibility();
    }
  };

  const handleRemarksBlur = async (studentId, remarksValue) => {
    if (!canEdit) return;
    const res = await getMockSessions(selectedBatch);
    const record = res.data.find((s) => s.student === studentId);
    if (record) {
      await updateMockSession(record.id, { feedback: remarksValue });
      loadEligibility();
    }
  };

  const openScheduleForm = (e) => {
    setSchedulingStudentId(e.student_id);
    setSlotDatetime(e.scheduled_datetime ? e.scheduled_datetime.slice(0, 16) : '');
    setSlotLink(e.meeting_link || '');
    setSlotMsg('');
  };

  const handleScheduleSave = async (sessionId) => {
    if (!slotDatetime) {
      setSlotMsg('Pick a date and time first.');
      return;
    }
    setSlotSaving(true);
    setSlotMsg('');
    try {
      await scheduleIndividualInterview(sessionId, slotDatetime, slotLink);
      setSlotMsg('Sent!');
      loadEligibility();
      setTimeout(() => {
        setSchedulingStudentId(null);
        setSlotMsg('');
      }, 1000);
    } catch (err) {
      setSlotMsg('Failed to send.');
    } finally {
      setSlotSaving(false);
    }
  };

  const handleDownloadTemplate = () => {
    const invitedStudents = eligibility.filter((e) => e.invited);
    const rows = invitedStudents.map((e) => ({
      Student: e.username,
      Attended: e.attended === true ? 'Yes' : e.attended === false ? 'No' : '',
      Score: e.score ?? '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Student: '', Attended: '', Score: '' }]);
    worksheet['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 10 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Scores');
    XLSX.writeFile(workbook, 'mock_interview_scores_template.xlsx');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingScores(true);
    setUploadMsg('');
    try {
      const res = await uploadMockScores(selectedBatch, file);
      setUploadMsg(
        `Updated ${res.data.updated_count} student(s).` +
        (res.data.errors.length > 0 ? ` ${res.data.errors.length} issue(s): ${res.data.errors.join(' | ')}` : '')
      );
      loadEligibility();
    } catch (err) {
      setUploadMsg('Failed to upload scores. Check the file format.');
    } finally {
      setUploadingScores(false);
      e.target.value = '';
    }
  };

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
  const sectionHeaderStyle = {
    background: 'rgba(255,255,255,0.9)', borderRadius: '10px', padding: '14px 20px', marginBottom: '12px', display: 'inline-block',
  };
  const emptyStateStyle = {
    background: 'rgba(255,255,255,0.9)', borderRadius: '10px', padding: '14px 18px', display: 'inline-block',
  };

  return (
    <DashboardShell title="Mock Interviews">
      {/* Batch selector */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', maxWidth: '340px' }}>
        <label style={labelStyle}>Batch</label>
        <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
          {batches.map((b) => (
           <option key={b.id} value={b.id}>{b.name}{b.trainer_username ? ` — ${trainerDisplayName(b)}` : ''}</option>
          ))}
        </select>
      </div>

      {/* Generate form — trainer only */}
      {canEdit && (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 16px' }}>
            Generate Mock Interview Questions with AI
          </h3>

          {error && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
          {success && <p style={{ color: '#059669', fontSize: '13px', marginBottom: '12px' }}>{success}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 100px auto', gap: '16px', marginBottom: '16px', alignItems: 'end' }}>
            <div>
              <label style={labelStyle}>Topic</label>
              <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Java Collections, or use Voice Assistant above" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={inputStyle}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Count</label>
              <input type="number" min="1" max="15" value={count} onChange={(e) => setCount(e.target.value)} style={inputStyle} />
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#0051D5', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '10px 18px', cursor: generating ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap',
                opacity: generating ? 0.7 : 1,
              }}
            >
              {generating ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>

          {generatedList.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {generatedList.map((q, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px',
                      background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px',
                    }}
                  >
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#0051D5', flexShrink: 0 }}>
                      {i + 1}.
                    </span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', flex: 1 }}>
                      {q}
                    </span>
                    <button
                      onClick={() => removeGeneratedQuestion(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', flexShrink: 0 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                style={{
                  background: '#059669', color: '#fff', border: 'none', borderRadius: '8px',
                  padding: '10px 18px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px',
                }}
              >
                {saving ? 'Saving...' : `Save All ${generatedList.length} Question(s)`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Saved questions list */}
      <div style={sectionHeaderStyle}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: 0 }}>
          Saved Questions
        </h3>
      </div>
      <br />
      {loading ? (
        <div style={emptyStateStyle}>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#45464D', margin: 0 }}>Loading...</p>
        </div>
      ) : questions.length === 0 ? (
        <div style={emptyStateStyle}>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#45464D', margin: 0 }}>No questions saved yet for this batch.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          {questions.map((q) => (
            <div
              key={q.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#fff',
                border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 16px',
              }}
            >
              <MessageSquareText size={16} color="#0051D5" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', margin: '0 0 6px' }}>
                  {q.question}
                </p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D' }}>{q.topic}</span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600,
                      color: DIFFICULTY_COLOR[q.difficulty], textTransform: 'capitalize',
                    }}
                  >
                    {q.difficulty}
                  </span>
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  title="Delete question"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', flexShrink: 0, padding: '4px' }}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Eligibility + bulk notice + individual scheduling */}
      <div style={sectionHeaderStyle}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: 0 }}>
          Eligible Students (85%+ Attendance, All Assignments On Time)
        </h3>
      </div>

      {inviteMsg && <p style={{ color: inviteMsg.includes('Failed') ? '#DC2626' : '#059669', fontSize: '13px', margin: '12px 0' }}>{inviteMsg}</p>}

      {/* Step 1: bulk "be ready" notice — no time, no link yet */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1E1B4B', margin: '0 0 4px' }}>
          Step 1 — Notify newly eligible students
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 16px' }}>
          Sends a "be ready" email with a date and a general time window. No specific slot or meeting link yet.
        </p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <label style={labelStyle}>Interview Date</label>
            <input type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Window Start</label>
            <input value={windowStart} onChange={(e) => setWindowStart(e.target.value)} placeholder="10:00 AM" style={{ ...inputStyle, width: '120px' }} />
          </div>
          <div>
            <label style={labelStyle}>Window End</label>
            <input value={windowEnd} onChange={(e) => setWindowEnd(e.target.value)} placeholder="5:00 PM" style={{ ...inputStyle, width: '120px' }} />
          </div>
          <button
            onClick={handleOpenInviteModal}
            disabled={sending}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
              height: '38px',
            }}
          >
            <Mail size={16} /> Notify Eligible Students
          </button>
        </div>
      </div>

      {/* Excel score upload/download */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={handleDownloadTemplate}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#fff', color: '#0051D5', border: '1px solid #0051D5', borderRadius: '8px',
            padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
          }}
        >
          <FileDown size={16} /> Download Score Sheet
        </button>
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={uploadingScores}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#059669', color: '#fff', border: 'none', borderRadius: '8px',
            padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
          }}
        >
          <Upload size={16} /> {uploadingScores ? 'Uploading...' : 'Upload Filled Scores'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>

      {uploadMsg && (
        <p style={{ color: uploadMsg.includes('Updated') ? '#059669' : '#DC2626', fontSize: '13px', marginBottom: '12px' }}>
          {uploadMsg}
        </p>
      )}

      {eligibility.length === 0 ? (
        <div style={emptyStateStyle}>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#45464D', margin: 0 }}>No student data yet for this batch.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Student', 'Attendance', 'Assignments', 'Eligible', 'Invited', 'Interview Slot', 'Attended', 'Score', 'Remarks'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eligibility.map((e) => (
                <>
                  <tr key={e.student_id}>
                    <td style={tdStyle}>{displayName(e)}</td>
                    <td style={tdStyle}>{e.attendance_percentage}%</td>
                    <td style={tdStyle}>{e.assignments_submitted}/{e.total_assignments}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: '3px 10px', borderRadius: '6px', fontFamily: 'Inter, sans-serif',
                          fontWeight: 600, fontSize: '11px',
                          background: e.eligible ? '#DCFCE7' : '#FEE2E2',
                          color: e.eligible ? '#059669' : '#DC2626',
                        }}
                      >
                        {e.eligible ? 'Eligible' : 'Not Yet'}
                      </span>
                    </td>
                    <td style={tdStyle}>{e.invited ? 'Yes' : '—'}</td>
                    <td style={tdStyle}>
                      {!e.invited ? '—' : (
                        <button
                          onClick={() => schedulingStudentId === e.student_id ? setSchedulingStudentId(null) : openScheduleForm(e)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600,
                            color: e.scheduled_datetime ? '#059669' : '#0051D5',
                          }}
                        >
                          {e.scheduled_datetime ? <Check size={13} /> : <Video size={13} />}
                          {e.scheduled_datetime
                            ? new Date(e.scheduled_datetime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                            : 'Schedule + Send Link'}
                          {schedulingStudentId === e.student_id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {e.invited ? (
                        <select
                          value={e.attended === null ? '' : e.attended ? 'yes' : 'no'}
                          onChange={(ev) => handleMarkAttended(e.student_id, ev.target.value === 'yes')}
                          style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #C6C6CD' }}
                        >
                          <option value="">Pending</option>
                          <option value="yes">Attended</option>
                          <option value="no">Missed</option>
                        </select>
                      ) : '—'}
                    </td>
                    <td style={tdStyle}>
                      {e.invited && e.attended ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          defaultValue={e.score || ''}
                          onBlur={(ev) => handleScoreBlur(e.student_id, ev.target.value ? parseInt(ev.target.value) : null)}
                          style={{ width: '60px', fontFamily: 'Inter, sans-serif', fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #C6C6CD' }}
                        />
                      ) : '—'}
                    </td>
                    <td style={tdStyle}>
                      {e.invited ? (
                        canEdit ? (
                          <input
                            type="text"
                            defaultValue={e.feedback || ''}
                            placeholder="Add remarks..."
                            onBlur={(ev) => handleRemarksBlur(e.student_id, ev.target.value)}
                            style={{ width: '140px', fontFamily: 'Inter, sans-serif', fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #C6C6CD' }}
                          />
                        ) : (
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#45464D' }}>{e.feedback || '—'}</span>
                        )
                      ) : '—'}
                    </td>
                  </tr>
                  {schedulingStudentId === e.student_id && (
                    <tr key={`${e.student_id}-schedule`}>
                      <td colSpan={9} style={{ padding: '16px 24px', background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'end', flexWrap: 'wrap' }}>
                          <div>
                            <label style={labelStyle}>Date & Time</label>
                            <input
                              type="datetime-local"
                              value={slotDatetime}
                              onChange={(ev) => setSlotDatetime(ev.target.value)}
                              style={{ ...inputStyle, width: '220px' }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: '260px' }}>
                            <label style={labelStyle}>Microsoft Teams Meeting Link</label>
                            <input
                              value={slotLink}
                              onChange={(ev) => setSlotLink(ev.target.value)}
                              placeholder="https://teams.microsoft.com/l/meetup-join/..."
                              style={inputStyle}
                            />
                          </div>
                          <button
                            onClick={() => handleScheduleSave(e.session_id)}
                            disabled={slotSaving}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '8px',
                              background: '#059669', color: '#fff', border: 'none', borderRadius: '8px',
                              padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
                              height: '38px', whiteSpace: 'nowrap',
                            }}
                          >
                            <Mail size={15} /> {slotSaving ? 'Sending...' : 'Send Slot & Link'}
                          </button>
                        </div>
                        {slotMsg && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: slotMsg === 'Sent!' ? '#059669' : '#DC2626', margin: '10px 0 0' }}>{slotMsg}</p>}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notify Eligible Students — compose modal */}
      {showInviteModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,15,30,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '600px', maxWidth: '100%', maxHeight: '88vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '17px', color: '#1E1B4B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} color="#0051D5" /> Notify Eligible Students
              </h3>
              <button onClick={() => setShowInviteModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#76777D" />
              </button>
            </div>

            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', marginBottom: '16px' }}>
              Sending to {eligibility.filter((e) => e.eligible && !e.invited).length} newly eligible student(s), pulled from their student records. Use {'{{full_name}}'} and {'{{attendance_percentage}}'} for personalization.
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>CC (comma-separated, optional)</label>
              <input value={inviteCc} onChange={(e) => setInviteCc(e.target.value)} style={inputStyle} placeholder="e.g. founder@vetri.com" />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Subject</label>
              <input value={inviteSubject} onChange={(e) => setInviteSubject(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Content (HTML)</label>
              <textarea value={inviteBody} onChange={(e) => setInviteBody(e.target.value)} rows={9} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }} />
            </div>

            <button
              onClick={handleSendInvites}
              disabled={sending}
              style={{ width: '100%', background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', opacity: sending ? 0.7 : 1 }}
            >
              {sending ? 'Sending...' : 'Send Notifications'}
            </button>

            {inviteMsg && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: inviteMsg.includes('Failed') ? '#DC2626' : '#059669', marginTop: '14px' }}>{inviteMsg}</p>}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
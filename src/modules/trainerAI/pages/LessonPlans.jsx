import { useState, useEffect } from 'react';
import DashboardShell from '../../../core/layout/DashboardShell';
import { getBatches, getLessonPlans, createLessonPlan, generateLessonPlan, getSchedules, createSchedule } from '../api';
import { Sparkles, BookOpen, Loader2, ChevronDown, ChevronUp, Calendar, Clock, PenLine } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
function trainerDisplayName(b) {
  const full = [b.trainer_first_name, b.trainer_last_name].filter(Boolean).join(' ').trim();
  return full || b.trainer_username;
}
export default function LessonPlans() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [lessonPlans, setLessonPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('beginner');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Manual entry state
  const [manualTopic, setManualTopic] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualContent, setManualContent] = useState('');
  const [manualSaving, setManualSaving] = useState(false);
  const [manualMsg, setManualMsg] = useState('');

  const [schedules, setSchedules] = useState([]);
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [scheduleTopic, setScheduleTopic] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleMsg, setScheduleMsg] = useState('');

  useEffect(() => {
    getBatches().then((res) => {
      setBatches(res.data);
      if (res.data.length > 0) setSelectedBatch(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      loadLessonPlans();
      loadSchedules();
    }
  }, [selectedBatch]);

  useEffect(() => {
    const handleVoice = (e) => setTopic(e.detail);
    window.addEventListener('vetri-voice-input', handleVoice);
    return () => window.removeEventListener('vetri-voice-input', handleVoice);
  }, []);

  const loadLessonPlans = async () => {
    setLoading(true);
    try {
      const res = await getLessonPlans(selectedBatch);
      setLessonPlans(res.data);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const res = await getSchedules(selectedBatch);
      setSchedules(res.data);
    } catch (err) {
      setSchedules([]);
    }
  };

  const handleSaveSchedule = async () => {
    if (!startTime || !endTime || !scheduleTopic) {
      setScheduleMsg('Please fill in start time, end time, and topic.');
      return;
    }
    setSavingSchedule(true);
    setScheduleMsg('');
    try {
      await createSchedule({
        batch: selectedBatch,
        date: scheduleDate,
        start_time: startTime,
        end_time: endTime,
        topic: scheduleTopic,
      });
      setScheduleMsg('Class schedule saved!');
      setStartTime('');
      setEndTime('');
      setScheduleTopic('');
      loadSchedules();
    } catch (err) {
      setScheduleMsg('Failed to save schedule.');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleGenerate = async () => {
    setError('');
    setSuccess('');
    setGeneratedContent('');
    if (!topic || !selectedBatch) {
      setError('Please select a batch and enter a topic.');
      return;
    }
    setGenerating(true);
    try {
      const res = await generateLessonPlan({ topic, level, batch_id: selectedBatch });
      setGeneratedContent(res.data.generated_content);
    } catch (err) {
      setError('Failed to generate lesson plan. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await createLessonPlan({
        batch: selectedBatch,
        topic,
        content: generatedContent,
        date: new Date().toISOString().split('T')[0],
      });
      setSuccess('Lesson plan saved!');
      setGeneratedContent('');
      setTopic('');
      loadLessonPlans();
    } catch (err) {
      setError('Failed to save lesson plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleManualSave = async () => {
    setManualMsg('');
    if (!manualTopic || !manualContent || !manualDate) {
      setManualMsg('Please fill in date, topic, and content.');
      return;
    }
    setManualSaving(true);
    try {
      await createLessonPlan({
        batch: selectedBatch,
        topic: manualTopic,
        content: manualContent,
        date: manualDate,
      });
      setManualMsg('Lesson plan saved!');
      setManualTopic('');
      setManualContent('');
      setManualDate(new Date().toISOString().split('T')[0]);
      loadLessonPlans();
    } catch (err) {
      setManualMsg('Failed to save lesson plan.');
    } finally {
      setManualSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD',
    borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#1E1B4B', display: 'block', marginBottom: '6px',
  };
  const emptyStateStyle = {
    background: 'rgba(255,255,255,0.9)', borderRadius: '10px', padding: '14px 18px', display: 'inline-block',
  };

  return (
    <DashboardShell title="Lesson Plans">
      {/* Batch selector */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', maxWidth: '340px' }}>
        <label style={labelStyle}>Batch</label>
        <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}{b.trainer_username ? ` — ${trainerDisplayName(b)}` : ''}</option>
          ))}
        </select>
      </div>

      {/* Class Schedule */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="#0051D5" />
          Class Schedule
        </h3>

        {scheduleMsg && (
          <p style={{ color: scheduleMsg.includes('saved') ? '#059669' : '#DC2626', fontSize: '13px', marginBottom: '12px' }}>
            {scheduleMsg}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr auto', gap: '12px', alignItems: 'end', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Start Time</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>End Time</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Topic</label>
            <input value={scheduleTopic} onChange={(e) => setScheduleTopic(e.target.value)} placeholder="e.g. REST APIs" style={inputStyle} />
          </div>
          <button
            onClick={handleSaveSchedule}
            disabled={savingSchedule}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '10px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap',
            }}
          >
            <Clock size={14} /> {savingSchedule ? 'Saving...' : 'Save'}
          </button>
        </div>

        {schedules.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {schedules.slice(0, 5).map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC',
                  border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 14px',
                }}
              >
                <Calendar size={14} color="#76777D" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', minWidth: '90px' }}>{s.date}</span>
                <Clock size={14} color="#76777D" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', minWidth: '130px' }}>
                  {s.start_time} - {s.end_time}
                </span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '13px', color: '#1E1B4B' }}>
                  {s.topic}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate form (AI) */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 16px' }}>
          Generate Lesson Plan with AI
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

        {generatedContent && (
          <div style={{ marginTop: '16px' }}>
            <div
              className="markdown-body"
              style={{
                background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px',
                padding: '20px', fontFamily: 'Inter, sans-serif', fontSize: '13.5px',
                color: '#334155', maxHeight: '450px', overflowY: 'auto', marginBottom: '12px', lineHeight: 1.7,
              }}
            >
              <ReactMarkdown>{generatedContent}</ReactMarkdown>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: '#059669', color: '#fff', border: 'none', borderRadius: '8px',
                padding: '10px 18px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px',
              }}
            >
              {saving ? 'Saving...' : 'Save as Lesson Plan'}
            </button>
          </div>
        )}
      </div>

      {/* Manual entry form */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PenLine size={16} color="#059669" />
          Add Lesson Plan Manually
        </h3>

        {manualMsg && (
          <p style={{ color: manualMsg.includes('saved') ? '#059669' : '#DC2626', fontSize: '13px', marginBottom: '12px' }}>
            {manualMsg}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Topic</label>
            <input value={manualTopic} onChange={(e) => setManualTopic(e.target.value)} placeholder="e.g. REST APIs" style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Content</label>
          <textarea
            value={manualContent}
            onChange={(e) => setManualContent(e.target.value)}
            placeholder="Write out the lesson plan content here — supports Markdown formatting..."
            rows={8}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'Inter, sans-serif' }}
          />
        </div>

        <button
          onClick={handleManualSave}
          disabled={manualSaving}
          style={{
            background: '#059669', color: '#fff', border: 'none', borderRadius: '8px',
            padding: '10px 18px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px',
            opacity: manualSaving ? 0.7 : 1,
          }}
        >
          {manualSaving ? 'Saving...' : 'Save Lesson Plan'}
        </button>
      </div>

      {/* Saved lesson plans list */}
      <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', marginBottom: '12px' }}>
        Saved Lesson Plans
      </h3>
      {loading ? (
        <div style={emptyStateStyle}>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#45464D', margin: 0 }}>Loading...</p>
        </div>
      ) : lessonPlans.length === 0 ? (
        <div style={emptyStateStyle}>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#45464D', margin: 0 }}>No lesson plans saved yet for this batch.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {lessonPlans.map((lp) => {
            const isExpanded = expandedId === lp.id;
            return (
              <div key={lp.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : lp.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <BookOpen size={16} color="#0051D5" style={{ flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1E1B4B' }}>
                    {lp.topic}
                  </span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', marginLeft: 'auto' }}>
                    {lp.date}
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
                    <ReactMarkdown>{lp.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
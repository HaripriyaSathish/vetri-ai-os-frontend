import { useState } from 'react';
import { Mail, Copy, Check, Image, FileText, Link2, ShieldCheck, Clock } from 'lucide-react';
import SubmitAssignmentModal from './SubmitAssignmentModal';

const CATEGORY_LABEL = { task: 'Daily Task', mini_project: 'Mini Project', main_project: 'Main Project', seminar: 'Seminar' };

function renderInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-${i}`} style={{ color: '#1E1B4B' }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={`${keyPrefix}-${i}`} style={{ background: '#F1F5F9', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px' }}>
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

function normalize(raw) {
  let t = raw.trim();
  t = t.replace(/\s*-{2,}\s*/g, '\n\n');
  t = t.replace(/#{1,4}\s+/g, '\n\n');
  t = t.replace(/(?<!\d\.\s)\*\*([A-Z][A-Za-z &]{2,30}:)\*\*\s*/g, '\n\n$1 ');
  t = t.replace(/(?:^|\s)(\d{1,2}\.)\s+(?=[A-Z*`])/g, '\n$1 ');
  t = t.replace(/\n{3,}/g, '\n\n');
  return t.trim();
}

function renderLine(line, key) {
  const listMatch = line.match(/^(\d{1,2})\.\s+(.*)$/s);
  if (listMatch) {
    const [, number, rest] = listMatch;
    return (
      <div key={key} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <span style={{
          flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', background: '#ECFDF5',
          color: '#0F7A37', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px',
        }}>
          {number}
        </span>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', lineHeight: 1.6, margin: 0, flex: 1 }}>
          {renderInline(rest, key)}
        </p>
      </div>
    );
  }

  const labelMatch = line.match(/^([A-Za-z][A-Za-z0-9 &]{1,40}:)\s*(.*)$/s);
  if (labelMatch) {
    const [, label, rest] = labelMatch;
    return (
      <p key={key} style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', lineHeight: 1.6, margin: 0 }}>
        <strong style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#1E1B4B' }}>{label}</strong>
        {rest ? ' ' + rest : ''}
      </p>
    );
  }

  return (
    <p key={key} style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#45464D', lineHeight: 1.6, margin: 0 }}>
      {renderInline(line, key)}
    </p>
  );
}

function FormattedTaskContent({ text }) {
  if (!text) return null;
  const normalized = normalize(text);
  const blocks = normalized.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {blocks.map((block, bIdx) => {
        const lines = block.split(/\n/).map((l) => l.trim()).filter(Boolean);
        return (
          <div key={bIdx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {lines.map((line, lIdx) => renderLine(line, `${bIdx}-${lIdx}`))}
          </div>
        );
      })}
    </div>
  );
}

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', borderRadius: '8px', padding: '10px 14px' }}>
      <div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', margin: 0 }}>{label}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#1E1B4B', margin: '2px 0 0', wordBreak: 'break-all' }}>{value}</p>
      </div>
      <button
        onClick={copy}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#16A34A', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, flexShrink: 0, marginLeft: '12px' }}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

export default function AssignmentCard({ assignment, onSubmitted }) {
  const [showModal, setShowModal] = useState(false);
  const submission = assignment.my_submission;
  const isOverdue = !submission && new Date(assignment.due_date) < new Date();
  const email = assignment.trainer_submission_email;
  const subject = `Submission of ${assignment.title}`;

  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, background: '#ECFDF5', color: '#0F7A37', fontFamily: 'Inter, sans-serif' }}>
            {CATEGORY_LABEL[assignment.category] || assignment.category}
          </span>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 700, color: '#1E1B4B', margin: '10px 0 12px' }}>{assignment.title}</h3>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: 0 }}>Due</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: isOverdue ? '#DC2626' : '#1E1B4B', margin: '2px 0 0' }}>{assignment.due_date}</p>
        </div>
      </div>

      <div style={{ marginTop: '4px' }}>
        <FormattedTaskContent text={assignment.description} />
      </div>

      {submission ? (
        <div style={{ marginTop: '16px', borderRadius: '10px', background: '#ECFDF5', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#0F7A37', margin: 0 }}>
              Submitted {submission.submitted_at} {submission.on_time ? '' : '(late)'}
            </p>
            {submission.verified ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#DCFCE7', color: '#059669', padding: '3px 10px', borderRadius: '999px', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600 }}>
                <ShieldCheck size={12} /> Verified
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FEF3C7', color: '#D97706', padding: '3px 10px', borderRadius: '999px', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600 }}>
                <Clock size={12} /> Pending Verification
              </span>
            )}
          </div>
          {submission.score != null && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#1E1B4B', margin: '6px 0 0' }}>Score: {submission.score} / 100</p>}
          {submission.remarks && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: '4px 0 0' }}>{submission.remarks}</p>}
        </div>
      ) : (
        <div style={{ marginTop: '16px', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Mail size={16} color="#16A34A" />
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, color: '#1E1B4B', margin: 0 }}>Submit Assignment</p>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: '0 0 12px', lineHeight: 1.6 }}>
            Attach a screenshot <Image size={12} style={{ verticalAlign: '-1px' }} />, a document <FileText size={12} style={{ verticalAlign: '-1px' }} />, or paste a link <Link2 size={12} style={{ verticalAlign: '-1px' }} /> — it'll be emailed to your trainer and logged against this task automatically.
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px' }}
          >
            <Mail size={14} /> Submit Now
          </button>

          {showModal && (
            <SubmitAssignmentModal
              assignment={assignment}
              onClose={() => setShowModal(false)}
              onSubmitted={onSubmitted}
            />
          )}
        </div>
      )}
    </div>
  );
}
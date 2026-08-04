import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import { getMessages, sendMessage, markMessagesRead } from '../api';

const CATEGORIES = [
  { key: 'doubt', label: 'Doubt' },
  { key: 'leave', label: 'Leave Request' },
  { key: 'general', label: 'General' },
];

function useDictation(onResult) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const toggle = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input isn\'t supported in this browser — try Chrome or Edge.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map((r) => r[0].transcript).join(' ');
      onResult(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return { listening, toggle };
}

function initials(name) {
  return (name || 'T').trim().charAt(0).toUpperCase();
}

export default function AskTrainer() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [category, setCategory] = useState('doubt');
  const [leaveFrom, setLeaveFrom] = useState('');
  const [leaveTo, setLeaveTo] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const { listening, toggle } = useDictation((transcript) =>
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript))
  );

  const load = () =>
    getMessages().then((r) => setMessages(r.data)).then(markMessagesRead).catch(() => {});

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const trainerName = messages.find((m) => !m.is_mine)?.sender_name || 'Your Trainer';

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const payload = { content: text, category };
      if (category === 'leave') {
        payload.leave_from_date = leaveFrom || null;
        payload.leave_to_date = leaveTo || null;
      }
      await sendMessage(payload);
      setText('');
      setLeaveFrom('');
      setLeaveTo('');
      load();
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '900px' }}>
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', margin: 0 }}>
          Chatting with <span style={{ fontWeight: 600, color: '#1E1B4B' }}>{trainerName}</span> — only you two can see this thread.
        </p>
        <button
          onClick={toggle}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: listening ? '#FEF2F2' : '#ECFDF5',
            color: listening ? '#DC2626' : '#0F7A37',
            fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
          }}
        >
          {listening ? <MicOff size={16} /> : <Mic size={16} />}
          {listening ? 'Listening…' : 'Voice Assistant'}
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {messages.map((m) => (
          <div key={m.id} style={{ display: 'flex', gap: '10px', flexDirection: m.is_mine ? 'row-reverse' : 'row' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700,
              background: m.is_mine ? '#16A34A' : '#ECFDF5',
              color: m.is_mine ? '#fff' : '#0F7A37',
            }}>
              {m.is_mine ? 'Y' : initials(m.sender_name)}
            </div>
            <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: m.is_mine ? 'flex-end' : 'flex-start' }}>
              {m.category && m.category !== 'general' && (
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {m.category === 'leave' ? 'Leave Request' : 'Doubt'}
                </span>
              )}
              <div style={{
                borderRadius: '14px', padding: '10px 16px', fontFamily: 'Inter, sans-serif', fontSize: '14px',
                background: m.is_mine ? '#16A34A' : '#F8FAFC',
                color: m.is_mine ? '#fff' : '#1E1B4B',
                borderTopRightRadius: m.is_mine ? '4px' : '14px',
                borderTopLeftRadius: m.is_mine ? '14px' : '4px',
              }}>
                {m.content}
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#76777D', marginTop: '4px' }}>
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', textAlign: 'center', padding: '40px 0' }}>
            No messages yet — say hello, ask a doubt, or request leave below.
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '16px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c.key}
              onClick={() => setCategory(c.key)}
              style={{
                padding: '6px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600,
                background: category === c.key ? '#16A34A' : '#F8FAFC',
                color: category === c.key ? '#fff' : '#76777D',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {category === 'leave' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="date" value={leaveFrom} onChange={(e) => setLeaveFrom(e.target.value)}
              style={{ flex: 1, borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: '14px' }} />
            <input type="date" value={leaveTo} onChange={(e) => setLeaveTo(e.target.value)}
              style={{ flex: 1, borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: '14px' }} />
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button" onClick={toggle}
            style={{
              width: '40px', height: '40px', borderRadius: '50%', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: listening ? '#FEF2F2' : '#F8FAFC',
              color: listening ? '#DC2626' : '#76777D',
            }}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={listening ? 'Listening…' : 'Message your trainer…'}
            style={{ flex: 1, borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
          />
          <button
            type="submit" disabled={sending}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: '#16A34A', padding: '10px 20px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', color: '#fff',
              opacity: sending ? 0.6 : 1,
            }}
          >
            <Send size={15} />
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
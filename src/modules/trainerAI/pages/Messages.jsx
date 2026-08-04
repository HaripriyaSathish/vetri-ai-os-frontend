import { useState, useEffect } from 'react';
import DashboardShell from '../../../core/layout/DashboardShell';
import { useAuth } from '../../../core/auth/AuthContext';
import { getStudents, getMessages, sendMessage, markMessagesRead } from '../api';
import { Send, MessageCircle, Users, X } from 'lucide-react';

function displayName(s) {
  const full = [s.first_name, s.last_name].filter(Boolean).join(' ').trim();
  return full || s.username;
}
function senderDisplayName(m) {
  const full = [m.sender_first_name, m.sender_last_name].filter(Boolean).join(' ').trim();
  return full || m.sender_username;
}

export default function Messages() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Bulk-send mode state
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkSelected, setBulkSelected] = useState([]);
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');

  useEffect(() => {
    getStudents().then((res) => {
      setStudents(res.data);
      if (res.data.length > 0) setSelectedStudent(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedStudent && !bulkMode) {
      loadMessages();
      markMessagesRead(selectedStudent);
    }
  }, [selectedStudent, bulkMode]);

  const loadMessages = async () => {
    const res = await getMessages(selectedStudent);
    setMessages(res.data);
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await sendMessage({ batch: 1, recipient: selectedStudent, content: newMessage });
      setNewMessage('');
      loadMessages();
    } finally {
      setSending(false);
    }
  };

  const toggleBulkMode = () => {
    setBulkMode((prev) => !prev);
    setBulkSelected([]);
    setBulkMessage('');
    setBulkStatus('');
  };

  const toggleBulkStudent = (id) => {
    setBulkSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setBulkSelected((prev) => prev.length === students.length ? [] : students.map((s) => s.id));
  };

  const handleBulkSend = async () => {
    if (!bulkMessage.trim()) {
      setBulkStatus('Type a message first.');
      return;
    }
    if (bulkSelected.length === 0) {
      setBulkStatus('Select at least one student.');
      return;
    }
    setBulkSending(true);
    setBulkStatus('');
    let successCount = 0;
    for (const studentId of bulkSelected) {
      try {
        await sendMessage({ batch: 1, recipient: studentId, content: bulkMessage });
        successCount += 1;
      } catch (err) {
        // continue sending to the rest even if one fails
      }
    }
    setBulkSending(false);
    setBulkStatus(`Sent to ${successCount} of ${bulkSelected.length} student(s).`);
    setBulkMessage('');
  };

  const labelStyle = {
    fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#1E1B4B', display: 'block', marginBottom: '6px',
  };
  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD', borderRadius: '8px',
    fontFamily: 'Inter, sans-serif', fontSize: '14px', boxSizing: 'border-box',
  };

  return (
    <DashboardShell title="Messages">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <button
          onClick={toggleBulkMode}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: bulkMode ? '#0051D5' : '#fff', color: bulkMode ? '#fff' : '#0051D5',
            border: '1px solid #0051D5', borderRadius: '8px',
            padding: '8px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
          }}
        >
          {bulkMode ? <X size={14} /> : <Users size={14} />}
          {bulkMode ? 'Exit Bulk Send' : 'Select Multiple Students'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', height: 'calc(100vh - 220px)' }}>
        {/* Student list */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Students</label>
            {bulkMode && (
              <button
                onClick={toggleSelectAll}
                style={{ background: 'none', border: 'none', color: '#0051D5', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600 }}
              >
                {bulkSelected.length === students.length ? 'Unselect All' : 'Select All'}
              </button>
            )}
          </div>

          {bulkMode && bulkSelected.length > 0 && (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#0051D5', fontWeight: 600, margin: '0 0 8px' }}>
              {bulkSelected.length} selected
            </p>
          )}

          {students.map((s) => (
            bulkMode ? (
              <label
                key={s.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '8px',
                  background: bulkSelected.includes(s.id) ? '#EFF4FF' : 'transparent', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#1E1B4B', marginBottom: '4px',
                }}
              >
                <input type="checkbox" checked={bulkSelected.includes(s.id)} onChange={() => toggleBulkStudent(s.id)} />
                {displayName(s)}
              </label>
            ) : (
              <button
                key={s.id}
                onClick={() => setSelectedStudent(s.id)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '8px', border: 'none',
                  background: selectedStudent === s.id ? '#EFF4FF' : 'transparent', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#1E1B4B', marginBottom: '4px',
                }}
              >
                {displayName(s)}
              </button>
            )
          ))}
        </div>

        {/* Right panel: bulk compose OR single chat thread */}
        {bulkMode ? (
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', flexDirection: 'column', padding: '24px' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={16} color="#0051D5" /> Send Same Message to Selected Students
            </h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 20px' }}>
              Pick students from the list on the left, write your message once, and it'll be sent individually to each of them.
            </p>

            <label style={labelStyle}>Message</label>
            <textarea
              value={bulkMessage}
              onChange={(e) => setBulkMessage(e.target.value)}
              placeholder="Type your message..."
              rows={8}
              style={{ ...inputStyle, resize: 'vertical', marginBottom: '16px' }}
            />

            <button
              onClick={handleBulkSend}
              disabled={bulkSending}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px',
                padding: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px',
                opacity: bulkSending ? 0.7 : 1, width: '220px',
              }}
            >
              <Send size={16} /> {bulkSending ? 'Sending...' : `Send to ${bulkSelected.length} Student(s)`}
            </button>

            {bulkStatus && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: bulkStatus.includes('Select') || bulkStatus.includes('Type') ? '#DC2626' : '#059669', marginTop: '14px' }}>
                {bulkStatus}
              </p>
            )}
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {messages.length === 0 ? (
                <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D', fontSize: '13px' }}>No messages yet.</p>
              ) : (
                messages.map((m) => {
                  const isMine = m.sender === user?.id;
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start',
                        marginBottom: '10px',
                      }}
                    >
                      <div style={{ maxWidth: '70%' }}>
                        {!isMine && (
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', margin: '0 0 3px', fontWeight: 600 }}>
                            {senderDisplayName(m)}
                          </p>
                        )}
                        <div
                          style={{
                            padding: '10px 14px', borderRadius: '12px',
                            background: isMine ? '#0051D5' : '#F8FAFC',
                            color: isMine ? '#fff' : '#1E1B4B',
                          }}
                        >
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', margin: 0 }}>{m.content}</p>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', margin: '4px 0 0', opacity: 0.7 }}>
                            {new Date(m.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', padding: '16px', borderTop: '1px solid #F1F5F9' }}>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                style={inputStyle}
              />
              <button
                onClick={handleSend}
                disabled={sending}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px',
                  padding: '10px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
                }}
              >
                <Send size={14} /> Send
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
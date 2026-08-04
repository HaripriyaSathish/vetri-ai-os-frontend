import { MessageCircle } from 'lucide-react';
import { openWhatsApp } from '../utils/whatsappUtils';

export default function WhatsAppButton({ phoneNumber, message, label = 'Send via WhatsApp' }) {
  return (
    <button
      onClick={() => openWhatsApp(phoneNumber, message)}
      disabled={!phoneNumber}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px',
        padding: '9px 16px', cursor: phoneNumber ? 'pointer' : 'not-allowed',
        fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
        opacity: phoneNumber ? 1 : 0.5,
      }}
    >
      <MessageCircle size={16} /> {label}
    </button>
  );
}
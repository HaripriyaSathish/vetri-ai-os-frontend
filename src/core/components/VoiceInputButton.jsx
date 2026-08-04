import { Mic, MicOff } from 'lucide-react';
import { useVoiceInput } from '../hooks/useVoiceInput';

export default function VoiceInputButton({ onResult }) {
  const { listening, supported, startListening, stopListening } = useVoiceInput(onResult);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={listening ? stopListening : startListening}
      title={listening ? 'Stop listening' : 'Speak instead of typing'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '38px', height: '38px', borderRadius: '8px', border: '1px solid #C6C6CD',
        background: listening ? '#FEE2E2' : '#F8FAFC', cursor: 'pointer', flexShrink: 0,
      }}
    >
      {listening ? <MicOff size={16} color="#DC2626" /> : <Mic size={16} color="#0051D5" />}
    </button>
  );
}
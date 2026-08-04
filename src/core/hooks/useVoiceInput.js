import { useState, useRef, useCallback } from 'react';

export function useVoiceInput(onResult) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(
    () => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  );
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    if (!supported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [supported, onResult]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { listening, supported, startListening, stopListening };
}
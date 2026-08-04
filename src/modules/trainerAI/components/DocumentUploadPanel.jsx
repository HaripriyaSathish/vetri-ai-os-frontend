import { useState } from 'react';
import { FileText, Upload } from 'lucide-react';
import { uploadUserDocument } from '../api';

export default function DocumentUploadPanel({ userId, documents, onUploaded }) {
  const [uploading, setUploading] = useState(null);

  const handleUpload = async (docType, file) => {
    if (!file) return;
    setUploading(docType);
    try {
      await uploadUserDocument(userId, docType, file);
      onUploaded?.();
    } finally {
      setUploading(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {documents.map(({ key, label, url }) => (
        <div key={key} style={{ background: '#F8FAFC', borderRadius: '8px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} color="#0051D5" />
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#1E1B4B', margin: 0 }}>{label}</p>
              {url ? (
                <a href={url} target="_blank" rel="noreferrer" style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#059669' }}>
                  View uploaded PDF
                </a>
              ) : (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', margin: 0 }}>Not uploaded yet</p>
              )}
            </div>
          </div>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '6px', background: '#0051D5', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px',
          }}>
            <Upload size={13} /> {uploading === key ? 'Uploading...' : url ? 'Replace' : 'Upload PDF'}
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleUpload(key, e.target.files[0])}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
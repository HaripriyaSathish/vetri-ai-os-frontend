export default function Footer() {
  return (
    <footer
      style={{
        background: 'rgba(255,255,255,0.92)',
        borderTop: '1px solid #E2E8F0',
        padding: '20px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', textAlign: 'center', margin: 0 }}>
        © 2026 Vetri AI-OS. All rights reserved.
      </p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', textAlign: 'center', margin: 0 }}>
        Powered by Vetri Technology Solutions & Vetri IT Systems.
      </p>
    </footer>
  );
}
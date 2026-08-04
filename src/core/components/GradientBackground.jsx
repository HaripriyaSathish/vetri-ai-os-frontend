import Footer from '../layout/Footer';
import authBg from '../../assets/auth-bg.webp';

export default function GradientBackground({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `linear-gradient(135deg, rgba(11,15,46,0.75) 0%, rgba(30,27,75,0.75) 40%, rgba(45,27,105,0.8) 70%, rgba(11,15,46,0.8) 100%), url(${authBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        {children}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <FooterLight />
      </div>
    </div>
  );
}

function FooterLight() {
  return (
    <footer style={{ padding: '20px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.65)', textAlign: 'center', margin: 0 }}>
        © 2026 Vetri AI-OS. All rights reserved.
      </p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.45)', textAlign: 'center', margin: 0 }}>
        Powered by Vetri Technology Solutions & Vetri IT Systems.
      </p>
    </footer>
  );
}
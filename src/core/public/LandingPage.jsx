import { useNavigate } from 'react-router-dom';
import { Building2, GraduationCap, ClipboardCheck, MessageSquareText, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: GraduationCap,
      title: 'Student AI',
      desc: 'Track attendance, submit assignments, view daily tasks, and stay in touch with your trainer — all in one place.',
      color: '#16A34A',
    },
    {
      icon: ClipboardCheck,
      title: 'Trainer AI',
      desc: 'Manage batches, lesson plans, attendance, mock interviews, and student progress with AI-assisted tools.',
      color: '#0051D5',
    },
    {
      icon: MessageSquareText,
      title: 'Admissions & Payments',
      desc: 'Handle enquiries, payment plans, batch grouping, and welcome kits end-to-end for the business team.',
      color: '#7C3AED',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#fff', borderBottom: '1px solid #E2E8F0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#0051D5', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={20} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '19px', color: '#1E1B4B' }}>
            Vetri AI-OS
          </span>
        </div>
        <button
          onClick={() => navigate('/login')}
          style={{
            background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px',
            padding: '10px 22px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          Login <ArrowRight size={15} />
        </button>
      </header>

      {/* Hero */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '38px', color: '#1E1B4B', margin: '0 0 16px', maxWidth: '700px', lineHeight: 1.25 }}>
          One Operating System for Vetri Technology Solutions
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#76777D', margin: '0 0 32px', maxWidth: '560px', lineHeight: 1.6 }}>
          Admissions, batches, attendance, assignments, mock interviews, payments, and communication — built for students, trainers, and the business team.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{
            background: '#0051D5', color: '#fff', border: 'none', borderRadius: '10px',
            padding: '14px 32px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '15px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          Login to Continue <ArrowRight size={16} />
        </button>
      </section>

      {/* Feature cards */}
      <section style={{ padding: '0 40px 60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {features.map((f) => (
          <div key={f.title} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '28px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${f.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <f.icon size={22} color={f.color} />
            </div>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '17px', color: '#1E1B4B', margin: '0 0 8px' }}>{f.title}</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#76777D', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #E2E8F0', background: '#fff' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: 0 }}>
          © 2026 Vetri AI-OS. All rights reserved.
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9CA3AF', margin: '4px 0 0' }}>
          Powered by Vetri Technology Solutions & Vetri IT Systems.
        </p>
      </footer>
    </div>
  );
}
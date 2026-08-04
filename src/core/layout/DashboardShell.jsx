import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';

export default function DashboardShell({ title, children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
          background: '#F8FAFC',
        }}
      >
        <Topbar title={title} />
        <main style={{ flex: 1, padding: '32px' }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
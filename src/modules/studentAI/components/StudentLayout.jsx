import StudentSidebar from './StudentSidebar';
import StudentTopbar from './StudentTopbar';
import StudentFooter from './StudentFooter';

export default function StudentLayout({ title, children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <StudentSidebar />
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
        <StudentTopbar title={title} />
        <main style={{ flex: 1, padding: '32px' }}>
          {children}
        </main>
        <StudentFooter />
      </div>
    </div>
  );
}
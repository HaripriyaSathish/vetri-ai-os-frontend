import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardShell from '../../../core/layout/DashboardShell';
import { useAuth } from '../../../core/auth/AuthContext';
import {
  getBatchDetail, getBatchStudents, getBatchTimeline, updateBatch,
  bulkEnrollStudents, getStudents, enrollStudent, getBatchEnrollmentStatus,
} from '../api';
import { Calendar, Users, BookOpen, CheckCircle2, Clock, ArrowLeft, Save, AlertCircle, Upload, FileDown, UserPlus, UserX } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';

function trainerDisplayName(b) {
  const full = [b.trainer_first_name, b.trainer_last_name].filter(Boolean).join(' ').trim();
  return full || b.trainer_username;
}

function studentDisplayName(s) {
  const full = [s.first_name, s.last_name].filter(Boolean).join(' ').trim();
  return full || s.username;
}

export default function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOrgViewer = user?.role === 'admin' || user?.role === 'management';
  const canManageEnrollment = user?.role === 'management';

  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSyllabus, setEditingSyllabus] = useState(false);
  const [syllabusInput, setSyllabusInput] = useState('');
  const [saving, setSaving] = useState(false);

  const [uploadingStudents, setUploadingStudents] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileInputRef = useRef(null);

  // Enroll an existing, already-registered student — business team only
  const [allStudents, setAllStudents] = useState([]);
  const [pickStudentId, setPickStudentId] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState('');

  // Dropout stats — visible to everyone
  const [totalEverEnrolled, setTotalEverEnrolled] = useState(0);
  const [droppedCount, setDroppedCount] = useState(0);

  useEffect(() => {
    loadAll();
    if (canManageEnrollment) loadAllStudents();
  }, [id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [batchRes, studentsRes, timelineRes, enrollmentRes] = await Promise.all([
        getBatchDetail(id),
        getBatchStudents(id),
        getBatchTimeline(id),
        getBatchEnrollmentStatus(id),
      ]);
      setBatch(batchRes.data);
      setSyllabusInput(batchRes.data.planned_topics || '');
      setStudents(studentsRes.data);
      setTimeline(timelineRes.data);
      setTotalEverEnrolled(enrollmentRes.data.length);
      setDroppedCount(enrollmentRes.data.filter((s) => s.status === 'discontinued').length);
    } finally {
      setLoading(false);
    }
  };

  const loadAllStudents = async () => {
    try {
      const res = await getStudents();
      setAllStudents(res.data);
    } catch (err) {
      setAllStudents([]);
    }
  };

  const handleSaveSyllabus = async () => {
    setSaving(true);
    try {
      const res = await updateBatch(id, { planned_topics: syllabusInput });
      setBatch(res.data);
      setEditingSyllabus(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    const newStatus = batch.status === 'completed' ? 'ongoing' : 'completed';
    const res = await updateBatch(id, { status: newStatus });
    setBatch(res.data);
  };

  const handleDownloadStudentTemplate = () => {
    const rows = [
      { Username: 'student2', Email: 'ananya.krishnan@vetritech.com', Password: 'Vetri@2026' },
      { Username: 'student3', Email: 'rahulverma@vetritech.com', Password: 'Vetri@2026' },
    ];
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 15 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'bulk_student_enrollment_template.xlsx');
  };

  const handleStudentFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingStudents(true);
    setUploadMsg('');
    try {
      const res = await bulkEnrollStudents(id, file);
      setUploadMsg(
        `Created ${res.data.created.length} new account(s), enrolled ${res.data.enrolled_count} student(s).` +
        (res.data.errors.length > 0 ? ` ${res.data.errors.length} issue(s): ${res.data.errors.join(' | ')}` : '')
      );
      loadAll();
    } catch (err) {
      setUploadMsg('Failed to upload student list. Check the file format.');
    } finally {
      setUploadingStudents(false);
      e.target.value = '';
    }
  };

  const notYetEnrolled = useMemo(() => {
    const enrolledIds = new Set(students.map((s) => s.id));
    return allStudents.filter((s) => !enrolledIds.has(s.id));
  }, [allStudents, students]);

  const handleEnrollExisting = async () => {
    if (!pickStudentId) {
      setEnrollMsg('Pick a student first.');
      return;
    }
    setEnrolling(true);
    setEnrollMsg('');
    try {
      const res = await enrollStudent({ batch_id: id, student_id: pickStudentId });
      setEnrollMsg(res.data.detail || 'Enrolled!');
      setPickStudentId('');
      loadAll();
      loadAllStudents();
    } catch (err) {
      setEnrollMsg(err.response?.data?.detail || 'Failed to enroll student.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading || !batch) {
    return (
      <DashboardShell title="Batch Details">
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>Loading...</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title={batch.name}>
      <button
        onClick={() => navigate('/trainer/batches')}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent',
          border: 'none', cursor: 'pointer', color: '#76777D', fontFamily: 'Inter, sans-serif',
          fontSize: '13px', marginBottom: '20px', padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Back to Batches
      </button>

      {/* Overview card */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#1E1B4B', margin: '0 0 6px' }}>
              {batch.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="#76777D" />
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: 0 }}>
                Started {batch.start_date} {batch.end_date ? `· Ends ${batch.end_date}` : '· No end date set'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleStatus}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
              background: batch.status === 'completed' ? '#DCFCE7' : '#FEF3C7',
              color: batch.status === 'completed' ? '#059669' : '#D97706',
            }}
          >
            {batch.status === 'completed' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
            {batch.status === 'completed' ? 'Completed' : 'Ongoing'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 4px' }}>Trainer</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: 700, color: '#7C3AED', margin: 0 }}>
              {trainerDisplayName(batch)}
            </p>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 4px' }}>Students Enrolled</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 700, color: '#0051D5', margin: 0 }}>
              {students.length} <span style={{ fontSize: '14px', fontWeight: 500, color: '#76777D' }}>/ {batch.max_students}</span>
            </p>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 4px' }}>Topics Covered</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 700, color: '#059669', margin: 0 }}>
              {batch.topics_covered.length}
            </p>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 4px' }}>Topics Pending</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 700, color: '#D97706', margin: 0 }}>
              {batch.pending_topics.length}
            </p>
          </div>
          <div style={{ background: '#FEF2F2', borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <UserX size={12} color="#DC2626" /> Dropped Out
            </p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 700, color: '#DC2626', margin: 0 }}>
              {droppedCount} <span style={{ fontSize: '14px', fontWeight: 500, color: '#76777D' }}>/ {totalEverEnrolled}</span>
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Syllabus / planned topics */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1E1B4B', margin: 0 }}>
              Syllabus (Planned Topics)
            </h3>
            {!editingSyllabus && (
              <button
                onClick={() => setEditingSyllabus(true)}
                style={{ background: 'transparent', border: 'none', color: '#0051D5', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600 }}
              >
                Edit
              </button>
            )}
          </div>

          {editingSyllabus ? (
            <div>
              <textarea
                value={syllabusInput}
                onChange={(e) => setSyllabusInput(e.target.value)}
                placeholder="e.g. OOPs Concepts, REST APIs, Collections, Multithreading, Spring Boot Basics"
                rows={4}
                style={{
                  width: '100%', padding: '10px 12px', border: '1px solid #C6C6CD', borderRadius: '8px',
                  fontFamily: 'Inter, sans-serif', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical', marginBottom: '10px',
                }}
              />
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', margin: '0 0 10px' }}>
                Separate each topic with a comma.
              </p>
              <button
                onClick={handleSaveSyllabus}
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: '#0051D5', color: '#fff', border: 'none', borderRadius: '6px',
                  padding: '8px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
                }}
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save Syllabus'}
              </button>
            </div>
          ) : !batch.planned_topics ? (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: 0 }}>
              No syllabus set yet. Click Edit to add planned topics for this batch.
            </p>
          ) : (
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: '#059669', margin: '0 0 6px' }}>
                Covered ({batch.topics_covered.length})
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                {batch.topics_covered.length === 0 ? (
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D' }}>None yet</span>
                ) : batch.topics_covered.map((t, i) => (
                  <span key={i} style={{ background: '#DCFCE7', color: '#059669', borderRadius: '6px', padding: '3px 8px', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 500 }}>
                    {t}
                  </span>
                ))}
              </div>

              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: '#D97706', margin: '0 0 6px' }}>
                Pending ({batch.pending_topics.length})
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {batch.pending_topics.length === 0 ? (
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D' }}>All planned topics covered 🎉</span>
                ) : batch.pending_topics.map((t, i) => (
                  <span key={i} style={{ background: '#FEF3C7', color: '#D97706', borderRadius: '6px', padding: '3px 8px', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 500 }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Students list */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1E1B4B', margin: '0 0 12px' }}>
            Enrolled Students
          </h3>

          {/* Enroll an existing, already-registered student — business team only */}
          {canManageEnrollment && (
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#1E1B4B', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserPlus size={13} color="#0051D5" /> Enroll an existing student
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={pickStudentId}
                  onChange={(e) => setPickStudentId(e.target.value)}
                  style={{
                    flex: 1, padding: '7px 10px', border: '1px solid #C6C6CD', borderRadius: '6px',
                    fontFamily: 'Inter, sans-serif', fontSize: '12.5px', background: '#fff',
                  }}
                >
                  <option value="">
                    {notYetEnrolled.length === 0 ? 'No other registered students available' : 'Select a student...'}
                  </option>
                  {notYetEnrolled.map((s) => (
                    <option key={s.id} value={s.id}>{studentDisplayName(s)} ({s.username})</option>
                  ))}
                </select>
                <button
                  onClick={handleEnrollExisting}
                  disabled={enrolling || !pickStudentId}
                  style={{
                    background: '#0051D5', color: '#fff', border: 'none', borderRadius: '6px',
                    padding: '7px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px',
                    whiteSpace: 'nowrap', opacity: (enrolling || !pickStudentId) ? 0.6 : 1,
                  }}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll'}
                </button>
              </div>
              {enrollMsg && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: enrollMsg.includes('Enrolled') || enrollMsg.includes('enrolled') ? '#059669' : '#DC2626', margin: '8px 0 0' }}>
                  {enrollMsg}
                </p>
              )}
            </div>
          )}

          {canManageEnrollment && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button
                onClick={handleDownloadStudentTemplate}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: '#fff', color: '#0051D5', border: '1px solid #0051D5', borderRadius: '6px',
                  padding: '7px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px',
                }}
              >
                <FileDown size={14} /> Template
              </button>
              <button
                onClick={() => fileInputRef.current.click()}
                disabled={uploadingStudents}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: '#059669', color: '#fff', border: 'none', borderRadius: '6px',
                  padding: '7px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px',
                }}
              >
                <Upload size={14} /> {uploadingStudents ? 'Uploading...' : 'Upload Students'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleStudentFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {uploadMsg && (
            <p style={{ color: uploadMsg.includes('Created') ? '#059669' : '#DC2626', fontSize: '12px', marginBottom: '12px' }}>
              {uploadMsg}
            </p>
          )}

         {students.length === 0 ? (
  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: 0 }}>
    No students enrolled yet.{canManageEnrollment ? ' Use the options above to add some.' : ''}
  </p>
) : (
  <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
    {students.map((s) => (
      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <Users size={14} color="#0051D5" style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#1E1B4B', fontWeight: 500, margin: 0 }}>
              {studentDisplayName(s)} <span style={{ fontWeight: 400, color: '#76777D' }}>({s.username})</span>
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {s.official_email || s.email || 'No email on file'}
            </p>
          </div>
        </div>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', flexShrink: 0, marginLeft: '10px' }}>
          {s.attendance_percentage !== null ? `${s.attendance_percentage}% attendance` : 'No records'}
        </span>
      </div>
    ))}
  </div>
)}
        </div>
      </div>

      {/* Day-by-day timeline */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1E1B4B', margin: '0 0 16px' }}>
          Day-by-Day Topic Timeline
        </h3>
        {timeline.length === 0 ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D', margin: 0 }}>
            No lesson plans recorded yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {timeline.map((entry, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0',
                  borderBottom: i < timeline.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}
              >
                <div style={{ width: '90px', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D' }}>
                    {entry.date}
                  </span>
                </div>
                <BookOpen size={14} color="#0051D5" style={{ flexShrink: 0 }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13.5px', color: '#1E1B4B', fontWeight: 500 }}>
                  {entry.topic}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {batch.end_date && batch.status !== 'completed' && new Date(batch.end_date) < new Date() && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '10px', padding: '14px 18px', marginTop: '20px' }}>
          <AlertCircle size={18} color="#D97706" />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#92400E', margin: 0 }}>
            This batch's end date has passed but it's still marked as Ongoing. Consider marking it Completed.
          </p>
        </div>
      )}
    </DashboardShell>
  );
}
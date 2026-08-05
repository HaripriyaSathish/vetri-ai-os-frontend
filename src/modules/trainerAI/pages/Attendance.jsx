import { useState, useEffect } from 'react';
import DashboardShell from '../../../core/layout/DashboardShell';
import { useAuth } from '../../../core/auth/AuthContext';
import { getBatches, getBatchStudents, getAttendance, markAttendance, getTrainingLog, getHolidays, createHoliday, deleteHoliday } from '../api';
import { CheckCircle2, XCircle, Clock, Save, Download, CalendarOff, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present', color: '#059669', icon: CheckCircle2 },
  { value: 'absent', label: 'Absent', color: '#DC2626', icon: XCircle },
  { value: 'late', label: 'Late', color: '#D97706', icon: Clock },
];

function displayName(student) {
  const full = [student.first_name, student.last_name].filter(Boolean).join(' ').trim();
  return full || student.username;
}
function trainerDisplayName(b) {
  const full = [b.trainer_first_name, b.trainer_last_name].filter(Boolean).join(' ').trim();
  return full || b.trainer_username;
}
export default function Attendance() {
  const { user } = useAuth();
  const canMarkAttendance = user?.role === 'trainer';

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusMap, setStatusMap] = useState({});
  const [existingMap, setExistingMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [downloading, setDownloading] = useState(false);

  // Holidays
  const [showHolidays, setShowHolidays] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayReason, setHolidayReason] = useState('');
  const [holidaySaving, setHolidaySaving] = useState(false);
  const [holidayError, setHolidayError] = useState('');

  useEffect(() => {
    getBatches().then((res) => {
      setBatches(res.data);
      if (res.data.length > 0) setSelectedBatch(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedBatch) return;
    setStudentsLoading(true);
    getBatchStudents(selectedBatch)
      .then((res) => setStudents(res.data))
      .finally(() => setStudentsLoading(false));
    loadHolidays();
  }, [selectedBatch]);

  useEffect(() => {
    if (selectedBatch && date) loadAttendance();
  }, [selectedBatch, date]);

  const loadHolidays = () => {
    if (!selectedBatch) return;
    getHolidays(selectedBatch).then((res) => setHolidays(res.data)).catch(() => setHolidays([]));
  };

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await getAttendance(selectedBatch, date);
      const map = {};
      res.data.forEach((record) => {
        map[record.student] = record.status;
      });
      setExistingMap(map);
      setStatusMap(map);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setStatusMap({ ...statusMap, [studentId]: status });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const toSave = students.filter(
        (s) => statusMap[s.id] && statusMap[s.id] !== existingMap[s.id]
      );
      for (const student of toSave) {
        await markAttendance({
          batch: selectedBatch,
          student: student.id,
          date,
          status: statusMap[student.id],
        });
      }
      setSuccess(`Attendance saved for ${toSave.length} student(s).`);
      loadAttendance();
    } catch (err) {
      setError('Failed to save some attendance records. They may already be marked for this date.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!canMarkAttendance) return;
    setHolidayError('');
    if (!holidayDate) {
      setHolidayError('Pick a date first.');
      return;
    }
    setHolidaySaving(true);
    try {
      await createHoliday({ batch: selectedBatch, date: holidayDate, reason: holidayReason || 'Holiday' });
      setHolidayDate('');
      setHolidayReason('');
      loadHolidays();
    } catch (err) {
      setHolidayError(err.response?.data?.non_field_errors?.[0] || 'Failed to add holiday. It may already exist for this date.');
    } finally {
      setHolidaySaving(false);
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!canMarkAttendance) return;
    try {
      await deleteHoliday(id);
      loadHolidays();
    } catch (err) {
      setHolidayError('Failed to delete holiday.');
    }
  };

  const exportTrainingLog = (rows, filenamePrefix) => {
  const headers = [
    'S.NO', 'DATE', 'TRAINER NAME', 'TRAINEE NAME', 'STATUS',
    'TRAINING MODE', 'COURSE NAME', 'TRAINING TAKEN TIMINGS',
    'PROGRAMMING LANGUAGE', 'TOPICS COVERED',
  ];

  const dataRows = rows.map((r) => [
    r.sno, r.date, r.trainer_name, r.trainee_name, r.status,
    r.training_mode, r.course_name, r.timings, r.programming_language, r.topics_covered,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

  const headerStyle = {
    fill: { fgColor: { rgb: 'FFFF00' } },
    font: { bold: true, sz: 12 },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } },
    },
  };

  const statusColColor = { Present: 'C6EFCE', Absent: 'FFC7CE', Late: 'FFEB9C', 'Not Marked': 'F2F2F2' };

  headers.forEach((_, colIdx) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
    if (worksheet[cellRef]) worksheet[cellRef].s = headerStyle;
  });

  dataRows.forEach((row, rowIdx) => {
    const status = row[4];
    const cellRef = XLSX.utils.encode_cell({ r: rowIdx + 1, c: 4 });
    if (worksheet[cellRef]) {
      const isHoliday = typeof status === 'string' && status.startsWith('Holiday');
      worksheet[cellRef].s = {
        fill: { fgColor: { rgb: isHoliday ? 'D9E2F3' : (statusColColor[status] || 'FFFFFF') } },
        font: { bold: true },
        alignment: { horizontal: 'center' },
      };
    }
  });

  worksheet['!cols'] = [
    { wch: 6 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 18 },
    { wch: 14 }, { wch: 16 }, { wch: 20 }, { wch: 18 }, { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Training Log');
  XLSX.writeFile(workbook, `${filenamePrefix}.xlsx`);
};

  const handleDownloadWeekly = async () => {
    setDownloading(true);
    setError('');
    try {
      const selected = new Date(date);
      const dayOfWeek = selected.getDay();
      const monday = new Date(selected);
      monday.setDate(selected.getDate() - ((dayOfWeek + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const startStr = monday.toISOString().split('T')[0];
      const endStr = sunday.toISOString().split('T')[0];

      const res = await getTrainingLog(selectedBatch, startStr, endStr);
      if (res.data.length === 0) {
        setError('No class days found for this week (Mon–Sat).');
        return;
      }
      const batchName = batches.find((b) => b.id == selectedBatch)?.name || 'Batch';
      exportTrainingLog(res.data, `${batchName.replace(/\s+/g, '_')}_Weekly_${startStr}_to_${endStr}`);
    } catch (err) {
      setError('Failed to generate weekly report.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadMonthlyLog = async () => {
    setDownloading(true);
    setError('');
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const firstDay = `${selectedMonth}-01`;
      const lastDayNum = new Date(year, month, 0).getDate();
      const lastDay = `${selectedMonth}-${String(lastDayNum).padStart(2, '0')}`;

      const res = await getTrainingLog(selectedBatch, firstDay, lastDay);
      if (res.data.length === 0) {
        setError('No class days found for this month.');
        return;
      }
      const batchName = batches.find((b) => b.id == selectedBatch)?.name || 'Batch';
      exportTrainingLog(res.data, `${batchName.replace(/\s+/g, '_')}_Monthly_${selectedMonth}`);
    } catch (err) {
      setError('Failed to generate monthly report.');
    } finally {
      setDownloading(false);
    }
  };

  const labelStyle = {
    fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#1E1B4B', display: 'block', marginBottom: '6px',
  };
  const inputStyle = {
    padding: '9px 12px', border: '1px solid #C6C6CD', borderRadius: '8px',
    fontFamily: 'Inter, sans-serif', fontSize: '14px', boxSizing: 'border-box',
  };

  return (
    <DashboardShell title="Attendance">
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '240px' }}>
            <label style={labelStyle}>Batch</label>
            <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}{b.trainer_username ? ` — ${trainerDisplayName(b)}` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <label style={labelStyle}>Download Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={inputStyle}
            />
          </div>
          <button
            onClick={handleDownloadWeekly}
            disabled={downloading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
              height: '38px',
            }}
          >
            <Download size={16} /> {downloading ? 'Generating...' : 'Download Weekly Log'}
          </button>
          <button
            onClick={handleDownloadMonthlyLog}
            disabled={downloading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#059669', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
              height: '38px',
            }}
          >
            <Download size={16} /> {downloading ? 'Generating...' : 'Download Monthly Log'}
          </button>
          {canMarkAttendance && (
            <button
              onClick={() => setShowHolidays((v) => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#fff', color: '#7C3AED', border: '1px solid #7C3AED', borderRadius: '8px',
                padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
                height: '38px',
              }}
            >
              <CalendarOff size={16} /> {showHolidays ? 'Hide Holidays' : 'Manage Holidays'}
            </button>
          )}
        </div>

        {showHolidays && canMarkAttendance && (
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 12px' }}>
              Mark holidays so weekly/monthly reports show them explicitly instead of silently skipping the day.
            </p>
            {holidayError && <p style={{ color: '#DC2626', fontSize: '12px', marginBottom: '10px' }}>{holidayError}</p>}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'end', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div>
                <label style={labelStyle}>Date</label>
                <input type="date" value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={labelStyle}>Reason</label>
                <input value={holidayReason} onChange={(e) => setHolidayReason(e.target.value)} placeholder="e.g. Independence Day" style={{ ...inputStyle, width: '100%' }} />
              </div>
              <button
                onClick={handleAddHoliday}
                disabled={holidaySaving}
                style={{
                  background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '8px',
                  padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', height: '38px',
                }}
              >
                {holidaySaving ? 'Adding...' : 'Add Holiday'}
              </button>
            </div>
            {holidays.length === 0 ? (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#76777D' }}>No holidays marked for this batch yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {holidays.map((h) => (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', borderRadius: '6px', padding: '8px 12px' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#1E1B4B' }}>
                      {h.date} — {h.reason}
                    </span>
                    <button
                      onClick={() => handleDeleteHoliday(h.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
      {success && <p style={{ color: '#059669', fontSize: '13px', marginBottom: '12px' }}>{success}</p>}

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', padding: '12px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: '#76777D', textTransform: 'uppercase' }}>Student</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: '#76777D', textTransform: 'uppercase' }}>Status</span>
        </div>

        {studentsLoading || loading ? (
          <p style={{ padding: '20px', fontFamily: 'Inter, sans-serif', color: '#76777D' }}>Loading...</p>
        ) : students.length === 0 ? (
          <p style={{ padding: '20px', fontFamily: 'Inter, sans-serif', color: '#76777D' }}>No students enrolled in this batch yet.</p>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', padding: '14px 20px', borderBottom: '1px solid #F1F5F9', alignItems: 'center' }}
            >
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#1E1B4B', margin: 0, fontWeight: 500 }}>
                  {displayName(student)}
                </p>
                {(student.first_name || student.last_name) && (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', margin: '2px 0 0' }}>
                    {student.username}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {STATUS_OPTIONS.map(({ value, label, color, icon: Icon }) => {
                  const isSelected = statusMap[student.id] === value;
                  return (
                    <button
                      key={value}
                      onClick={() => canMarkAttendance && handleStatusChange(student.id, value)}
                      disabled={!canMarkAttendance}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '8px', cursor: canMarkAttendance ? 'pointer' : 'not-allowed',
                        border: `1px solid ${isSelected ? color : '#E2E8F0'}`,
                        background: isSelected ? `${color}15` : '#fff',
                        color: isSelected ? color : '#76777D',
                        fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500,
                        opacity: canMarkAttendance ? 1 : 0.5,
                      }}
                    >
                      <Icon size={14} /> {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {canMarkAttendance && (
        <button
          onClick={handleSaveAll}
          disabled={saving || students.length === 0}
          style={{
            marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px',
            background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px',
            padding: '10px 20px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px',
            opacity: saving ? 0.7 : 1,
          }}
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save Attendance'}
        </button>
      )}
    </DashboardShell>
  );
}
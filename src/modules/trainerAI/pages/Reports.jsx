import { useState, useEffect } from 'react';
import DashboardShell from '../../../core/layout/DashboardShell';
import { useAuth } from '../../../core/auth/AuthContext';
import { getBatches, getReports, generateReport, getZoneReport, getFullZoneReport, deleteReport, emailZoneReport } from '../api';
import { Sparkles, FileBarChart, Loader2, ChevronDown, ChevronUp, Download, Trash2, Mail } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
function trainerDisplayName(b) {
  const full = [b.trainer_first_name, b.trainer_last_name].filter(Boolean).join(' ').trim();
  return full || b.trainer_username;
}
export default function Reports() {
  const { user } = useAuth();
  const canEdit = user?.role === 'trainer';

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [downloadingZone, setDownloadingZone] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // Email-to-students state
  const [emailingPeriod, setEmailingPeriod] = useState(null); // 'weekly' | 'monthly' | null
  const [emailMsg, setEmailMsg] = useState('');

  useEffect(() => {
    getBatches().then((res) => {
      setBatches(res.data);
      if (res.data.length > 0) setSelectedBatch(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedBatch) loadReports();
  }, [selectedBatch]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await getReports(selectedBatch);
      setReports(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setError('');
    setSuccess('');
    if (!selectedBatch) {
      setError('Please select a batch.');
      return;
    }
    setGenerating(true);
    try {
      await generateReport({ batch_id: selectedBatch });
      setSuccess('Report generated and saved!');
      loadReports();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    try {
      await deleteReport(id);
      loadReports();
    } catch (err) {
      setError('Failed to delete report.');
    }
  };

  const handleEmailReport = async (period) => {
    if (!canEdit) return;
    setEmailingPeriod(period);
    setEmailMsg('');
    try {
      const res = await emailZoneReport(selectedBatch, period);
      setEmailMsg(`Sent to ${res.data.sent_count} student(s).${res.data.skipped_count ? ` ${res.data.skipped_count} skipped.` : ''}`);
    } catch (err) {
      setEmailMsg(err.response?.data?.detail || 'Failed to send report.');
    } finally {
      setEmailingPeriod(null);
    }
  };

  const cleanText = (text) => (text ? text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '') : '');

  const parseReportContent = (content) => {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  };

  const buildStyledSheet = (rows, title, narrativeRows = null) => {
    const tableHeaders = [
      'S.No', 'Trainer Name', 'Trainee Name', 'Zone', 'Batch', 'Training Taken Timings',
      'Total No. of Class Days', 'Total Present Days', 'Total Attendance %',
      'Assigned Daily Tasks', 'Total Daily Tasks Completed', 'Daily Tasks Completed %',
      'Assigned Mini Projects', 'Total Mini Project Completed', 'Mini Project Completed %',
      'Assigned Main Projects', 'Total Main Project Completed', 'Main Project Completed %',
      'Assigned Seminars', 'Total Seminar Completed', 'Seminar Completed %',
    ];

    const dataRows = rows.map((r) => [
      r.sno, r.trainer_name, r.trainee_name, r.zone, r.batch, r.timings,
      r.total_class_days, r.total_present_days, `${r.attendance_percentage}%`,
      r.assigned_daily_tasks, r.completed_daily_tasks, `${r.daily_task_percentage}%`,
      r.assigned_mini_projects, r.completed_mini_projects, `${r.mini_project_percentage}%`,
      r.assigned_main_projects, r.completed_main_projects, `${r.main_project_percentage}%`,
      r.assigned_seminars, r.completed_seminars, `${r.seminar_percentage}%`,
    ]);

    const sheetData = [[title], tableHeaders, ...dataRows];
    let summaryHeaderRow = null;

    if (narrativeRows) {
      summaryHeaderRow = dataRows.length + 3;
      sheetData.push([], ['AI Summary & Recommendations'], ...narrativeRows);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    const merges = [{ s: { r: 0, c: 0 }, e: { r: 0, c: tableHeaders.length - 1 } }];
    if (summaryHeaderRow !== null) {
      merges.push({ s: { r: summaryHeaderRow, c: 0 }, e: { r: summaryHeaderRow, c: tableHeaders.length - 1 } });
    }
    worksheet['!merges'] = merges;

    const titleStyle = {
      fill: { fgColor: { rgb: 'B8CCE4' } },
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
    worksheet[XLSX.utils.encode_cell({ r: 0, c: 0 })].s = titleStyle;

    const headerStyle = {
      fill: { fgColor: { rgb: 'FFFF99' } },
      font: { bold: true, sz: 11 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };
    tableHeaders.forEach((_, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: 1, c: colIdx });
      if (worksheet[cellRef]) worksheet[cellRef].s = headerStyle;
    });

    rows.forEach((r, rowIdx) => {
      const excelRow = rowIdx + 2;
      const isSafe = r.zone === 'Safe Zone';
      const rowColor = isSafe ? 'C6EFCE' : 'FFC7CE';
      const rowFontColor = isSafe ? '006100' : '9C0006';

      [3, 8, 11, 14, 17, 20].forEach((colIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: excelRow, c: colIdx });
        if (worksheet[cellRef]) {
          worksheet[cellRef].s = {
            fill: { fgColor: { rgb: rowColor } },
            font: { bold: true, color: { rgb: rowFontColor } },
            alignment: { horizontal: 'center' },
          };
        }
      });
    });

    if (summaryHeaderRow !== null) {
      const summaryCellRef = XLSX.utils.encode_cell({ r: summaryHeaderRow, c: 0 });
      if (worksheet[summaryCellRef]) {
        worksheet[summaryCellRef].s = {
          fill: { fgColor: { rgb: 'D9E2F3' } },
          font: { bold: true, sz: 12 },
        };
      }
    }

    worksheet['!cols'] = [
      { wch: 6 }, { wch: 14 }, { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 18 },
      { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 16 },
      { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 16 },
      { wch: 14 }, { wch: 16 }, { wch: 14 },
    ];

    return worksheet;
  };

  const handleDownload = async (report) => {
    try {
      const res = await getFullZoneReport(report.batch);
      const parsed = parseReportContent(report.content);

      let narrativeRows;
      if (parsed) {
        narrativeRows = [
          ['Executive Summary'],
          [parsed.executive_summary || ''],
          [],
          ['Recommendations'],
          ...(parsed.recommendations || []).map((rec, i) => [`${i + 1}. ${rec}`]),
          [],
          ['Individual Student Notes'],
          ['Student', 'Note'],
          ...(parsed.student_notes || []).map((s) => [s.student, s.note]),
        ];
      } else {
        // Fallback for old-format prose reports generated before this update
        narrativeRows = cleanText(report.content)
          .split('\n')
          .filter((line) => line.trim())
          .filter((line) => !/^\s*\|?\s*:?-+:?\s*\|/.test(line))
          .map((line) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
              return trimmed.split('|').slice(1, -1).map((cell) => cell.trim());
            }
            return [line];
          });
      }

      const worksheet = buildStyledSheet(res.data, report.title, narrativeRows);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
      XLSX.writeFile(workbook, `${report.title.replace(/\s+/g, '_')}.xlsx`);
    } catch (err) {
      setError('Failed to build report Excel.');
    }
  };

  const handleDownloadWeeklyZone = async () => {
    setDownloadingZone(true);
    setError('');
    try {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const startStr = monday.toISOString().split('T')[0];
      const endStr = sunday.toISOString().split('T')[0];

      const res = await getZoneReport(selectedBatch, startStr, endStr);
      const batchName = batches.find((b) => b.id == selectedBatch)?.name || 'Batch';
      const title = `${batchName} - Weekly Production Report (${startStr} to ${endStr})`;
      const worksheet = buildStyledSheet(res.data, title);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
      XLSX.writeFile(workbook, `${batchName.replace(/\s+/g, '_')}_Weekly_Zone_Report.xlsx`);
    } catch (err) {
      setError('Failed to generate weekly zone report.');
    } finally {
      setDownloadingZone(false);
    }
  };

  const handleDownloadMonthlyZone = async () => {
    setDownloadingZone(true);
    setError('');
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const res = await getZoneReport(selectedBatch, firstDay, lastDay);
      const batchName = batches.find((b) => b.id == selectedBatch)?.name || 'Batch';
      const title = `${batchName} - Monthly Production Report (${firstDay} to ${lastDay})`;
      const worksheet = buildStyledSheet(res.data, title);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
      XLSX.writeFile(workbook, `${batchName.replace(/\s+/g, '_')}_Monthly_Zone_Report.xlsx`);
    } catch (err) {
      setError('Failed to generate monthly zone report.');
    } finally {
      setDownloadingZone(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #C6C6CD',
    borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#1E1B4B', display: 'block', marginBottom: '6px',
  };
  const emptyStateStyle = {
    background: 'rgba(255,255,255,0.9)', borderRadius: '10px', padding: '14px 18px', display: 'inline-block',
  };

  return (
    <DashboardShell title="Reports">
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 16px' }}>
          Generate Full Training Report
        </h3>

        {error && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
        {success && <p style={{ color: '#059669', fontSize: '13px', marginBottom: '12px' }}>{success}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'end', maxWidth: '500px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Batch</label>
            <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} style={inputStyle}>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}{b.trainer_username ? ` — ${trainerDisplayName(b)}` : ''}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#0051D5', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '10px 18px', cursor: generating ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap',
              opacity: generating ? 0.7 : 1,
            }}
          >
            {generating ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <button
            onClick={handleDownloadWeeklyZone}
            disabled={downloadingZone}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#059669', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
            }}
          >
            <Download size={16} /> {downloadingZone ? 'Generating...' : 'Weekly Zone Report'}
          </button>
          <button
            onClick={handleDownloadMonthlyZone}
            disabled={downloadingZone}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
            }}
          >
            <Download size={16} /> {downloadingZone ? 'Generating...' : 'Monthly Zone Report'}
          </button>
          {canEdit && (
            <>
              <button
                onClick={() => handleEmailReport('weekly')}
                disabled={emailingPeriod !== null}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#fff', color: '#059669', border: '1px solid #059669', borderRadius: '8px',
                  padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
                }}
              >
                <Mail size={16} /> {emailingPeriod === 'weekly' ? 'Sending...' : 'Send Weekly to All Students'}
              </button>
              <button
                onClick={() => handleEmailReport('monthly')}
                disabled={emailingPeriod !== null}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#fff', color: '#7C3AED', border: '1px solid #7C3AED', borderRadius: '8px',
                  padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
                }}
              >
                <Mail size={16} /> {emailingPeriod === 'monthly' ? 'Sending...' : 'Send Monthly to All Students'}
              </button>
            </>
          )}
        </div>

        {emailMsg && <p style={{ color: emailMsg.includes('Failed') ? '#DC2626' : '#059669', fontSize: '13px' }}>{emailMsg}</p>}
      </div>

      <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', marginBottom: '12px' }}>
        Saved Reports
      </h3>
      {loading ? (
        <div style={emptyStateStyle}>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#45464D', margin: 0 }}>Loading...</p>
        </div>
      ) : reports.length === 0 ? (
        <div style={emptyStateStyle}>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#45464D', margin: 0 }}>No reports generated yet for this batch.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reports.map((report) => {
            const isExpanded = expandedId === report.id;
            const parsed = parseReportContent(report.content);

            return (
              <div key={report.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                      background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0,
                    }}
                  >
                    <FileBarChart size={16} color="#0051D5" style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1E1B4B' }}>
                      {report.title}
                    </span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', marginLeft: 'auto', marginRight: '12px' }}>
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                    {isExpanded ? <ChevronUp size={16} color="#76777D" /> : <ChevronDown size={16} color="#76777D" />}
                  </button>
                  <button
                    onClick={async () => {
                      setDownloadingId(report.id);
                      await handleDownload(report);
                      setDownloadingId(null);
                    }}
                    disabled={downloadingId === report.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px',
                      background: '#059669', color: '#fff', border: 'none', borderRadius: '6px',
                      padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px',
                    }}
                  >
                    <Download size={14} /> {downloadingId === report.id ? 'Building...' : 'Excel'}
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px',
                      background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px',
                      padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px',
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>

                {isExpanded && (
                  parsed ? (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                      <h4 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#1E1B4B', margin: '0 0 6px' }}>
                        Executive Summary
                      </h4>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', margin: '0 0 16px' }}>
                        {parsed.executive_summary}
                      </p>

                      <h4 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#1E1B4B', margin: '0 0 6px' }}>
                        Recommendations
                      </h4>
                      <ul style={{ margin: '0 0 16px', paddingLeft: '20px' }}>
                        {(parsed.recommendations || []).map((rec, i) => (
                          <li key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', marginBottom: '4px' }}>
                            {rec}
                          </li>
                        ))}
                      </ul>

                      <h4 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px', color: '#1E1B4B', margin: '0 0 8px' }}>
                        Individual Student Notes
                      </h4>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#F8FAFC' }}>
                            <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11px', fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#76777D', borderBottom: '1px solid #E2E8F0' }}>
                              Student
                            </th>
                            <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11px', fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#76777D', borderBottom: '1px solid #E2E8F0' }}>
                              Note
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(parsed.student_notes || []).map((s, i) => (
                            <tr key={i}>
                              <td style={{ padding: '8px 10px', fontSize: '12px', fontFamily: 'Inter, sans-serif', color: '#1E1B4B', borderBottom: '1px solid #F1F5F9' }}>
                                {s.student}
                              </td>
                              <td style={{ padding: '8px 10px', fontSize: '12px', fontFamily: 'Inter, sans-serif', color: '#45464D', borderBottom: '1px solid #F1F5F9' }}>
                                {s.note}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '0 16px 16px', fontFamily: 'Inter, sans-serif', fontSize: '13px',
                        color: '#45464D', whiteSpace: 'pre-wrap', borderTop: '1px solid #F1F5F9',
                        paddingTop: '16px', maxHeight: '500px', overflowY: 'auto', lineHeight: 1.7,
                      }}
                    >
                      {cleanText(report.content)}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
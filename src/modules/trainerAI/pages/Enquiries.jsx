import { useState, useEffect, Fragment } from 'react';
import DashboardShell from '../../../core/layout/DashboardShell';
import { getEnquiries, updateEnquiryStatus, getPaymentByEnquiry, markEnquiriesSeen } from '../api';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import CreateAccountPanel from '../components/CreateAccountPanel';
import WelcomeKitPanel from '../components/WelcomeKitPanel';

const STATUS_COLOR = {
  new: { bg: '#EFF4FF', color: '#0051D5' },
  shortlisted: { bg: '#DCFCE7', color: '#059669' },
  rejected: { bg: '#FEE2E2', color: '#DC2626' },
  converted: { bg: '#F3E8FF', color: '#7C3AED' },
};

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [paymentCache, setPaymentCache] = useState({});

  const load = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (eligibleOnly) params.eligible_only = 'true';
    getEnquiries(params).then((res) => setEnquiries(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter, eligibleOnly]);

  useEffect(() => {
    markEnquiriesSeen();
  }, []);

  const handleStatusChange = async (id, status) => {
    await updateEnquiryStatus(id, { status });
    load();
  };

  const loadPaymentFor = (enquiryId) => {
    getPaymentByEnquiry(enquiryId)
      .then((res) => setPaymentCache((prev) => ({ ...prev, [enquiryId]: res.data })))
      .catch(() => setPaymentCache((prev) => ({ ...prev, [enquiryId]: null })));
  };

  const thStyle = {
    padding: '10px 14px', textAlign: 'left', fontFamily: 'Inter, sans-serif',
    fontWeight: 600, fontSize: '12px', color: '#76777D', borderBottom: '1px solid #E2E8F0',
  };
  const tdStyle = {
    padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: '13px',
    color: '#45464D', borderBottom: '1px solid #F1F5F9',
  };
  const selectStyle = {
    padding: '9px 12px', border: '1px solid #C6C6CD', borderRadius: '8px',
    fontFamily: 'Inter, sans-serif', fontSize: '13px', background: '#fff',
  };

  return (
    <DashboardShell title="Enquiries">
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
          <option value="converted">Converted</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', cursor: 'pointer' }}>
          <input type="checkbox" checked={eligibleOnly} onChange={(e) => setEligibleOnly(e.target.checked)} />
          Eligible only
        </label>

        <p style={{ marginLeft: 'auto', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D' }}>
          {enquiries.length} result(s)
        </p>
      </div>

      {loading ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>Loading...</p>
      ) : enquiries.length === 0 ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>No enquiries found.</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Name', 'Age', 'Course', 'Eligibility', 'WhatsApp', 'Source', 'Status', 'Action'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => (
                <Fragment key={e.id}>
                  <tr>
                    <td style={tdStyle}>{e.name}</td>
                    <td style={tdStyle}>{e.age}</td>
                    <td style={tdStyle}>{e.course_name} <span style={{ color: '#76777D' }}>(max {e.course_max_age})</span></td>
                    <td style={tdStyle}>
                      {e.eligible ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600, fontSize: '12px' }}>
                          <CheckCircle2 size={13} /> Eligible
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DC2626', fontWeight: 600, fontSize: '12px' }}>
                          <XCircle size={13} /> Not Eligible
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>{e.whatsapp_number}</td>
                    <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{e.source}</td>
                    <td style={tdStyle}>
                      <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize', background: STATUS_COLOR[e.status]?.bg, color: STATUS_COLOR[e.status]?.color }}>
                        {e.status}
                      </span>
                      {e.account_created && (
                        <span style={{ marginLeft: '6px', fontSize: '10px', color: '#059669', fontWeight: 600 }}>● Account Active</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select
                          value={e.status}
                          onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                          style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', padding: '5px 8px', borderRadius: '6px', border: '1px solid #C6C6CD' }}
                        >
                          <option value="new">New</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                          <option value="converted">Converted</option>
                        </select>
                        <button
                          onClick={() => {
                            const next = expandedId === e.id ? null : e.id;
                            setExpandedId(next);
                            if (next) loadPaymentFor(e.id);
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#0051D5', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600 }}
                        >
                          Account & Kit {expandedId === e.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === e.id && (
                    <tr>
                      <td colSpan={8} style={{ padding: '12px 20px', background: '#fff', borderBottom: '1px solid #F1F5F9' }}>
                        <CreateAccountPanel enquiry={e} payment={paymentCache[e.id]} onCreated={load} />
                        <div style={{ marginTop: '12px' }}>
                          <WelcomeKitPanel enquiry={e} />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
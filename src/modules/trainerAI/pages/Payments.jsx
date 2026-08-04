import { useState, useEffect, useMemo } from 'react';
import DashboardShell from '../../../core/layout/DashboardShell';
import {
  getPaymentsList, downloadInvoice, getEnquiriesWithoutPayment, createPayment, deletePayment,
  getPaymentByEnquiry, markInstallmentPaid,
} from '../api';
import WhatsAppButton from '../../../core/components/WhatsAppButton';
import { Search, FileDown, CheckCircle2, CreditCard, XCircle, Trash2, ChevronDown, ChevronUp, Circle } from 'lucide-react';

function SetupPaymentRow({ enquiry, onCreated }) {
  const [baseFee, setBaseFee] = useState('');
  const [planType, setPlanType] = useState('full');
  const [installmentCount, setInstallmentCount] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const inputStyle = { padding: '8px 10px', border: '1px solid #C6C6CD', borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', boxSizing: 'border-box' };

  const handleCreate = async () => {
    setError('');
    if (!baseFee || Number(baseFee) <= 0) {
      setError('Enter a valid course fee.');
      return;
    }
    setSaving(true);
    try {
      await createPayment({
        enquiry: enquiry.id,
        base_fee: baseFee,
        gst_percentage: 18,
        plan_type: planType,
        installment_count: planType === 'emi' ? installmentCount : 1,
      });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create payment plan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
        <div style={{ minWidth: '160px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#1E1B4B', margin: 0 }}>{enquiry.name}</p>
            {enquiry.eligible ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#059669', fontWeight: 600, fontSize: '10px' }}>
                <CheckCircle2 size={11} /> Eligible
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#DC2626', fontWeight: 600, fontSize: '10px' }}>
                <XCircle size={11} /> Not Eligible
              </span>
            )}
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#76777D', margin: 0 }}>{enquiry.course_name}</p>
        </div>
        <div>
          <input type="number" value={baseFee} onChange={(e) => setBaseFee(e.target.value)} placeholder="Course Fee (₹)" style={{ ...inputStyle, width: '130px' }} />
        </div>
        <div>
          <select value={planType} onChange={(e) => setPlanType(e.target.value)} style={inputStyle}>
            <option value="full">Full Payment</option>
            <option value="emi">EMI</option>
          </select>
        </div>
        {planType === 'emi' && (
          <div>
            <input type="number" min="2" max="6" value={installmentCount} onChange={(e) => setInstallmentCount(Number(e.target.value))} style={{ ...inputStyle, width: '70px' }} />
          </div>
        )}
        <button
          onClick={handleCreate}
          disabled={saving}
          style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px' }}
        >
          {saving ? 'Saving...' : 'Create Plan'}
        </button>
      </div>
      {error && <p style={{ color: '#DC2626', fontSize: '12px', margin: '8px 0 0' }}>{error}</p>}
    </div>
  );
}

function InstallmentsPanel({ enquiryId, onChanged }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);

  const load = () => {
    setLoading(true);
    getPaymentByEnquiry(enquiryId)
      .then((res) => setPayment(res.data))
      .catch(() => setPayment(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [enquiryId]);

  const handleMarkPaid = async (installmentId) => {
    setMarkingId(installmentId);
    try {
      await markInstallmentPaid(installmentId);
      load();
      onChanged?.();
    } finally {
      setMarkingId(null);
    }
  };

  if (loading) return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', padding: '10px 0' }}>Loading installments...</p>;
  if (!payment) return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', padding: '10px 0' }}>No payment plan found.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0' }}>
      {payment.installments.map((inst) => (
        <div key={inst.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {inst.paid ? <CheckCircle2 size={16} color="#059669" /> : <Circle size={16} color="#C6C6CD" />}
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#1E1B4B' }}>
              Installment {inst.installment_number} — ₹{inst.amount}
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D' }}>
              Due {inst.due_date} {inst.paid && `· Paid ${inst.paid_on}`}
            </span>
          </div>
          {!inst.paid && (
            <button
              onClick={() => handleMarkPaid(inst.id)}
              disabled={markingId === inst.id}
              style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px' }}
            >
              {markingId === inst.id ? 'Marking...' : 'Mark Paid'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [pendingSetup, setPendingSetup] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const loadAll = () => {
    setLoading(true);
    Promise.all([getPaymentsList(), getEnquiriesWithoutPayment()])
      .then(([pRes, eRes]) => {
        setPayments(pRes.data);
        setPendingSetup(eRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return payments.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(q) || (p.course_name || '').toLowerCase().includes(q);
      const matchesEligibility = !eligibleOnly || p.eligible;
      return matchesSearch && matchesEligibility;
    });
  }, [payments, search, eligibleOnly]);

  const handleDownloadInvoice = async (enquiryId, name) => {
    setDownloadingId(enquiryId);
    try {
      const res = await downloadInvoice(enquiryId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${name.replace(/\s+/g, '_')}_Invoice.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeletePayment = async (paymentId, name) => {
    if (!window.confirm(`Delete the payment plan for ${name}? This removes all installment records too.`)) return;
    setDeletingId(paymentId);
    try {
      await deletePayment(paymentId);
      loadAll();
    } catch (err) {
      alert('Failed to delete payment plan.');
    } finally {
      setDeletingId(null);
    }
  };

  const buildReminderMessage = (p) => {
    if (!p.next_due_installment) return '';
    const { installment_number, amount, due_date } = p.next_due_installment;
    return `Hi ${p.name}, this is a reminder that Installment ${installment_number} of Rs.${amount} for your ${p.course_name} course at Vetri Technology Solutions is due on ${due_date}. Kindly complete the payment at your earliest convenience.`;
  };

  const dueSoonPayments = payments.filter((p) => p.due_soon);

  const thStyle = { padding: '10px 14px', textAlign: 'left', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: '#76777D', borderBottom: '1px solid #E2E8F0' };
  const tdStyle = { padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', borderBottom: '1px solid #F1F5F9' };

  return (
    <DashboardShell title="Payments">
      {/* Students needing a payment plan set up */}
      {pendingSetup.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#1E1B4B', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={16} color="#D97706" /> Needs Payment Plan ({pendingSetup.length})
          </h3>
          {pendingSetup.map((e) => (
            <SetupPaymentRow key={e.id} enquiry={e} onCreated={loadAll} />
          ))}
        </div>
      )}

      {/* Due within 3 days — reminder nudge */}
      {dueSoonPayments.length > 0 && (
        <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#92400E', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠ Due Within 3 Days — Send Reminders ({dueSoonPayments.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {dueSoonPayments.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: '8px', padding: '10px 14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#1E1B4B', margin: 0 }}>{p.name}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '2px 0 0' }}>
                    Installment {p.next_due_installment.installment_number} — ₹{p.next_due_installment.amount} due {p.next_due_installment.due_date}
                  </p>
                </div>
                <WhatsAppButton
                  phoneNumber={p.whatsapp_number}
                  message={buildReminderMessage(p)}
                  label="Remind Now"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', maxWidth: '360px', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="#76777D" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or course..."
            style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid #C6C6CD', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#45464D', cursor: 'pointer' }}>
          <input type="checkbox" checked={eligibleOnly} onChange={(e) => setEligibleOnly(e.target.checked)} />
          Eligible only
        </label>
      </div>

      {loading ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#76777D' }}>No payment plans found.</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Name', 'Course', 'Eligibility', 'Plan', 'Total (incl. GST)', 'Status', 'Next Due', 'Actions'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <>
                  <tr key={p.id}>
                    <td style={tdStyle}>{p.name}</td>
                    <td style={tdStyle}>{p.course_name}</td>
                    <td style={tdStyle}>
                      {p.eligible ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600, fontSize: '12px' }}>
                          <CheckCircle2 size={13} /> Eligible
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DC2626', fontWeight: 600, fontSize: '12px' }}>
                          <XCircle size={13} /> Not Eligible
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>{p.plan_type === 'emi' ? `EMI (${p.installment_count})` : 'Full Payment'}</td>
                    <td style={tdStyle}>₹{p.total_payable}</td>
                    <td style={tdStyle}>
                      {p.fully_paid ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600, fontSize: '12px' }}>
                          <CheckCircle2 size={13} /> Fully Paid
                        </span>
                      ) : (
                        <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: '#FEF3C7', color: '#D97706' }}>
                          Pending
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {p.next_due_installment
                        ? `Inst. ${p.next_due_installment.installment_number} — ₹${p.next_due_installment.amount} (${p.next_due_installment.due_date})`
                        : '—'}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#45464D', border: '1px solid #C6C6CD', borderRadius: '6px', padding: '7px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px' }}
                        >
                          Installments {expandedId === p.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(p.id, p.name)}
                          disabled={downloadingId === p.id}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0051D5', color: '#fff', border: 'none', borderRadius: '6px', padding: '7px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px' }}
                        >
                          <FileDown size={13} /> {downloadingId === p.id ? 'Downloading...' : 'Invoice'}
                        </button>
                        {p.next_due_installment && (
                          <WhatsAppButton
                            phoneNumber={p.whatsapp_number}
                            message={buildReminderMessage(p)}
                            label="Remind"
                          />
                        )}
                        <button
                          onClick={() => handleDeletePayment(p.payment_id, p.name)}
                          disabled={deletingId === p.payment_id}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#DC2626', border: '1px solid #DC2626', borderRadius: '6px', padding: '7px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px' }}
                        >
                          <Trash2 size={13} /> {deletingId === p.payment_id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === p.id && (
                    <tr key={`${p.id}-installments`}>
                      <td colSpan={8} style={{ padding: '0 20px 16px', background: '#F8FAFC' }}>
                        <InstallmentsPanel enquiryId={p.id} onChanged={loadAll} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
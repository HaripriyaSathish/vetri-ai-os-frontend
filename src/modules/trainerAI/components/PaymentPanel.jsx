import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Circle } from 'lucide-react';
import { getPaymentByEnquiry, createPayment, markInstallmentPaid } from '../api';

export default function PaymentPanel({ enquiry, onChanged }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [baseFee, setBaseFee] = useState('');
  const [planType, setPlanType] = useState('full');
  const [installmentCount, setInstallmentCount] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getPaymentByEnquiry(enquiry.id)
      .then((res) => { setPayment(res.data); setNotFound(false); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [enquiry.id]);

  const inputStyle = {
    padding: '9px 12px', border: '1px solid #C6C6CD', borderRadius: '8px',
    fontFamily: 'Inter, sans-serif', fontSize: '13px', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: '#45464D', display: 'block', marginBottom: '4px',
  };

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
      load();
      onChanged?.();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create payment plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (installmentId) => {
    await markInstallmentPaid(installmentId);
    load();
    onChanged?.();
  };

  if (loading) return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', padding: '12px' }}>Loading payment info...</p>;

  if (notFound || !payment) {
    return (
      <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '16px 20px' }}>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#1E1B4B', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CreditCard size={14} /> Set Up Payment Plan
        </p>
        {error && <p style={{ color: '#DC2626', fontSize: '12px', marginBottom: '10px' }}>{error}</p>}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <label style={labelStyle}>Course Fee (₹, before GST)</label>
            <input type="number" value={baseFee} onChange={(e) => setBaseFee(e.target.value)} style={{ ...inputStyle, width: '150px' }} placeholder="30000" />
          </div>
          <div>
            <label style={labelStyle}>Plan</label>
            <select value={planType} onChange={(e) => setPlanType(e.target.value)} style={inputStyle}>
              <option value="full">Full Payment</option>
              <option value="emi">EMI</option>
            </select>
          </div>
          {planType === 'emi' && (
            <div>
              <label style={labelStyle}>Number of Installments</label>
              <input type="number" min="2" max="6" value={installmentCount} onChange={(e) => setInstallmentCount(Number(e.target.value))} style={{ ...inputStyle, width: '90px' }} />
            </div>
          )}
          {baseFee && (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#76777D', margin: '0 0 9px' }}>
              Total with 18% GST: ₹{(Number(baseFee) * 1.18).toFixed(2)}
            </p>
          )}
          <button
            onClick={handleCreate}
            disabled={saving}
            style={{ background: '#0051D5', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px' }}
          >
            {saving ? 'Saving...' : 'Create Plan'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#1E1B4B', margin: 0 }}>
          Payment Plan — ₹{payment.total_payable} total ({payment.plan_type === 'emi' ? `${payment.installment_count} EMIs` : 'Full Payment'})
        </p>
        {payment.fully_paid && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600, fontSize: '12px' }}>
            <CheckCircle2 size={14} /> Fully Paid
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px' }}
              >
                Mark Paid
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
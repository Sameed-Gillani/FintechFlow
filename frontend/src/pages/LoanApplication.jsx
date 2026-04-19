import { useState } from 'react';
import { useToast }   from '../context/ToastContext';
import { formatPKR }  from '../utils/formatPKR';

const API = import.meta.env.VITE_API_URL || '';

const CNIC_REGEX    = /^\d{5}-\d{7}-\d{1}$/;
const purposes      = ['Business', 'Education', 'Medical', 'Personal'];

const emptyForm = { name: '', cnic: '', contact: '', amount: '', purpose: 'Business', tenure: '' };
const emptyErr  = { name: '', cnic: '', contact: '', amount: '', tenure: '' };

export default function LoanApplication() {
  const [step,       setStep]       = useState(1);   // 1, 2, 3
  const [form,       setForm]       = useState(emptyForm);
  const [errors,     setErrors]     = useState(emptyErr);
  const [submitting, setSubmitting] = useState(false);
  const [loanResult, setLoanResult] = useState(null); // successful loan response
  const toast = useToast();

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const err = (field, msg) => setErrors(p => ({ ...p, [field]: msg }));
  const clearErr = field  => setErrors(p => ({ ...p, [field]: '' }));

  // Per-step validation
  function validateStep1() {
    let valid = true;
    if (!form.name.trim())         { err('name',    'Applicant name is required'); valid = false; }
    if (!CNIC_REGEX.test(form.cnic)) { err('cnic',   'CNIC format must be XXXXX-XXXXXXX-X'); valid = false; }
    if (!form.contact.trim())      { err('contact', 'Contact number is required'); valid = false; }
    return valid;
  }

  function validateStep2() {
    let valid = true;
    const amt = parseFloat(form.amount);
    const ten = parseInt(form.tenure, 10);
    if (isNaN(amt) || amt < 5000 || amt > 5000000) {
      err('amount', 'Amount must be between PKR 5,000 and PKR 5,000,000'); valid = false;
    }
    if (isNaN(ten) || ten < 3 || ten > 60) {
      err('tenure', 'Tenure must be between 3 and 60 months'); valid = false;
    }
    return valid;
  }

  function nextStep() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    const res  = await fetch(`${API}/api/loans/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicant: form.name,
        amount:    parseFloat(form.amount),
        purpose:   form.purpose,
        tenure:    parseInt(form.tenure, 10)
      })
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { toast(data.error, 'error'); return; }
    setLoanResult(data);
    toast('Loan application submitted!', 'success');
  }

  // Animated success screen on 201 response
  if (loanResult) return (
    <div className="page">
      <div className="card success-screen">
        <div className="success-icon">🎉</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Application Submitted!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Your loan application has been received and is under review.
        </p>
        <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '1rem', marginBottom: '1.5rem' }}>
          <div className="review-row"><span className="review-label">Loan ID</span><span className="review-value">#{loanResult.id}</span></div>
          <div className="review-row"><span className="review-label">Amount</span><span className="review-value">{formatPKR(loanResult.amount)}</span></div>
          <div className="review-row"><span className="review-label">Status</span><span className="badge badge-pending">{loanResult.status}</span></div>
        </div>
        <button className="btn btn-primary" onClick={() => { setLoanResult(null); setForm(emptyForm); setStep(1); }}>
          Apply for Another
        </button>
      </div>
    </div>
  );

  const progressPct = ((step - 1) / 2) * 100;

  return (
    <div className="page">
      <h1 className="page-title">📝 Loan Application</h1>

      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Step indicators */}
        <div className="step-indicators">
          {['Personal Info', 'Loan Details', 'Review'].map((label, i) => (
            <div key={i} style={{ textAlign: 'center', flex: 1 }}>
              <div className={`step-dot ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}
                style={{ margin: '0 auto 4px' }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Animated progress bar */}
        <div className="progress-bar-wrap" style={{ marginTop: '1rem' }}>
          <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>

        {/* Step 1 — Personal Info */}
        {step === 1 && (
          <div className="step-content">
            <h3 style={{ marginBottom: '1rem' }}>Step 1: Personal Information</h3>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className={`form-input ${errors.name ? 'error-input' : ''}`}
                value={form.name}
                onChange={e => { set('name', e.target.value); clearErr('name'); }}
                placeholder="Muhammad Ali" />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">CNIC (format: XXXXX-XXXXXXX-X)</label>
              <input className={`form-input ${errors.cnic ? 'error-input' : ''}`}
                value={form.cnic}
                onChange={e => { set('cnic', e.target.value); clearErr('cnic'); }}
                placeholder="42101-1234567-9" />
              {errors.cnic && <span className="error-msg">{errors.cnic}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input className={`form-input ${errors.contact ? 'error-input' : ''}`}
                value={form.contact}
                onChange={e => { set('contact', e.target.value); clearErr('contact'); }}
                placeholder="0300-1234567" />
              {errors.contact && <span className="error-msg">{errors.contact}</span>}
            </div>

            <button className="btn btn-primary" onClick={nextStep}>Next →</button>
          </div>
        )}

        {/* Step 2 — Loan Details */}
        {step === 2 && (
          <div className="step-content">
            <h3 style={{ marginBottom: '1rem' }}>Step 2: Loan Details</h3>

            <div className="form-group">
              <label className="form-label">Loan Amount (PKR 5,000 – 50,00,000)</label>
              <input type="number" className={`form-input ${errors.amount ? 'error-input' : ''}`}
                value={form.amount}
                onChange={e => { set('amount', e.target.value); clearErr('amount'); }}
                placeholder="100000" />
              {errors.amount && <span className="error-msg">{errors.amount}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Purpose</label>
              <select className="form-input" value={form.purpose}
                onChange={e => set('purpose', e.target.value)}>
                {purposes.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tenure (3 – 60 months)</label>
              <input type="number" className={`form-input ${errors.tenure ? 'error-input' : ''}`}
                value={form.tenure}
                onChange={e => { set('tenure', e.target.value); clearErr('tenure'); }}
                placeholder="12" />
              {errors.tenure && <span className="error-msg">{errors.tenure}</span>}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={nextStep}>Review →</button>
            </div>
          </div>
        )}

        {/* Step 3 — Read-only review before submit */}
        {step === 3 && (
          <div className="step-content">
            <h3 style={{ marginBottom: '1rem' }}>Step 3: Review & Submit</h3>

            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '1rem', marginBottom: '1.5rem' }}>
              <div className="review-row"><span className="review-label">Name</span><span className="review-value">{form.name}</span></div>
              <div className="review-row"><span className="review-label">CNIC</span><span className="review-value">{form.cnic}</span></div>
              <div className="review-row"><span className="review-label">Contact</span><span className="review-value">{form.contact}</span></div>
              <div className="review-row"><span className="review-label">Amount</span><span className="review-value">{formatPKR(parseFloat(form.amount))}</span></div>
              <div className="review-row"><span className="review-label">Purpose</span><span className="review-value">{form.purpose}</span></div>
              <div className="review-row"><span className="review-label">Tenure</span><span className="review-value">{form.tenure} months</span></div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : '✓ Submit Application'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

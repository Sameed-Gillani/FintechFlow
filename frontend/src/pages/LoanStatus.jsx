import { useState, useEffect, useMemo } from 'react';
import { LoanCardSkeleton } from '../components/SkeletonLoader';
import { useCountUp }       from '../hooks/useCountUp';
import { useToast }         from '../context/ToastContext';
import { formatPKR }        from '../utils/formatPKR';

const API = import.meta.env.VITE_API_URL || '';

// Count-up stat badge at top
function CountStat({ value, label, color }) {
  const display = useCountUp(value);
  return (
    <div className="summary-item">
      <div className="summary-value" style={{ color }}>{display}</div>
      <div className="summary-label">{label}</div>
    </div>
  );
}

export default function LoanStatus() {
  const [loans,   setLoans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort,    setSort]    = useState('default');
  const toast = useToast();

  useEffect(() => {
    fetch(`${API}/api/loans`)
      .then(r => r.json())
      .then(data => { setLoans(data); setLoading(false); })
      .catch(() => { toast('Failed to load loans', 'error'); setLoading(false); });
  }, []);

  // Update single card status WITHOUT full page reload
  async function updateStatus(id, status) {
    const res  = await fetch(`${API}/api/loans/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) { toast(data.error, 'error'); return; }
    // Update just that one card in state — no reload
    setLoans(prev => prev.map(l => l.id === id ? { ...l, status: data.status } : l));
    toast(`Loan #${id} ${status}!`, 'success');
  }

  const sorted = useMemo(() => {
    const copy = [...loans];
    if (sort === 'amount-high') copy.sort((a, b) => b.amount - a.amount);
    if (sort === 'amount-low')  copy.sort((a, b) => a.amount - b.amount);
    if (sort === 'status')      copy.sort((a, b) => a.status.localeCompare(b.status));
    return copy;
  }, [loans, sort]);

  const pending  = loans.filter(l => l.status === 'pending').length;
  const approved = loans.filter(l => l.status === 'approved').length;
  const rejected = loans.filter(l => l.status === 'rejected').length;

  return (
    <div className="page">
      <h1 className="page-title">📊 Loan Status</h1>

      {/* Animated count-up summary bar */}
      <div className="summary-bar">
        <CountStat value={pending}  label="Pending"  color="var(--warning)" />
        <CountStat value={approved} label="Approved" color="var(--success)" />
        <CountStat value={rejected} label="Rejected" color="var(--danger)"  />
      </div>

      {/* Sort control */}
      <div className="sort-control">
        <span>Sort by:</span>
        <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="default">Date Applied</option>
          <option value="amount-high">Amount (High → Low)</option>
          <option value="amount-low">Amount (Low → High)</option>
          <option value="status">Status</option>
        </select>
      </div>

      {loading && <LoanCardSkeleton />}

      {!loading && loans.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
          No loan applications yet.
        </div>
      )}

      {/* 3D flip cards — hover reveals Approve/Reject on back face */}
      <div className="loans-grid">
        {sorted.map((loan, i) => (
          <div key={loan.id} className="flip-card" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flip-card-inner">

              {/* Front face */}
              <div className="flip-card-front">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{loan.id}</span>
                  {/* Pulsing glow badge for pending */}
                  <span className={`badge badge-${loan.status}`}>{loan.status}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{loan.applicant}</div>
                <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>
                  {formatPKR(loan.amount)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div>📌 {loan.purpose}</div>
                  <div>📅 {loan.tenure} months</div>
                  <div style={{ marginTop: 4 }}>{new Date(loan.appliedAt).toLocaleDateString()}</div>
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.7 }}>
                  Hover to manage →
                </div>
              </div>

              {/* Back face — revealed on hover (CSS 3D rotateY) */}
              <div className="flip-card-back">
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Manage Loan #{loan.id}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {loan.applicant} — {formatPKR(loan.amount)}
                </div>
                <button
                  className="btn btn-success"
                  onClick={() => updateStatus(loan.id, 'approved')}
                  disabled={loan.status === 'approved'}
                >
                  ✓ Approve
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => updateStatus(loan.id, 'rejected')}
                  disabled={loan.status === 'rejected'}
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

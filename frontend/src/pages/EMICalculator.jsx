import { useState } from 'react';
import { useCountUp }  from '../hooks/useCountUp';
import { useToast }    from '../context/ToastContext';
import { formatPKR }   from '../utils/formatPKR';
import { StatSkeleton } from '../components/SkeletonLoader';

const API = import.meta.env.VITE_API_URL || '';

// Count-up stat card
function StatCard({ value, label }) {
  const count = useCountUp(Math.round(value));
  return (
    <div className="stat-card">
      <div className="stat-card-value">{formatPKR(count)}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

// Build month-by-month amortization on frontend using server-returned EMI
// interest = remainingBalance × monthlyRate; principal = EMI - interest
function buildAmortization(emi, principal, monthlyRate, months) {
  let remaining = principal;
  const rows = [];
  for (let i = 1; i <= months; i++) {
    const interest         = remaining * monthlyRate;
    const principalComp    = emi - interest;
    remaining             -= principalComp;
    rows.push({
      month:            i,
      principalComp:    principalComp.toFixed(2),
      interestComp:     interest.toFixed(2),
      remainingBalance: Math.max(0, remaining).toFixed(2)
    });
  }
  return rows;
}

export default function EMICalculator() {
  const [form,     setForm]     = useState({ principal: '', annualRate: '', months: '' });
  const [result,   setResult]   = useState(null);
  const [amort,    setAmort]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const toast = useToast();

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  async function calculate(e) {
    e.preventDefault();
    const { principal, annualRate, months } = form;
    if (!principal || !annualRate || !months) {
      toast('Please fill all fields', 'error'); return;
    }

    setLoading(true);
    // EMI is computed on the BACKEND — not recalculated here
    const res  = await fetch(
      `${API}/api/emi-calculator?principal=${principal}&annualRate=${annualRate}&months=${months}`
    );
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { toast(data.error, 'error'); return; }
    setResult(data);

    // Build amortization using server-returned EMI value
    const rows = buildAmortization(data.emi, parseFloat(principal), data.monthlyRate, parseInt(months, 10));
    setAmort(rows);
  }

  const principalPct = result
    ? ((parseFloat(form.principal) / result.totalPayable) * 100).toFixed(1)
    : 0;

  return (
    <div className="page">
      <h1 className="page-title">🧮 EMI Calculator</h1>

      <div className="card" style={{ maxWidth: 500, marginBottom: '2rem' }}>
        <form onSubmit={calculate}>
          <div className="form-group">
            <label className="form-label">Principal (PKR)</label>
            <input type="number" className="form-input"
              value={form.principal} onChange={e => set('principal', e.target.value)}
              placeholder="100000" />
          </div>
          <div className="form-group">
            <label className="form-label">Annual Interest Rate (%)</label>
            <input type="number" className="form-input"
              value={form.annualRate} onChange={e => set('annualRate', e.target.value)}
              placeholder="12" step="0.1" />
          </div>
          <div className="form-group">
            <label className="form-label">Tenure (months)</label>
            <input type="number" className="form-input"
              value={form.months} onChange={e => set('months', e.target.value)}
              placeholder="12" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Calculating...' : '🔢 Calculate EMI'}
          </button>
        </form>
      </div>

      {loading && <StatSkeleton />}

      {result && !loading && (
        <>
          {/* 3 animated count-up stat cards */}
          <div className="stat-cards">
            <StatCard value={result.emi}           label="Monthly EMI"    />
            <StatCard value={result.totalPayable}  label="Total Payable"  />
            <StatCard value={result.totalInterest} label="Total Interest"  />
          </div>

          {/* Principal vs Interest visual breakdown bar (CSS only, no chart library) */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Principal vs Interest Breakdown</h3>
            <div className="breakdown-bar">
              <div className="breakdown-principal" style={{ width: `${principalPct}%` }}>
                {principalPct > 15 ? `${principalPct}% Principal` : ''}
              </div>
              <div className="breakdown-interest">
                {(100 - parseFloat(principalPct)) > 10 ? `${(100 - parseFloat(principalPct)).toFixed(1)}% Interest` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <span><span style={{ color: 'var(--primary)' }}>■</span> Principal: {formatPKR(parseFloat(form.principal))}</span>
              <span><span style={{ color: 'var(--danger)' }}>■</span> Interest: {formatPKR(result.totalInterest)}</span>
            </div>
          </div>

          {/* Month-by-month amortization table */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Amortization Schedule</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="amort-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Principal (PKR)</th>
                    <th>Interest (PKR)</th>
                    <th>Remaining (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {amort.map((row, i) => (
                    <tr key={row.month} style={{ animationDelay: `${i * 20}ms` }}>
                      <td>{row.month}</td>
                      <td>{formatPKR(parseFloat(row.principalComp))}</td>
                      <td>{formatPKR(parseFloat(row.interestComp))}</td>
                      <td>{formatPKR(parseFloat(row.remainingBalance))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useCountUp } from '../hooks/useCountUp';
import { useToast }   from '../context/ToastContext';
import { formatPKR }  from '../utils/formatPKR';

const API = import.meta.env.VITE_API_URL || '';

export default function WalletDashboard() {
  const [wallet,      setWallet]      = useState({ balance: 0, currency: 'PKR', owner: '' });
  const [loading,     setLoading]     = useState(true);
  const [depositAmt,  setDepositAmt]  = useState('');
  const [withdrawAmt, setWithdrawAmt] = useState('');
  const [cardClass,   setCardClass]   = useState('');
  const [inputError,  setInputError]  = useState({ deposit: false, withdraw: false });
  const toast = useToast();

  // useCountUp animates balance from 0 to actual value
  const displayBalance = useCountUp(wallet.balance);

  useEffect(() => {
    fetch(`${API}/api/wallet`)
      .then(r => r.json())
      .then(data => { setWallet(data); setLoading(false); })
      .catch(() => { toast('Failed to load wallet', 'error'); setLoading(false); });
  }, []);

  // Trigger scale-pulse + color tint on balance change
  function pulseCard(type) {
    setCardClass(type === 'credit' ? 'positive pulse' : 'negative pulse');
    setTimeout(() => setCardClass(''), 600);
  }

  async function handleDeposit(e) {
    e.preventDefault();
    const amount = parseFloat(depositAmt);
    if (!amount || amount <= 0) {
      setInputError(p => ({ ...p, deposit: true }));
      setTimeout(() => setInputError(p => ({ ...p, deposit: false })), 600);
      return;
    }
    const res  = await fetch(`${API}/api/wallet/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    if (!res.ok) { toast(data.error, 'error'); return; }
    setWallet(data.wallet);
    pulseCard('credit');
    toast(`Deposited ${formatPKR(amount)} successfully!`, 'success');
    setDepositAmt('');
  }

  async function handleWithdraw(e) {
    e.preventDefault();
    const amount = parseFloat(withdrawAmt);
    if (!amount || amount <= 0) {
      setInputError(p => ({ ...p, withdraw: true }));
      setTimeout(() => setInputError(p => ({ ...p, withdraw: false })), 600);
      return;
    }
    const res  = await fetch(`${API}/api/wallet/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    if (!res.ok) { toast(data.error, 'error'); return; }
    setWallet(data.wallet);
    pulseCard('debit');
    toast(`Withdrawn ${formatPKR(amount)} successfully!`, 'success');
    setWithdrawAmt('');
  }

  if (loading) return (
    <div className="page">
      <div className="card" style={{ height: 140, marginBottom: '2rem' }}>
        <div className="skeleton" style={{ height: 20, width: '30%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 40, width: '60%' }} />
      </div>
    </div>
  );

  return (
    <div className="page">
      <h1 className="page-title">💳 Wallet Dashboard</h1>

      {/* Balance Card - color changes + scale-pulse on transaction */}
      <div className={`balance-card ${cardClass}`}>
        <div className="balance-label">Current Balance — {wallet.owner}</div>
        {/* useCountUp counts up from 0 to balance */}
        <div className="balance-amount">{formatPKR(displayBalance)}</div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.75 }}>{wallet.currency} Account</div>
      </div>

      {/* Deposit & Withdraw forms — side by side on desktop, stacked on mobile */}
      <div className="forms-grid">

        {/* Deposit Form */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>➕ Deposit Funds</h3>
          <form onSubmit={handleDeposit}>
            <div className="form-group">
              <label className="form-label">Amount (PKR)</label>
              <input
                type="number"
                className={`form-input ${inputError.deposit ? 'error-input' : ''}`}
                value={depositAmt}
                onChange={e => setDepositAmt(e.target.value)}
                placeholder="e.g. 5000"
                min="1"
              />
            </div>
            <button type="submit" className="btn btn-success">Deposit</button>
          </form>
        </div>

        {/* Withdraw Form */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>➖ Withdraw Funds</h3>
          <form onSubmit={handleWithdraw}>
            <div className="form-group">
              <label className="form-label">Amount (PKR)</label>
              <input
                type="number"
                className={`form-input ${inputError.withdraw ? 'error-input' : ''}`}
                value={withdrawAmt}
                onChange={e => setWithdrawAmt(e.target.value)}
                placeholder="e.g. 1000"
                min="1"
              />
            </div>
            <button type="submit" className="btn btn-danger">Withdraw</button>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { TxSkeleton }  from '../components/SkeletonLoader';
import { formatPKR }   from '../utils/formatPKR';
import { useToast }    from '../context/ToastContext';

const API = import.meta.env.VITE_API_URL || '';

export default function TransactionHistory() {
  const [txList,   setTxList]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all'); // all | credit | debit
  const toast = useToast();

  useEffect(() => {
    fetch(`${API}/api/transactions`)
      .then(r => r.json())
      .then(data => { setTxList(data); setLoading(false); })
      .catch(() => { toast('Failed to load transactions', 'error'); setLoading(false); });
  }, []);

  // Filter client-side from already-fetched array (no API call on search/filter)
  const filtered = useMemo(() => {
    let result = txList;
    if (filter !== 'all') result = result.filter(t => t.type === filter);
    if (search.trim())    result = result.filter(t =>
      t.description.toLowerCase().includes(search.toLowerCase())
    );
    return result;
  }, [txList, search, filter]);

  // Running totals — recalculate reactively when search/filter changes
  const totalCredits = filtered.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalDebits  = filtered.filter(t => t.type === 'debit') .reduce((s, t) => s + t.amount, 0);
  const netBalance   = totalCredits - totalDebits;

  return (
    <div className="page">
      <h1 className="page-title">📋 Transaction History</h1>

      {/* Running summary — recalculates on every filter/search change */}
      <div className="summary-bar">
        <div className="summary-item">
          <div className="summary-value" style={{ color: 'var(--success)' }}>{formatPKR(totalCredits)}</div>
          <div className="summary-label">Total Credits</div>
        </div>
        <div className="summary-item">
          <div className="summary-value" style={{ color: 'var(--danger)' }}>{formatPKR(totalDebits)}</div>
          <div className="summary-label">Total Debits</div>
        </div>
        <div className="summary-item">
          <div className="summary-value" style={{ color: netBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {formatPKR(netBalance)}
          </div>
          <div className="summary-label">Net Balance</div>
        </div>
      </div>

      {/* Live search — client-side, no API call */}
      <input
        className="form-input search-bar"
        placeholder="🔍 Search transactions..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Type filter */}
      <div className="filter-row">
        {['all', 'credit', 'debit'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'credit' ? '↑ Credits' : '↓ Debits'}
          </button>
        ))}
      </div>

      {/* Skeleton while loading */}
      {loading && <TxSkeleton />}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
          No transactions found.
        </div>
      )}

      {/* Transaction cards — staggered slide-in animation */}
      {!loading && filtered.map((tx, i) => (
        <div
          key={tx.id}
          className="tx-card"
          style={{ animationDelay: `${i * 100}ms` }} // card 1 at 0ms, card 2 at 100ms, etc.
        >
          {/* Animated type icon */}
          <div className={`tx-icon ${tx.type}`}>
            {tx.type === 'credit' ? '↑' : '↓'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tx.description}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {new Date(tx.timestamp).toLocaleString()}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, color: tx.type === 'credit' ? 'var(--success)' : 'var(--danger)' }}>
              {tx.type === 'credit' ? '+' : '-'}{formatPKR(tx.amount)}
            </div>
            <span className={`badge badge-${tx.type}`}>{tx.type}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

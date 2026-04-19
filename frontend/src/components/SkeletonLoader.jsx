// Animated skeleton loaders that mimic the shape of the content being loaded
// NOT a plain spinner - each matches the real UI shape

export function TxSkeleton() {
  return (
    <div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="tx-card" style={{ gap: '1rem' }}>
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 12, width: '40%' }} />
          </div>
          <div className="skeleton" style={{ height: 16, width: 80 }} />
        </div>
      ))}
    </div>
  );
}

export function LoanCardSkeleton() {
  return (
    <div className="loans-grid">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card" style={{ height: 220 }}>
          <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 24, width: 80, borderRadius: 20 }} />
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="stat-cards">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="stat-card">
          <div className="skeleton" style={{ height: 28, width: '60%', margin: '0 auto 8px' }} />
          <div className="skeleton" style={{ height: 12, width: '40%', margin: '0 auto' }} />
        </div>
      ))}
    </div>
  );
}

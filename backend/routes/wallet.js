const express = require('express');
const router  = express.Router();

// ── In-memory state ──────────────────────────────────────────────
let wallet = { balance: 10000, currency: 'PKR', owner: 'FintechFlow User' };
let transactions = [];
let txIdCounter  = 1;

// Helper: create and store a transaction record automatically on every deposit/withdrawal
function recordTransaction(type, amount, description) {
  const tx = {
    id:          txIdCounter++,
    type,                        // 'credit' | 'debit'
    amount,
    timestamp:   new Date().toISOString(),
    description
  };
  transactions.unshift(tx);      // newest first
  return tx;
}

// ── GET /api/wallet ──────────────────────────────────────────────
router.get('/wallet', (_req, res) => {
  res.json(wallet);
});

// ── POST /api/wallet/deposit ─────────────────────────────────────
router.post('/wallet/deposit', (req, res) => {
  const { amount } = req.body;

  if (amount === undefined || amount === null) {
    return res.status(400).json({ error: 'amount is required' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  wallet.balance += amount;
  const tx = recordTransaction('credit', amount, `Deposit of PKR ${amount.toLocaleString()}`);
  res.json({ wallet, transaction: tx });
});

// ── POST /api/wallet/withdraw ────────────────────────────────────
router.post('/wallet/withdraw', (req, res) => {
  const { amount } = req.body;

  if (amount === undefined || amount === null) {
    return res.status(400).json({ error: 'amount is required' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }
  if (wallet.balance < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  wallet.balance -= amount;
  const tx = recordTransaction('debit', amount, `Withdrawal of PKR ${amount.toLocaleString()}`);
  res.json({ wallet, transaction: tx });
});

// ── GET /api/transactions (?type=credit | ?type=debit) ───────────
router.get('/transactions', (req, res) => {
  const { type } = req.query;
  let result = transactions;
  if (type) result = transactions.filter(t => t.type === type);
  res.json(result);
});

module.exports = router;

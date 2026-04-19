const express = require('express');
const router  = express.Router();

// ── In-memory state ──────────────────────────────────────────────
let loans        = [];
let loanIdCounter = 1;

// ── POST /api/loans/apply ────────────────────────────────────────
router.post('/loans/apply', (req, res) => {
  const { applicant, amount, purpose, tenure } = req.body;

  // Validate ALL required fields are present
  if (!applicant || !amount || !purpose || !tenure) {
    return res.status(400).json({ error: 'All fields (applicant, amount, purpose, tenure) are required' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }
  if (amount < 5000 || amount > 5000000) {
    return res.status(400).json({ error: 'amount must be between PKR 5,000 and PKR 5,000,000' });
  }
  if (typeof tenure !== 'number' || tenure < 3 || tenure > 60) {
    return res.status(400).json({ error: 'tenure must be between 3 and 60 months' });
  }

  const loan = {
    id:        loanIdCounter++,
    applicant,
    amount,
    purpose,
    tenure,
    status:    'pending',          // always starts as pending
    appliedAt: new Date().toISOString()
  };

  loans.push(loan);
  res.status(201).json(loan);
});

// ── GET /api/loans ───────────────────────────────────────────────
router.get('/loans', (_req, res) => {
  res.json(loans);
});

// ── PATCH /api/loans/:id/status ──────────────────────────────────
router.patch('/loans/:id/status', (req, res) => {
  const id     = parseInt(req.params.id, 10);
  const { status } = req.body;

  const validStatuses = ['approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  const loan = loans.find(l => l.id === id);
  if (!loan) {
    return res.status(404).json({ error: `Loan with id ${id} not found` });
  }

  loan.status = status;
  res.json(loan);
});

module.exports = router;

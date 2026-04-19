const express = require('express');
const cors = require('cors');
const walletRouter = require('./routes/wallet');
const loansRouter = require('./routes/loans');

const app = express();

// Allow requests from any origin (update origin to your Vercel URL in production)
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Mount routers
app.use('/api', walletRouter);
app.use('/api', loansRouter);

// ── EMI Calculator (computed SERVER-SIDE, not frontend) ──
// Formula: EMI = [P × r × (1+r)^n] / [(1+r)^n – 1]
// where r = annualRate / 100 / 12  and  n = months
app.get('/api/emi-calculator', (req, res) => {
  const { principal, annualRate, months } = req.query;

  if (!principal || !annualRate || !months) {
    return res.status(400).json({ error: 'principal, annualRate, and months query params are all required' });
  }

  const P = parseFloat(principal);
  const r = parseFloat(annualRate) / 100 / 12;
  const n = parseInt(months, 10);

  if (isNaN(P) || P <= 0)   return res.status(400).json({ error: 'principal must be a positive number' });
  if (isNaN(r) || r <= 0)   return res.status(400).json({ error: 'annualRate must be a positive number' });
  if (isNaN(n) || n <= 0)   return res.status(400).json({ error: 'months must be a positive integer' });

  const emi          = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayable = emi * n;
  const totalInterest = totalPayable - P;

  res.json({
    emi:           parseFloat(emi.toFixed(2)),
    totalPayable:  parseFloat(totalPayable.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    monthlyRate:   parseFloat(r.toFixed(8)),
    months:        n
  });
});

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'FintechFlow backend running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`FintechFlow backend live on port ${PORT}`));

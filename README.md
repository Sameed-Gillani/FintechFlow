# 💸 FintechFlow — Personal Finance & Loan Manager

A full-stack fintech web application built with React.js and Node.js/Express.js.

**Student Name:** ______________________________
**Roll No:** ______________________________

---

## Project Description

FintechFlow is a personal finance management app that lets users manage a digital wallet (deposits/withdrawals), apply for micro-loans, and track transactions. All data is stored in-memory on the Express server (no database).

---

## How to Run Locally

### Backend
```bash
cd backend
npm install
npm run dev        # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
# Create .env.local with:
# VITE_API_URL=http://localhost:5000
npm run dev        # runs on http://localhost:5173
```

---

## API Endpoint Table

| Method | Endpoint                  | Description                              | Body / Params               | Status      |
|--------|---------------------------|------------------------------------------|-----------------------------|-------------|
| GET    | /api/wallet               | Get wallet balance & info                | —                           | 200         |
| POST   | /api/wallet/deposit       | Deposit funds — rejects if amount ≤ 0   | `{ amount: number }`        | 200 / 400   |
| POST   | /api/wallet/withdraw      | Withdraw — rejects if insufficient      | `{ amount: number }`        | 200 / 400   |
| GET    | /api/transactions         | All transactions, newest first           | `?type=credit\|debit`       | 200         |
| POST   | /api/loans/apply          | Submit loan application                  | `{ applicant, amount, purpose, tenure }` | 201 / 400 |
| GET    | /api/loans                | All loan applications                    | —                           | 200         |
| PATCH  | /api/loans/:id/status     | Approve or reject a loan                 | `{ status: 'approved'\|'rejected' }` | 200 / 400 / 404 |
| GET    | /api/emi-calculator       | Server-side EMI calculation              | `?principal=&annualRate=&months=` | 200 / 400 |

---

## Submission Links

| | URL |
|---|---|
| **GitHub Repo** | |
| **Frontend (Vercel)** | |
| **Backend (Render)** | |

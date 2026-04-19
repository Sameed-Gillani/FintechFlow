import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider }  from './context/ThemeContext';
import { ToastProvider }  from './context/ToastContext';
import Navbar             from './components/Navbar';
import WalletDashboard    from './pages/WalletDashboard';
import TransactionHistory from './pages/TransactionHistory';
import LoanApplication    from './pages/LoanApplication';
import LoanStatus         from './pages/LoanStatus';
import EMICalculator      from './pages/EMICalculator';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/"             element={<WalletDashboard />}    />
            <Route path="/transactions" element={<TransactionHistory />} />
            <Route path="/apply"        element={<LoanApplication />}    />
            <Route path="/loans"        element={<LoanStatus />}         />
            <Route path="/emi"          element={<EMICalculator />}      />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

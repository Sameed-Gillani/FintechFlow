import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/',            label: '💳 Wallet'       },
  { to: '/transactions', label: '📋 Transactions' },
  { to: '/apply',        label: '📝 Apply Loan'  },
  { to: '/loans',        label: '📊 Loan Status' },
  { to: '/emi',          label: '🧮 EMI Calc'    }
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <span className="navbar-logo">💸 <span>FintechFlow</span></span>

      <div className="navbar-links">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}
          >
            {label}
          </NavLink>
        ))}
      </div>

      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </nav>
  );
}

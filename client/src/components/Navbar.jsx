import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Donations', to: '/donations' },
  { label: 'About', to: '/about' },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="container nav-container">
        <Link to="/" className="brand" aria-label="GiveBridge home">
          <span className="brand-mark">G</span>
          <span>GiveBridge</span>
        </Link>

        <nav className={`nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/profile" className="nav-user">{user.name}</Link>
              <button type="button" className="btn btn-light" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-light">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>

        <button
          className="menu-toggle"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}

export default Navbar;

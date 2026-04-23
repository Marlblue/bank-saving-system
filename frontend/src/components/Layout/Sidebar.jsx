import { NavLink } from 'react-router-dom';
import { HiHome, HiUsers, HiCreditCard, HiCollection, HiMenu, HiX } from 'react-icons/hi';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', path: '/', icon: <HiHome /> },
  { label: 'Customers', path: '/customers', icon: <HiUsers /> },
  { label: 'Accounts', path: '/accounts', icon: <HiCreditCard /> },
  { label: 'Deposito Types', path: '/deposito-types', icon: <HiCollection /> },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed',
          top: '18px',
          left: '16px',
          zIndex: 200,
          display: 'none',
        }}
        id="mobile-menu-btn"
        aria-label="Open menu"
      >
        <HiMenu size={24} />
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏦</div>
          <h1>
            BankSave
            <span>Saving System</span>
          </h1>
          {mobileOpen && (
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setMobileOpen(false)}
              style={{ marginLeft: 'auto' }}
              aria-label="Close menu"
            >
              <HiX size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Main Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: 'var(--space-lg)', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
            Bank Saving System v1.0
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}

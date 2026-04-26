import { NavLink } from 'react-router-dom';
import { HiHome, HiUsers, HiCreditCard, HiCollection, HiX } from 'react-icons/hi';

const navItems = [
  { label: 'Dashboard', path: '/', icon: <HiHome /> },
  { label: 'Customers', path: '/customers', icon: <HiUsers /> },
  { label: 'Accounts', path: '/accounts', icon: <HiCreditCard /> },
  { label: 'Deposito Types', path: '/deposito-types', icon: <HiCollection /> },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="mobile-only"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 99,
          }}
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏦</div>
          <h1 style={{ flex: 1 }}>
            BankSave
            <span>Saving System</span>
          </h1>
          <button
            className="btn btn-ghost btn-icon mobile-only"
            onClick={onClose}
            style={{ marginLeft: 'auto' }}
            aria-label="Close menu"
          >
            <HiX size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Main Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
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
    </>
  );
}

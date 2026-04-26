import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { HiMenu } from 'react-icons/hi';

const pageTitles = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your banking system' },
  '/customers': { title: 'Customers', subtitle: 'Manage your customer base' },
  '/accounts': { title: 'Accounts', subtitle: 'Manage savings accounts' },
  '/deposito-types': { title: 'Deposito Types', subtitle: 'Configure deposit packages' },
};

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const pathBase = '/' + (location.pathname.split('/')[1] || '');
  const pageInfo = pageTitles[pathBase] || { title: 'Bank Saving System', subtitle: '' };

  return (
    <div className="app-layout">
      <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <button 
            className="btn btn-ghost btn-icon mobile-only" 
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <HiMenu size={24} />
          </button>
          <div>
            <h2 className="header-title">{pageInfo.title}</h2>
            <p className="header-subtitle">{pageInfo.subtitle}</p>
          </div>
        </div>
      </header>

      <main className="main-content fade-in">
        <Outlet />
      </main>
    </div>
  );
}

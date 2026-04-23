import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const pageTitles = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your banking system' },
  '/customers': { title: 'Customers', subtitle: 'Manage your customer base' },
  '/accounts': { title: 'Accounts', subtitle: 'Manage savings accounts' },
  '/deposito-types': { title: 'Deposito Types', subtitle: 'Configure deposit packages' },
};

export default function Layout() {
  const location = useLocation();
  const pathBase = '/' + (location.pathname.split('/')[1] || '');
  const pageInfo = pageTitles[pathBase] || { title: 'Bank Saving System', subtitle: '' };

  return (
    <div className="app-layout">
      <Sidebar />
      <header className="header">
        <div>
          <h2 className="header-title">{pageInfo.title}</h2>
          <p className="header-subtitle">{pageInfo.subtitle}</p>
        </div>
      </header>
      <main className="main-content fade-in">
        <Outlet />
      </main>
    </div>
  );
}

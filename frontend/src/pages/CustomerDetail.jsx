import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/common/Toast';
import useCustomerDetail from '../hooks/useCustomerDetail';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { HiArrowLeft, HiCreditCard } from 'react-icons/hi';

export default function CustomerDetail() {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const { customer, loading } = useCustomerDetail(id, toast, navigate);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  if (!customer) return null;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/customers')}>
            <HiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">{customer.name}</h1>
            <p className="page-description">Customer since {formatDateTime(customer.created_at)}</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Customer ID</div>
            <div className="detail-value" style={{ fontSize: 'var(--font-size-sm)', fontFamily: 'monospace' }}>
              {customer.id}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Name</div>
            <div className="detail-value">{customer.name}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Total Accounts</div>
            <div className="detail-value highlight">{customer.accounts?.length || 0}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Total Balance</div>
            <div className="detail-value highlight">
              {formatCurrency(customer.accounts?.reduce((sum, a) => sum + a.balance, 0))}
            </div>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">Accounts</h3>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/accounts')}>
            <HiCreditCard /> Manage Accounts
          </button>
        </div>
        <div className="table-wrapper">
          {customer.accounts?.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Account ID</th>
                  <th>Deposito Type</th>
                  <th>Yearly Return</th>
                  <th>Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customer.accounts.map((acc) => (
                  <tr key={acc.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}>
                      {acc.id.substring(0, 8)}...
                    </td>
                    <td>
                      <span className="badge badge-cyan">{acc.deposito_type_name}</span>
                    </td>
                    <td>{acc.yearly_return}%</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(acc.balance)}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/accounts/${acc.id}`)}
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">💳</div>
              <p>This customer has no accounts yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

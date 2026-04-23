import { useState, useEffect } from 'react';
import dashboardService from '../services/dashboardService';
import { HiUsers, HiCreditCard, HiCash, HiCollection } from 'react-icons/hi';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await dashboardService.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card" onClick={() => navigate('/customers')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon emerald"><HiUsers size={24} /></div>
          <div className="stat-info">
            <h3>Total Customers</h3>
            <div className="stat-value">{stats?.customer_count || 0}</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/accounts')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon cyan"><HiCreditCard size={24} /></div>
          <div className="stat-info">
            <h3>Total Accounts</h3>
            <div className="stat-value">{stats?.account_count || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><HiCash size={24} /></div>
          <div className="stat-info">
            <h3>Total Balance</h3>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>{formatCurrency(stats?.total_balance)}</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/deposito-types')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon blue"><HiCollection size={24} /></div>
          <div className="stat-info">
            <h3>Deposito Types</h3>
            <div className="stat-value">{stats?.deposito_type_count || 0}</div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">Recent Transactions</h3>
        </div>
        <div className="table-wrapper">
          {stats?.recent_transactions?.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td>{formatDate(txn.transaction_date)}</td>
                    <td style={{ fontWeight: 600 }}>{txn.customer_name}</td>
                    <td>
                      <span className={`txn-type ${txn.type}`}>
                        {txn.type === 'deposit' ? '↗ Deposit' : '↙ Withdraw'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(txn.amount)}</td>
                    <td>{formatCurrency(txn.balance_after)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p>No transactions yet. Start by creating a customer and making a deposit!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

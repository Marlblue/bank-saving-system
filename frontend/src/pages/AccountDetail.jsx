import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import accountService from '../services/accountService';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { HiArrowLeft, HiPlus, HiMinus, HiCash } from 'react-icons/hi';

export default function AccountDetail() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  // Deposit state
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [depositing, setDepositing] = useState(false);

  // Withdraw state
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDate, setWithdrawDate] = useState(new Date().toISOString().split('T')[0]);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState(null);

  useEffect(() => {
    loadAccount();
  }, [id]);

  const loadAccount = async () => {
    try {
      const [accRes, txnRes] = await Promise.all([
        accountService.getById(id),
        accountService.getTransactions(id),
      ]);
      setAccount(accRes.data);
      setTransactions(txnRes.data);
    } catch (err) {
      toast(err.message, 'error');
      navigate('/accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast('Amount must be a positive number', 'error'); return;
    }
    if (!depositDate) { toast('Please select a date', 'error'); return; }

    setDepositing(true);
    try {
      const res = await accountService.deposit(id, {
        amount: parseFloat(depositAmount),
        transaction_date: depositDate,
      });
      toast(`Deposit successful! New balance: ${formatCurrency(res.data.new_balance)}`, 'success');
      setDepositOpen(false);
      setDepositAmount('');
      loadAccount();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDepositing(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast('Amount must be a positive number', 'error'); return;
    }
    if (!withdrawDate) { toast('Please select a date', 'error'); return; }

    setWithdrawing(true);
    try {
      const res = await accountService.withdraw(id, {
        amount: parseFloat(withdrawAmount),
        transaction_date: withdrawDate,
      });
      setWithdrawResult(res.data.calculation);
      toast('Withdrawal successful!', 'success');
      loadAccount();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  if (!account) return null;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/accounts')}>
            <HiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">Account Detail</h1>
            <p className="page-description">{account.customer_name}'s {account.deposito_type_name} Account</p>
          </div>
        </div>
        <div className="btn-group">
          <button className="btn btn-primary" onClick={() => { setDepositOpen(true); setDepositAmount(''); }} id="btn-deposit">
            <HiPlus /> Deposit
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => { setWithdrawOpen(true); setWithdrawAmount(''); setWithdrawResult(null); }}
            disabled={account.balance <= 0}
            id="btn-withdraw"
          >
            <HiMinus /> Withdraw
          </button>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Account ID</div>
            <div className="detail-value" style={{ fontSize: 'var(--font-size-sm)', fontFamily: 'monospace' }}>
              {account.id}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Customer</div>
            <div className="detail-value">{account.customer_name}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Deposito Type</div>
            <div className="detail-value">
              <span className="badge badge-cyan">{account.deposito_type_name}</span>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Yearly Return</div>
            <div className="detail-value" style={{ color: 'var(--accent-primary)' }}>
              {account.yearly_return}% <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                (monthly: {(account.yearly_return / 12).toFixed(4)}%)
              </span>
            </div>
          </div>
          <div className="detail-item" style={{ gridColumn: 'span 2' }}>
            <div className="detail-label">Current Balance</div>
            <div className="detail-value highlight" style={{ fontSize: 'var(--font-size-3xl)' }}>
              {formatCurrency(account.balance)}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">
            <HiCash style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Transaction History
          </h3>
          <span className="badge badge-blue">{transactions.length} transactions</span>
        </div>
        <div className="table-wrapper">
          {transactions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Interest Earned</th>
                  <th>Months</th>
                  <th>Balance Before</th>
                  <th>Balance After</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td>{formatDate(txn.transaction_date)}</td>
                    <td>
                      <span className={`txn-type ${txn.type}`}>
                        {txn.type === 'deposit' ? '↗ Deposit' : '↙ Withdraw'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(txn.amount)}</td>
                    <td style={{ color: txn.interest_earned > 0 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                      {txn.interest_earned ? `+${formatCurrency(txn.interest_earned)}` : '-'}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {txn.months_elapsed != null ? `${txn.months_elapsed} mo` : '-'}
                    </td>
                    <td>{formatCurrency(txn.balance_before)}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(txn.balance_after)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>No transactions yet. Make your first deposit!</p>
            </div>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      <Modal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        title="Deposit Money"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDepositOpen(false)} disabled={depositing}>Cancel</button>
            <button className="btn btn-primary" onClick={handleDeposit} disabled={depositing}>
              {depositing ? 'Processing...' : 'Deposit'}
            </button>
          </>
        }
      >
        <form onSubmit={handleDeposit}>
          <div className="form-group">
            <label className="form-label">Amount (IDR) <span className="required">*</span></label>
            <input
              type="number"
              className="form-input"
              placeholder="Enter deposit amount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              min="1"
              step="1"
              autoFocus
              id="input-deposit-amount"
            />
            {depositAmount && parseFloat(depositAmount) > 0 && (
              <div className="form-help" style={{ color: 'var(--accent-primary)' }}>
                New balance will be: {formatCurrency(account.balance + parseFloat(depositAmount))}
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Deposit Date <span className="required">*</span></label>
            <input
              type="date"
              className="form-input"
              value={depositDate}
              onChange={(e) => setDepositDate(e.target.value)}
              id="input-deposit-date"
            />
          </div>
        </form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={withdrawOpen}
        onClose={() => { setWithdrawOpen(false); setWithdrawResult(null); }}
        title="Withdraw Money"
        footer={
          !withdrawResult ? (
            <>
              <button className="btn btn-secondary" onClick={() => setWithdrawOpen(false)} disabled={withdrawing}>Cancel</button>
              <button className="btn btn-danger" onClick={handleWithdraw} disabled={withdrawing}>
                {withdrawing ? 'Processing...' : 'Withdraw'}
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => { setWithdrawOpen(false); setWithdrawResult(null); }}>
              Done
            </button>
          )
        }
      >
        {!withdrawResult ? (
          <form onSubmit={handleWithdraw}>
            <div className="form-group">
              <label className="form-label">Amount (IDR) <span className="required">*</span></label>
              <input
                type="number"
                className="form-input"
                placeholder="Enter withdrawal amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="1"
                step="1"
                autoFocus
                id="input-withdraw-amount"
              />
              <div className="form-help">
                Current balance: {formatCurrency(account.balance)} (interest will be calculated)
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Withdrawal Date <span className="required">*</span></label>
              <input
                type="date"
                className="form-input"
                value={withdrawDate}
                onChange={(e) => setWithdrawDate(e.target.value)}
                id="input-withdraw-date"
              />
              <div className="form-help">
                Interest is calculated from the last deposit date to this date.
              </div>
            </div>
          </form>
        ) : (
          <div className="calc-result">
            <h4>💰 Withdrawal Calculation Breakdown</h4>
            <div className="calc-row">
              <span>Starting Balance</span>
              <span>{formatCurrency(withdrawResult.starting_balance)}</span>
            </div>
            <div className="calc-row">
              <span>Yearly Return</span>
              <span>{withdrawResult.yearly_return}%</span>
            </div>
            <div className="calc-row">
              <span>Monthly Return</span>
              <span>{(withdrawResult.monthly_return * 100).toFixed(4)}%</span>
            </div>
            <div className="calc-row">
              <span>Months Elapsed</span>
              <span>{withdrawResult.months_elapsed} months</span>
            </div>
            <div className="calc-row" style={{ color: 'var(--accent-primary)' }}>
              <span>Interest Earned</span>
              <span>+{formatCurrency(withdrawResult.interest_earned)}</span>
            </div>
            <div className="calc-row">
              <span>Balance with Interest</span>
              <span>{formatCurrency(withdrawResult.ending_balance_with_interest)}</span>
            </div>
            <div className="calc-row" style={{ color: 'var(--accent-danger)' }}>
              <span>Withdrawal Amount</span>
              <span>-{formatCurrency(withdrawResult.withdrawal_amount)}</span>
            </div>
            <div className="calc-row">
              <span>Final Balance</span>
              <span>{formatCurrency(withdrawResult.final_balance)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

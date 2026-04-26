import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { HiPlus, HiPencil, HiTrash, HiEye } from 'react-icons/hi';
import useAccounts from '../hooks/useAccounts';

export default function Accounts() {
  const toast = useToast();
  const navigate = useNavigate();
  const {
    accounts,
    customers,
    depositoTypes,
    filtered,
    loading,
    search,
    setSearch,
    modalOpen,
    editing,
    formCustomerId,
    setFormCustomerId,
    formDepositoTypeId,
    setFormDepositoTypeId,
    saving,
    deleteTarget,
    setDeleteTarget,
    deleting,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  } = useAccounts(toast);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="page-description">{accounts.length} total accounts</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal} id="btn-create-account">
          <HiPlus /> Add Account
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <input
            type="text"
            className="form-input"
            placeholder="Search by customer or deposito type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '100%', width: '350px' }}
            id="search-accounts"
          />
          <span className="mobile-only" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Swipe left to see more →
          </span>
        </div>
        <div className="table-wrapper">
          {filtered.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Deposito Type</th>
                  <th>Yearly Return</th>
                  <th>Balance</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((account) => (
                  <tr key={account.id}>
                    <td style={{ fontWeight: 600 }}>{account.customer_name}</td>
                    <td>
                      <span className="badge badge-cyan">{account.deposito_type_name}</span>
                    </td>
                    <td>{account.yearly_return}%</td>
                    <td style={{ fontWeight: 700, color: account.balance > 0 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                      {formatCurrency(account.balance)}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                      {formatDateTime(account.created_at)}
                    </td>
                    <td>
                      <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/accounts/${account.id}`)} title="View details">
                          <HiEye />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(account)} title="Edit">
                          <HiPencil />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeleteTarget(account)}
                          title="Delete"
                          style={{ color: 'var(--accent-danger)' }}
                        >
                          <HiTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">💳</div>
              <p>{search ? 'No accounts match your search' : 'No accounts yet. Create one to start saving!'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Account' : 'Create Account'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          {!editing && (
            <div className="form-group">
              <label className="form-label">Customer <span className="required">*</span></label>
              <select
                className="form-select"
                value={formCustomerId}
                onChange={(e) => setFormCustomerId(e.target.value)}
                id="select-customer"
              >
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {customers.length === 0 && (
                <div className="form-error">No customers available. Create a customer first.</div>
              )}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Deposito Type <span className="required">*</span></label>
            <select
              className="form-select"
              value={formDepositoTypeId}
              onChange={(e) => setFormDepositoTypeId(e.target.value)}
              id="select-deposito-type"
            >
              <option value="">Select a deposito type</option>
              {depositoTypes.map((dt) => (
                <option key={dt.id} value={dt.id}>{dt.name} ({dt.yearly_return}% yearly)</option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Account"
        message={`Are you sure you want to delete this account for "${deleteTarget?.customer_name}"? All transaction history will be lost.`}
        loading={deleting}
      />
    </div>
  );
}

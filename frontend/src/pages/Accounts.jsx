import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import accountService from '../services/accountService';
import customerService from '../services/customerService';
import depositoTypeService from '../services/depositoTypeService';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { HiPlus, HiPencil, HiTrash, HiEye } from 'react-icons/hi';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [depositoTypes, setDepositoTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formDepositoTypeId, setFormDepositoTypeId] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accRes, custRes, dtRes] = await Promise.all([
        accountService.getAll(),
        customerService.getAll(),
        depositoTypeService.getAll(),
      ]);
      setAccounts(accRes.data);
      setCustomers(custRes.data);
      setDepositoTypes(dtRes.data);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditing(null);
    setFormCustomerId('');
    setFormDepositoTypeId('');
    setModalOpen(true);
  };

  const openEditModal = (account) => {
    setEditing(account);
    setFormCustomerId(account.customer_id);
    setFormDepositoTypeId(account.deposito_type_id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && !formCustomerId) { toast('Please select a customer', 'error'); return; }
    if (!formDepositoTypeId) { toast('Please select a deposito type', 'error'); return; }

    setSaving(true);
    try {
      if (editing) {
        await accountService.update(editing.id, { deposito_type_id: formDepositoTypeId });
        toast('Account updated successfully', 'success');
      } else {
        await accountService.create({ customer_id: formCustomerId, deposito_type_id: formDepositoTypeId });
        toast('Account created successfully', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await accountService.delete(deleteTarget.id);
      toast('Account deleted successfully', 'success');
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = accounts.filter((a) =>
    a.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    a.deposito_type_name.toLowerCase().includes(search.toLowerCase())
  );

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
            style={{ maxWidth: 350 }}
            id="search-accounts"
          />
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
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Account' : 'Create Account'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
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

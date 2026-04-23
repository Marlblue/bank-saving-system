import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatDateTime } from '../utils/formatters';
import { HiPlus, HiPencil, HiTrash, HiEye } from 'react-icons/hi';
import useCustomers from '../hooks/useCustomers';

export default function Customers() {
  const toast = useToast();
  const navigate = useNavigate();
  const {
    customers,
    filtered,
    loading,
    search,
    setSearch,
    modalOpen,
    editingCustomer,
    formName,
    setFormName,
    saving,
    deleteTarget,
    setDeleteTarget,
    deleting,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  } = useCustomers(toast);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-description">{customers.length} total customers</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal} id="btn-create-customer">
          <HiPlus /> Add Customer
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <input
            type="text"
            className="form-input"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 300 }}
            id="search-customers"
          />
        </div>
        <div className="table-wrapper">
          {filtered.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id}>
                    <td style={{ fontWeight: 600 }}>{customer.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatDateTime(customer.created_at)}</td>
                    <td>
                      <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/customers/${customer.id}`)}
                          title="View details"
                        >
                          <HiEye />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEditModal(customer)}
                          title="Edit"
                        >
                          <HiPencil />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeleteTarget(customer)}
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
              <div className="empty-state-icon">👤</div>
              <p>{search ? 'No customers match your search' : 'No customers yet. Create one to get started!'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingCustomer ? 'Edit Customer' : 'Create Customer'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editingCustomer ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Customer Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter customer name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              autoFocus
              maxLength={100}
              id="input-customer-name"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import depositoTypeService from '../services/depositoTypeService';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatDateTime } from '../utils/formatters';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

export default function DepositoTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formName, setFormName] = useState('');
  const [formReturn, setFormReturn] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      const res = await depositoTypeService.getAll();
      setTypes(res.data);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditing(null);
    setFormName('');
    setFormReturn('');
    setModalOpen(true);
  };

  const openEditModal = (type) => {
    setEditing(type);
    setFormName(type.name);
    setFormReturn(type.yearly_return.toString());
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) { toast('Name is required', 'error'); return; }
    if (!formReturn || isNaN(formReturn) || parseFloat(formReturn) <= 0) {
      toast('Yearly return must be a positive number', 'error'); return;
    }
    setSaving(true);
    try {
      const data = { name: formName.trim(), yearly_return: parseFloat(formReturn) };
      if (editing) {
        await depositoTypeService.update(editing.id, data);
        toast('Deposito type updated successfully', 'success');
      } else {
        await depositoTypeService.create(data);
        toast('Deposito type created successfully', 'success');
      }
      setModalOpen(false);
      loadTypes();
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
      await depositoTypeService.delete(deleteTarget.id);
      toast('Deposito type deleted successfully', 'success');
      setDeleteTarget(null);
      loadTypes();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const tierColors = {
    'bronze': 'badge-amber',
    'silver': 'badge-blue',
    'gold': 'badge-emerald',
  };

  const getBadgeClass = (name) => {
    const lower = name.toLowerCase();
    for (const key in tierColors) {
      if (lower.includes(key)) return tierColors[key];
    }
    return 'badge-cyan';
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Deposito Types</h1>
          <p className="page-description">{types.length} deposit packages available</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal} id="btn-create-deposito">
          <HiPlus /> Add Deposito Type
        </button>
      </div>

      {/* Cards Grid */}
      <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {types.map((type) => (
          <div className="stat-card" key={type.id} style={{ flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
              <span className={`badge ${getBadgeClass(type.name)}`}>{type.name}</span>
              <div className="btn-group">
                <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(type)}>
                  <HiPencil />
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setDeleteTarget(type)}
                  style={{ color: 'var(--accent-danger)' }}
                >
                  <HiTrash />
                </button>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {type.yearly_return}%
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                Yearly Return
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
                Monthly: {(type.yearly_return / 12).toFixed(4)}%
              </div>
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-sm)', width: '100%' }}>
              Created: {formatDateTime(type.created_at)}
            </div>
          </div>
        ))}
      </div>

      {types.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p>No deposito types yet. Create your first package!</p>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Deposito Type' : 'Create Deposito Type'}
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
          <div className="form-group">
            <label className="form-label">Name <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Deposito Platinum"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              autoFocus
              id="input-deposito-name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Yearly Return (%) <span className="required">*</span></label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 5"
              value={formReturn}
              onChange={(e) => setFormReturn(e.target.value)}
              step="0.01"
              min="0.01"
              id="input-deposito-return"
            />
            <div className="form-help">
              Monthly return will be: {formReturn && !isNaN(formReturn) ? (parseFloat(formReturn) / 12).toFixed(4) : '0.0000'}%
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Deposito Type"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}

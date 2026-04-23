import { useState, useEffect, useCallback } from 'react';
import depositoTypeService from '../services/depositoTypeService';

/**
 * Controller hook for the Deposito Types page.
 * Manages deposito type CRUD operations and modal state.
 */
export default function useDepositoTypes(toast) {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formName, setFormName] = useState('');
  const [formReturn, setFormReturn] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = useCallback(async () => {
    try {
      const res = await depositoTypeService.getAll();
      setTypes(res.data);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

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

  const closeModal = () => setModalOpen(false);

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

  return {
    types,
    loading,
    modalOpen,
    editing,
    formName,
    setFormName,
    formReturn,
    setFormReturn,
    saving,
    deleteTarget,
    setDeleteTarget,
    deleting,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  };
}

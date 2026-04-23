import { useState, useEffect, useCallback } from 'react';
import customerService from '../services/customerService';

/**
 * Controller hook for the Customers list page.
 * Manages customer CRUD operations, search, and modal state.
 */
export default function useCustomers(toast) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formName, setFormName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await customerService.getAll();
      setCustomers(res.data);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormName('');
    setModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormName(customer.name);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast('Name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer.id, { name: formName.trim() });
        toast('Customer updated successfully', 'success');
      } else {
        await customerService.create({ name: formName.trim() });
        toast('Customer created successfully', 'success');
      }
      setModalOpen(false);
      loadCustomers();
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
      await customerService.delete(deleteTarget.id);
      toast('Customer deleted successfully', 'success');
      setDeleteTarget(null);
      loadCustomers();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return {
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
  };
}

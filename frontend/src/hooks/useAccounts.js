import { useState, useEffect, useCallback } from 'react';
import accountService from '../services/accountService';
import customerService from '../services/customerService';
import depositoTypeService from '../services/depositoTypeService';

/**
 * Controller hook for the Accounts list page.
 * Manages account CRUD operations, related data loading, search, and modal state.
 */
export default function useAccounts(toast) {
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
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
  }, [toast]);

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

  const closeModal = () => setModalOpen(false);

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

  return {
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
  };
}

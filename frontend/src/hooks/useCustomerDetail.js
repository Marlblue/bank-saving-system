import { useState, useEffect, useCallback } from 'react';
import customerService from '../services/customerService';

/**
 * Controller hook for the Customer Detail page.
 * Manages single customer data loading.
 */
export default function useCustomerDetail(id, toast, navigate) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = useCallback(async () => {
    try {
      const res = await customerService.getById(id);
      setCustomer(res.data);
    } catch (err) {
      toast(err.message, 'error');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  }, [id, toast, navigate]);

  return { customer, loading };
}

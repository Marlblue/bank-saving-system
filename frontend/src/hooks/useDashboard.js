import { useState, useEffect } from 'react';
import dashboardService from '../services/dashboardService';

/**
 * Controller hook for the Dashboard page.
 * Manages dashboard statistics loading and state.
 */
export default function useDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return { stats, loading };
}

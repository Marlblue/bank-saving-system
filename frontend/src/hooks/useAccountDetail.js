import { useState, useEffect, useCallback } from 'react';
import accountService from '../services/accountService';
import { formatCurrency } from '../utils/formatters';

/**
 * Controller hook for the Account Detail page.
 * Manages account data, transactions, deposit, and withdrawal logic
 * including interest calculation display.
 */
export default function useAccountDetail(id, toast, navigate) {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const loadAccount = useCallback(async () => {
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
  }, [id, toast, navigate]);

  const openDeposit = () => {
    setDepositOpen(true);
    setDepositAmount('');
  };

  const closeDeposit = () => setDepositOpen(false);

  const openWithdraw = () => {
    setWithdrawOpen(true);
    setWithdrawAmount('');
    setWithdrawResult(null);
  };

  const closeWithdraw = () => {
    setWithdrawOpen(false);
    setWithdrawResult(null);
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

  return {
    account,
    transactions,
    loading,
    // Deposit
    depositOpen,
    depositAmount,
    setDepositAmount,
    depositDate,
    setDepositDate,
    depositing,
    openDeposit,
    closeDeposit,
    handleDeposit,
    // Withdraw
    withdrawOpen,
    withdrawAmount,
    setWithdrawAmount,
    withdrawDate,
    setWithdrawDate,
    withdrawing,
    withdrawResult,
    openWithdraw,
    closeWithdraw,
    handleWithdraw,
  };
}

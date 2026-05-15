import { useState, useEffect, useCallback } from 'react';
import { Customer, Transaction } from '@/types';
import {
  getCustomers,
  getCustomer,
  getCustomerTransactions,
  getTransactions,
  saveTransaction,
  updateTransaction,
  deleteTransaction,
  deleteCustomer,
} from './database';

export function useCustomers() {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await getCustomers();
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { customers: data, loading, refresh };
}

export function useCustomerDetail(id: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const c = await getCustomer(id);
    const t = await getCustomerTransactions(id);
    setCustomer(c || null);
    setTransactions(t);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return { customer, transactions, loading, refresh: load };
}

export function useTransactions() {
  const [data, setData] = useState<Transaction[]>([]);

  const refresh = useCallback(async () => {
    const result = await getTransactions();
    setData(result);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { transactions: data, refresh };
}

export function useAddTransaction() {
  const [saving, setSaving] = useState(false);

  const add = async (
    customerId: string,
    type: 'utang' | 'bayar',
    amount: number,
    description: string,
    date: Date,
    dueDate?: Date,
  ) => {
    setSaving(true);
    await saveTransaction(customerId, type, amount, description, date, dueDate);
    setSaving(false);
  };

  return { add, saving };
}

export function useEditTransaction() {
  const [saving, setSaving] = useState(false);

  const edit = async (
    transactionId: string,
    updates: Parameters<typeof updateTransaction>[1],
  ) => {
    setSaving(true);
    await updateTransaction(transactionId, updates);
    setSaving(false);
  };

  const remove = async (transactionId: string) => {
    setSaving(true);
    await deleteTransaction(transactionId);
    setSaving(false);
  };

  return { edit, remove, saving };
}

export function useDeleteCustomer() {
  const [deleting, setDeleting] = useState(false);

  const remove = async (customerId: string): Promise<boolean> => {
    setDeleting(true);
    const result = await deleteCustomer(customerId);
    setDeleting(false);
    return result;
  };

  return { remove, deleting };
}

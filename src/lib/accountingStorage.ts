'use client';

import {
  Expense,
  Income,
  Invoice,
  Vendor,
  InvoicePayment,
  InvoiceLineItem,
} from './types';
import {
  initialExpenses,
  initialIncome,
  initialInvoices,
  initialVendors,
} from './data';

// Storage keys
const STORAGE_KEYS = {
  expenses: 'caterpro_expenses',
  income: 'caterpro_income',
  invoices: 'caterpro_invoices',
  vendors: 'caterpro_vendors',
  initialized: 'caterpro_accounting_initialized',
};

// Check if we're in browser
const isBrowser = typeof window !== 'undefined';

// Initialize storage with sample data if not already initialized
export const initializeAccountingStorage = (): void => {
  if (!isBrowser) return;

  const isInitialized = localStorage.getItem(STORAGE_KEYS.initialized);
  if (!isInitialized) {
    localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(initialExpenses));
    localStorage.setItem(STORAGE_KEYS.income, JSON.stringify(initialIncome));
    localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(initialInvoices));
    localStorage.setItem(STORAGE_KEYS.vendors, JSON.stringify(initialVendors));
    localStorage.setItem(STORAGE_KEYS.initialized, 'true');
  }
};

// =====================================================
// EXPENSES STORAGE
// =====================================================

export const loadExpenses = (): Expense[] => {
  if (!isBrowser) return initialExpenses;
  initializeAccountingStorage();
  const data = localStorage.getItem(STORAGE_KEYS.expenses);
  return data ? JSON.parse(data) : initialExpenses;
};

export const saveExpenses = (expenses: Expense[]): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses));
};

export const addExpense = (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Expense => {
  const expenses = loadExpenses();
  const now = new Date().toISOString().split('T')[0];
  const newExpense: Expense = {
    ...expense,
    id: `exp-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  expenses.push(newExpense);
  saveExpenses(expenses);
  return newExpense;
};

export const updateExpense = (id: string, updates: Partial<Expense>): Expense | null => {
  const expenses = loadExpenses();
  const index = expenses.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString().split('T')[0];
  expenses[index] = { ...expenses[index], ...updates, updatedAt: now };
  saveExpenses(expenses);
  return expenses[index];
};

export const deleteExpense = (id: string): boolean => {
  const expenses = loadExpenses();
  const filtered = expenses.filter((e) => e.id !== id);
  if (filtered.length === expenses.length) return false;
  saveExpenses(filtered);
  return true;
};

// =====================================================
// INCOME STORAGE
// =====================================================

export const loadIncome = (): Income[] => {
  if (!isBrowser) return initialIncome;
  initializeAccountingStorage();
  const data = localStorage.getItem(STORAGE_KEYS.income);
  return data ? JSON.parse(data) : initialIncome;
};

export const saveIncome = (income: Income[]): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.income, JSON.stringify(income));
};

export const addIncome = (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>): Income => {
  const incomeList = loadIncome();
  const now = new Date().toISOString().split('T')[0];
  const newIncome: Income = {
    ...income,
    id: `inc-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  incomeList.push(newIncome);
  saveIncome(incomeList);
  return newIncome;
};

export const updateIncome = (id: string, updates: Partial<Income>): Income | null => {
  const incomeList = loadIncome();
  const index = incomeList.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString().split('T')[0];
  incomeList[index] = { ...incomeList[index], ...updates, updatedAt: now };
  saveIncome(incomeList);
  return incomeList[index];
};

export const deleteIncome = (id: string): boolean => {
  const incomeList = loadIncome();
  const filtered = incomeList.filter((i) => i.id !== id);
  if (filtered.length === incomeList.length) return false;
  saveIncome(filtered);
  return true;
};

// =====================================================
// INVOICES STORAGE
// =====================================================

export const loadInvoices = (): Invoice[] => {
  if (!isBrowser) return initialInvoices;
  initializeAccountingStorage();
  const data = localStorage.getItem(STORAGE_KEYS.invoices);
  return data ? JSON.parse(data) : initialInvoices;
};

export const saveInvoices = (invoices: Invoice[]): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(invoices));
};

export const addInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Invoice => {
  const invoices = loadInvoices();
  const now = new Date().toISOString().split('T')[0];
  const newInvoice: Invoice = {
    ...invoice,
    id: `inv-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  invoices.push(newInvoice);
  saveInvoices(invoices);
  return newInvoice;
};

export const updateInvoice = (id: string, updates: Partial<Invoice>): Invoice | null => {
  const invoices = loadInvoices();
  const index = invoices.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString().split('T')[0];
  invoices[index] = { ...invoices[index], ...updates, updatedAt: now };
  saveInvoices(invoices);
  return invoices[index];
};

export const deleteInvoice = (id: string): boolean => {
  const invoices = loadInvoices();
  const filtered = invoices.filter((i) => i.id !== id);
  if (filtered.length === invoices.length) return false;
  saveInvoices(filtered);
  return true;
};

export const addInvoicePayment = (invoiceId: string, payment: Omit<InvoicePayment, 'id'>): Invoice | null => {
  const invoices = loadInvoices();
  const index = invoices.findIndex((i) => i.id === invoiceId);
  if (index === -1) return null;

  const invoice = invoices[index];
  const newPayment: InvoicePayment = {
    ...payment,
    id: `pay-${Date.now()}`,
  };

  invoice.payments.push(newPayment);
  invoice.paidAmount += payment.amount;
  invoice.balanceAmount = invoice.totalAmount - invoice.paidAmount;

  // Update status based on payment
  if (invoice.balanceAmount <= 0) {
    invoice.status = 'paid';
  } else if (invoice.paidAmount > 0) {
    invoice.status = 'partial';
  }

  invoice.updatedAt = new Date().toISOString().split('T')[0];
  saveInvoices(invoices);
  return invoice;
};

export const generateNextInvoiceNumber = (): string => {
  const invoices = loadInvoices();
  const year = new Date().getFullYear();
  const yearInvoices = invoices.filter((i) => i.invoiceNumber.includes(`INV-${year}`));
  const count = yearInvoices.length + 1;
  return `INV-${year}-${count.toString().padStart(3, '0')}`;
};

// =====================================================
// VENDORS STORAGE
// =====================================================

export const loadVendors = (): Vendor[] => {
  if (!isBrowser) return initialVendors;
  initializeAccountingStorage();
  const data = localStorage.getItem(STORAGE_KEYS.vendors);
  return data ? JSON.parse(data) : initialVendors;
};

export const saveVendors = (vendors: Vendor[]): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.vendors, JSON.stringify(vendors));
};

export const addVendor = (vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt' | 'totalTransactions' | 'totalAmount'>): Vendor => {
  const vendors = loadVendors();
  const now = new Date().toISOString().split('T')[0];
  const newVendor: Vendor = {
    ...vendor,
    id: `vendor-${Date.now()}`,
    totalTransactions: 0,
    totalAmount: 0,
    createdAt: now,
    updatedAt: now,
  };
  vendors.push(newVendor);
  saveVendors(vendors);
  return newVendor;
};

export const updateVendor = (id: string, updates: Partial<Vendor>): Vendor | null => {
  const vendors = loadVendors();
  const index = vendors.findIndex((v) => v.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString().split('T')[0];
  vendors[index] = { ...vendors[index], ...updates, updatedAt: now };
  saveVendors(vendors);
  return vendors[index];
};

export const deleteVendor = (id: string): boolean => {
  const vendors = loadVendors();
  const filtered = vendors.filter((v) => v.id !== id);
  if (filtered.length === vendors.length) return false;
  saveVendors(filtered);
  return true;
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export const resetAccountingData = (): void => {
  if (!isBrowser) return;
  localStorage.removeItem(STORAGE_KEYS.initialized);
  initializeAccountingStorage();
};

export const exportAccountingData = (): string => {
  return JSON.stringify({
    expenses: loadExpenses(),
    income: loadIncome(),
    invoices: loadInvoices(),
    vendors: loadVendors(),
  }, null, 2);
};

export const importAccountingData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    if (data.expenses) saveExpenses(data.expenses);
    if (data.income) saveIncome(data.income);
    if (data.invoices) saveInvoices(data.invoices);
    if (data.vendors) saveVendors(data.vendors);
    return true;
  } catch {
    return false;
  }
};
